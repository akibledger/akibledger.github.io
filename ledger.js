import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBF4bGpzYy2Smq6w8e5cT769qsr1WRcJhg",
  authDomain: "akib-ledger.firebaseapp.com",
  projectId: "akib-ledger",
  storageBucket: "akib-ledger.firebasestorage.app",
  messagingSenderId: "392348958588",
  appId: "1:392348958588:web:0fffa49d90c179f1832ef9",
  measurementId: "G-HRVMRX9PKH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ledgerCollection = collection(db, "ledgerEntries");

const appContainer = document.getElementById("app-container");
const logoutBtn = document.getElementById("logout-btn");
const loginBtn = document.getElementById("login-btn");
const userEmail = document.getElementById("user-email");
const entryFormContainer = document.getElementById("entry-form-container");
const entryForm = document.getElementById("entry-form");
const entriesList = document.getElementById("entries");
const entriesOngoingList = document.getElementById("entries-ongoing");
const entriesArchiveList = document.getElementById("entries-archive");
const toast = document.getElementById("toast");

const notificationBadge = document.createElement('span');
notificationBadge.id = 'admin-notification';
notificationBadge.style.display = 'none';
notificationBadge.style.background = '#00ff41';
notificationBadge.style.color = '#000';
notificationBadge.style.fontWeight = 'bold';
notificationBadge.style.borderRadius = '8px';
notificationBadge.style.padding = '0.2rem 0.7rem';
notificationBadge.style.marginLeft = '1rem';
notificationBadge.style.fontSize = '1rem';
notificationBadge.style.boxShadow = '0 0 8px #00ff41cc';
userEmail.parentNode.insertBefore(notificationBadge, userEmail.nextSibling);

let currentUser = null;
let currentUserRole = null;

loginBtn.addEventListener("click", () => {
  window.location.href = "login.html";
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  showToast("Logged out!", "success");
});

onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (user) {
    userEmail.textContent = user.email;
    logoutBtn.classList.remove("hidden");
    loginBtn.classList.add("hidden");
    // Fetch user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    currentUserRole = userDoc.exists() ? userDoc.data().role : null;
    if (currentUserRole === "admin") {
      entryFormContainer.classList.remove("hidden");
    } else {
      entryFormContainer.classList.add("hidden");
    }
    loadEntries();
  } else {
    currentUserRole = null;
    userEmail.textContent = "";
    logoutBtn.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    entryFormContainer.classList.add("hidden");
    loadEntries();
  }
});

if (entryForm) {
  entryForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (currentUserRole !== "admin") {
      showToast("Only admin can add entries!", "error");
      return;
    }
    const type = document.getElementById("type").value;
    const name = document.getElementById("name").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const reason = document.getElementById("reason").value.trim();
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    if (!name || !amount || !reason || !date) {
      showToast("Please fill all required fields!", "error");
      return;
    }
    try {
      await addDoc(ledgerCollection, {
        type,
        name,
        amount,
        reason,
        date,
        category,
        status: "pending",
        confirmationRequests: [],
        createdAt: serverTimestamp()
      });
      showToast("Entry added!", "success");
      entryForm.reset();
      setCurrentDate();
      loadEntries();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

let allRequests = [];

async function loadEntries() {
  if (entriesList) entriesList.innerHTML = "<div>Loading...</div>";
  if (entriesOngoingList) entriesOngoingList.innerHTML = "<div>Loading...</div>";
  if (entriesArchiveList) entriesArchiveList.innerHTML = "<div>Loading...</div>";
  const q = query(ledgerCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const entries = [];
  allRequests = [];
  snapshot.forEach(docSnap => {
    const entry = { id: docSnap.id, ...docSnap.data() };
    entries.push(entry);
    if (entry.confirmationRequests && entry.confirmationRequests.length > 0 && entry.status !== 'paid') {
      allRequests.push({ entryId: entry.id, requests: entry.confirmationRequests });
    }
  });
  // Split into ongoing and archive
  const ongoing = entries.filter(e => e.status !== 'paid');
  const archive = entries.filter(e => e.status === 'paid');
  renderEntries(ongoing, entriesOngoingList, false);
  renderEntries(archive, entriesArchiveList, true);
  updateStats(entries);
  updateAdminNotification();
}

function updateAdminNotification() {
  if (currentUserRole === 'admin' && allRequests.length > 0) {
    notificationBadge.textContent = `${allRequests.reduce((sum, r) => sum + r.requests.length, 0)} new request(s)`;
    notificationBadge.style.display = '';
  } else {
    notificationBadge.style.display = 'none';
  }
}

function renderEntries(entries, targetList, isArchive) {
  if (!targetList) return;
  if (!entries.length) {
    targetList.innerHTML = `<div class="no-entries"><i class="fas fa-inbox"></i><p>No entries found</p></div>`;
    return;
  }
  targetList.innerHTML = "";
  entries.forEach(entry => {
    const entryEl = document.createElement("div");
    entryEl.className = `entry-item ${entry.type}`;
    const formattedAmount = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(entry.amount);
    const formattedDate = new Date(entry.date).toLocaleDateString();
    let statusText = entry.status === "paid" ? `<span style='color:#00ff41;'>Paid</span>` : `<span style='color:#ff4141;'>Pending</span>`;
    let actions = "";
    // Admin controls (only for ongoing)
    if (!isArchive && currentUserRole === "admin") {
      actions = `
        <button class="btn-edit" data-id="${entry.id}" title="Edit Entry"><i class="fas fa-edit"></i> <span style='font-size:0.95rem;'>Edit</span></button>
        <button class="btn-delete" data-id="${entry.id}" title="Delete Entry"><i class="fas fa-trash"></i> <span style='font-size:0.95rem;'>Delete</span></button>
        ${entry.status !== "paid" ? `<button class="btn-primary btn-paid" data-id="${entry.id}" title="Mark as Paid">Mark as Paid</button>` : ""}
      `;
    } else if (!isArchive && currentUser && entry.status !== "paid") {
      // Normal user: can request confirmation if not already requested
      const alreadyRequested = entry.confirmationRequests?.includes(currentUser.uid);
      actions = alreadyRequested
        ? `<div style='color:#00ff41;font-size:0.95rem;'>Requested</div>`
        : `<button class="btn-primary btn-request" data-id="${entry.id}" title="Request Payment Confirmation">Request Payment Confirmation</button>`;
    }
    // Requests info clickable for admin (only for ongoing)
    let requestsInfo = '';
    if (!isArchive && currentUserRole === "admin") {
      requestsInfo = `<div class="requests-info clickable" title="Click to view requesters" data-entry-id="${entry.id}">Requests: ${entry.confirmationRequests?.length || 0}</div>`;
    } else {
      requestsInfo = `<div class="requests-info">Requests: ${entry.confirmationRequests?.length || 0}</div>`;
    }
    entryEl.innerHTML = `
      <div class="entry-details">
        <h4>${entry.name}</h4>
        <p>${entry.reason}</p>
        <small>${formattedDate}</small>
      </div>
      <div class="entry-meta">
        <div class="entry-amount ${entry.type}">${entry.type === 'get' ? '+' : '-'}${formattedAmount}</div>
        <div class="entry-category">${entry.category}</div>
        <div class="entry-status">${statusText}</div>
        <div class="entry-actions${(!isArchive && (currentUserRole === "admin" || currentUser)) ? '' : ' hidden'}">
          ${actions}
        </div>
        ${requestsInfo}
      </div>
    `;
    targetList.appendChild(entryEl);
  });
  // Attach handlers only for ongoing
  if (!isArchive) {
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.onclick = async e => {
        if (currentUserRole !== "admin") return;
        if (confirm("Delete this entry?")) {
          await deleteDoc(doc(db, "ledgerEntries", btn.dataset.id));
          showToast("Entry deleted!", "success");
          loadEntries();
        }
      };
    });
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.onclick = async e => {
        if (currentUserRole !== "admin") return;
        const entries = await getDocs(ledgerCollection);
        const entry = Array.from(entries.docs).find(en => en.id === btn.dataset.id)?.data();
        if (!entry) return;
        await deleteDoc(doc(db, "ledgerEntries", btn.dataset.id));
        document.getElementById("type").value = entry.type;
        document.getElementById("name").value = entry.name;
        document.getElementById("amount").value = entry.amount;
        document.getElementById("reason").value = entry.reason;
        document.getElementById("date").value = entry.date;
        document.getElementById("category").value = entry.category;
        showToast("Entry loaded for editing. Update and submit to save.", "success");
      };
    });
    document.querySelectorAll(".btn-paid").forEach(btn => {
      btn.onclick = async e => {
        if (currentUserRole !== "admin") return;
        await updateDoc(doc(db, "ledgerEntries", btn.dataset.id), { status: "paid" });
        showToast("Marked as paid!", "success");
        loadEntries();
      };
    });
    document.querySelectorAll(".btn-request").forEach(btn => {
      btn.onclick = async e => {
        if (!currentUser) return;
        await updateDoc(doc(db, "ledgerEntries", btn.dataset.id), {
          confirmationRequests: arrayUnion(currentUser.uid)
        });
        showToast("Request sent!", "success");
        loadEntries();
      };
    });
    document.querySelectorAll('.requests-info.clickable').forEach(div => {
      div.onclick = async e => {
        const entryId = div.getAttribute('data-entry-id');
        const entry = allRequests.find(r => r.entryId === entryId);
        if (!entry || !entry.requests.length) {
          showToast('No requests for this entry.', 'info');
          return;
        }
        // Fetch user emails by UID
        const emails = await Promise.all(entry.requests.map(async uid => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          return userDoc.exists() ? userDoc.data().email : uid;
        }));
        alert('Requesters:\n' + emails.join('\n'));
      };
    });
  }
}

function updateStats(entries) {
  const receivables = entries.filter(e => e.type === 'get').reduce((sum, e) => sum + e.amount, 0);
  const payables = entries.filter(e => e.type === 'owe').reduce((sum, e) => sum + e.amount, 0);
  const netBalance = receivables - payables;
  document.getElementById('total-receivable').textContent = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(receivables);
  document.getElementById('total-payable').textContent = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(payables);
  document.getElementById('net-balance').textContent = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(netBalance);
  const netBalanceEl = document.getElementById('net-balance');
  netBalanceEl.className = 'stat-amount';
  if (netBalance > 0) netBalanceEl.classList.add('positive');
  else if (netBalance < 0) netBalanceEl.classList.add('negative');
}

function setCurrentDate() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = today;
}
setCurrentDate();

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  setTimeout(() => { toast.classList.add('show'); }, 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.classList.add('hidden'); }, 300);
  }, 3000);
}

loadEntries();
