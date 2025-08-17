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
notificationBadge.style.cursor = 'pointer';
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

// Add logic for 'I don't remember' date option
const dateInput = document.getElementById('date');
const dateUnknown = document.getElementById('date-unknown');
if (dateInput && dateUnknown) {
  dateUnknown.addEventListener('change', () => {
    if (dateUnknown.checked) {
      dateInput.disabled = true;
      dateInput.value = '';
    } else {
      dateInput.disabled = false;
      setCurrentDate();
    }
  });
}

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
    let date = dateInput ? dateInput.value : '';
    if (dateUnknown && dateUnknown.checked) {
      date = "I don't remember";
    }
    const category = document.getElementById("category").value;
    if (!name || !amount || !reason || (!date && !dateUnknown.checked)) {
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
      if (dateUnknown) dateUnknown.checked = false;
      if (dateInput) dateInput.disabled = false;
      loadEntries();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// Filter controls
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const searchEntries = document.getElementById('search-entries');

let allEntries = [];

if (filterType) filterType.addEventListener('change', applyFilters);
if (filterCategory) filterCategory.addEventListener('change', applyFilters);
if (searchEntries) searchEntries.addEventListener('input', applyFilters);

async function loadEntries() {
  if (entriesList) entriesList.innerHTML = "<div>Loading...</div>";
  if (entriesOngoingList) entriesOngoingList.innerHTML = "<div>Loading...</div>";
  if (entriesArchiveList) entriesArchiveList.innerHTML = "<div>Loading...</div>";
  const q = query(ledgerCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  allEntries = [];
  allRequests = [];
  snapshot.forEach(docSnap => {
    const entry = { id: docSnap.id, ...docSnap.data() };
    allEntries.push(entry);
    if (entry.confirmationRequests && entry.confirmationRequests.length > 0 && entry.status !== 'paid') {
      allRequests.push({ entryId: entry.id, requests: entry.confirmationRequests });
    }
  });
  applyFilters();
  updateStats(allEntries);
  updateAdminNotification();
}

function applyFilters() {
  let filtered = allEntries.slice();
  const typeVal = filterType ? filterType.value : 'all';
  const catVal = filterCategory ? filterCategory.value : 'all';
  const searchVal = searchEntries ? searchEntries.value.trim().toLowerCase() : '';

  if (typeVal !== 'all') filtered = filtered.filter(e => e.type === typeVal);
  if (catVal !== 'all') filtered = filtered.filter(e => e.category === catVal);
  if (searchVal) {
    filtered = filtered.filter(e =>
      (e.name && e.name.toLowerCase().includes(searchVal)) ||
      (e.reason && e.reason.toLowerCase().includes(searchVal)) ||
      (e.category && e.category.toLowerCase().includes(searchVal))
    );
  }
  const ongoing = filtered.filter(e => e.status !== 'paid');
  const archive = filtered.filter(e => e.status === 'paid');
  renderEntries(ongoing, entriesOngoingList, false);
  renderEntries(archive, entriesArchiveList, true);
}

let allRequests = [];

function updateAdminNotification() {
  if (currentUserRole === 'admin' && allRequests.length > 0) {
    notificationBadge.textContent = `${allRequests.reduce((sum, r) => sum + r.requests.length, 0)} new request(s)`;
    notificationBadge.style.display = '';
  } else {
    notificationBadge.style.display = 'none';
  }
}

// Modal logic
const matrixModal = document.getElementById('matrix-modal');
const matrixModalBody = document.getElementById('matrix-modal-body');
const matrixModalClose = document.getElementById('matrix-modal-close');
function showModal(html) {
  matrixModalBody.innerHTML = `<div class='matrix-modal-body'>${html}</div>`;
  matrixModal.classList.add('show');
  matrixModal.classList.remove('hidden');
}
function closeModal() {
  matrixModal.classList.remove('show');
  matrixModal.classList.add('hidden');
}
matrixModalClose.onclick = closeModal;
matrixModal.onclick = (e) => { if (e.target === matrixModal) closeModal(); };

notificationBadge.onclick = async () => {
  if (currentUserRole === 'admin' && allRequests.length > 0) {
    let totalRequests = allRequests.reduce((sum, r) => sum + r.requests.length, 0);
    if (totalRequests === 0) {
      showModal('<h3>No outstanding requests.</h3>');
      return;
    }
    let html = `<h3>All Payment Confirmation Requests</h3><ul style='margin-bottom:1.2rem;'>`;
    for (const entry of allRequests) {
      const entryDoc = await getDoc(doc(db, 'ledgerEntries', entry.entryId));
      const entryData = entryDoc.exists() ? entryDoc.data() : {};
      html += `<li style='margin-bottom:0.7em;'><b>${entryData.name || 'Unknown'}</b> - <span style='color:#a259c6;'>${entryData.reason || ''}</span><ul style='margin:0.5em 0 0.5em 1.2em;'>`;
      for (const req of entry.requests) {
        let uid, message;
        if (typeof req === 'string') { uid = req; message = ''; } else { uid = req.uid; message = req.message || ''; }
        const userDoc = await getDoc(doc(db, 'users', uid));
        const email = userDoc.exists() ? userDoc.data().email : uid;
        html += `<li style='margin-bottom:0.3em;'><span style='color:#00ff41;'>${email}</span>${message ? `<span style='color:#baffc9;font-size:0.97em;'> — ${message}</span>` : ''}
        <button class='modal-btn accept' data-uid='${uid}' data-entry='${entry.entryId}' style='margin-left:0.7em;background:#00ff41;color:#000;'>Accept</button>
        <button class='modal-btn reject' data-uid='${uid}' data-entry='${entry.entryId}' style='margin-left:0.7em;'>Reject</button></li>`;
      }
      html += `</ul></li>`;
    }
    html += `</ul><button class='modal-btn reject' id='reject-all-requests-btn'>Reject All</button>`;
    showModal(html);
    // Attach accept/reject handlers after modal is rendered
    setTimeout(() => {
      document.querySelectorAll('.modal-btn.accept[data-uid]').forEach(btn => {
        btn.onclick = async () => {
          const uid = btn.getAttribute('data-uid');
          const eid = btn.getAttribute('data-entry');
          // Show modal to enter message
          let html = `<h3>Mark as Paid</h3><label for='paid-message'>Add a message (optional):</label><textarea id='paid-message' placeholder='Transaction ID, payment method, etc.'></textarea><button class='modal-btn' id='confirm-paid-btn'>Confirm Paid</button>`;
          showModal(html);
          document.getElementById('confirm-paid-btn').onclick = async () => {
            const msg = document.getElementById('paid-message').value.trim();
            await updateDoc(doc(db, 'ledgerEntries', eid), { status: "paid", paidMessage: msg, confirmationRequests: [] });
            closeModal();
            showToast("Marked as paid!", "success");
            loadEntries();
          };
        };
      });
      document.querySelectorAll('.modal-btn.reject[data-uid]').forEach(btn => {
        btn.onclick = async () => {
          const uid = btn.getAttribute('data-uid');
          const eid = btn.getAttribute('data-entry');
          const entryRef = doc(db, 'ledgerEntries', eid);
          const entrySnap = await getDoc(entryRef);
          if (entrySnap.exists()) {
            let reqs = (entrySnap.data().confirmationRequests || []);
            reqs = reqs.filter(r => (typeof r === 'string' ? r !== uid : r.uid !== uid));
            await updateDoc(entryRef, { confirmationRequests: reqs });
            showToast('Request rejected.', 'success');
            closeModal();
            loadEntries();
          }
        };
      });
      document.getElementById('reject-all-requests-btn').onclick = async () => {
        // Remove all requests from all entries
        await Promise.all(allRequests.map(async entry => {
          await updateDoc(doc(db, 'ledgerEntries', entry.entryId), {
            confirmationRequests: [],
            status: 'pending'
          });
        }));
        closeModal();
        showToast('All requests rejected. All entries set to unpaid.', 'success');
        loadEntries();
      };
    }, 100);
  }
};

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
    let formattedDate = entry.date === "I don't remember" ? "I don't remember" : formatDate(entry.date);
    let statusText = entry.status === "paid" ? `<span style='color:#00ff41;'>Paid</span>` : `<span style='color:#ff4141;'>Pending</span>`;
    let actions = "";
    // Admin controls (show delete for archive too)
    if ((currentUserRole === "admin" && (!isArchive || isArchive))) {
      actions = `
        ${!isArchive ? `<button class="btn-edit" data-id="${entry.id}" title="Edit Entry"><i class="fas fa-edit"></i> <span style='font-size:0.95rem;'>Edit</span></button>` : ''}
        <button class="btn-delete" data-id="${entry.id}" title="Delete Entry"><i class="fas fa-trash"></i> <span style='font-size:0.95rem;'>Delete</span></button>
        ${!isArchive && entry.status !== "paid" ? `<button class="btn-primary btn-paid" data-id="${entry.id}" title="Mark as Paid">Mark as Paid</button>` : ""}
      `;
    } else if (!isArchive && currentUser && entry.status !== "paid") {
      // Normal user: can request confirmation if not already requested
      const alreadyRequested = Array.isArray(entry.confirmationRequests) && entry.confirmationRequests.some(r => (typeof r === 'string' ? r === currentUser.uid : r.uid === currentUser.uid));
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
        <div class="entry-actions${((currentUserRole === "admin" && (!isArchive || isArchive)) || (!isArchive && currentUser)) ? '' : ' hidden'}">
          ${actions}
        </div>
        ${requestsInfo}
      </div>
      ${entry.paidMessage && isArchive ? `<div class='matrix-modal-body' style='margin-top:0.7em;'><b>Paid Message:</b><br><span style='color:#baffc9;'>${entry.paidMessage}</span></div>` : ''}
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
        // Show modal to enter message
        let html = `<h3>Mark as Paid</h3><label for='paid-message'>Add a message (optional):</label><textarea id='paid-message' placeholder='Transaction ID, payment method, etc.'></textarea><button class='modal-btn' id='confirm-paid-btn'>Confirm Paid</button>`;
        showModal(html);
        document.getElementById('confirm-paid-btn').onclick = async () => {
          const msg = document.getElementById('paid-message').value.trim();
          await updateDoc(doc(db, "ledgerEntries", btn.dataset.id), { status: "paid", paidMessage: msg });
          closeModal();
          showToast("Marked as paid!", "success");
          loadEntries();
        };
      };
    });
    document.querySelectorAll(".btn-request").forEach(btn => {
      btn.onclick = async e => {
        if (!currentUser) return;
        // Show modal for user to enter a message
        let html = `<h3>Request Payment Confirmation</h3><label for='request-message'>Add a message (optional):</label><textarea id='request-message' placeholder='Transaction ID, payment method, note...'></textarea><button class='modal-btn' id='confirm-request-btn'>Send Request</button>`;
        showModal(html);
        document.getElementById('confirm-request-btn').onclick = async () => {
          const msg = document.getElementById('request-message').value.trim();
          // Get entry
          const entryRef = doc(db, 'ledgerEntries', btn.dataset.id);
          const entrySnap = await getDoc(entryRef);
          let reqs = entrySnap.exists() && Array.isArray(entrySnap.data().confirmationRequests) ? entrySnap.data().confirmationRequests : [];
          // Remove any previous request by this user
          reqs = reqs.filter(r => (typeof r === 'string' ? r !== currentUser.uid : r.uid !== currentUser.uid));
          reqs.push({ uid: currentUser.uid, message: msg });
          await updateDoc(entryRef, { confirmationRequests: reqs });
          closeModal();
          showToast("Request sent!", "success");
          loadEntries();
        };
      };
    });
    document.querySelectorAll('.requests-info.clickable').forEach(div => {
      div.onclick = async e => {
        const entryId = div.getAttribute('data-entry-id');
        const entry = allRequests.find(r => r.entryId === entryId);
        if (!entry || !entry.requests.length) {
          showModal('<h3>No requests for this entry.</h3>');
          return;
        }
        // Fetch user emails and messages by UID
        const emails = await Promise.all(entry.requests.map(async req => {
          let uid, message;
          if (typeof req === 'string') { uid = req; message = ''; } else { uid = req.uid; message = req.message || ''; }
          const userDoc = await getDoc(doc(db, 'users', uid));
          return { uid, email: userDoc.exists() ? userDoc.data().email : uid, message };
        }));
        let html = `<h3>Payment Confirmation Requests</h3><ul style='margin-bottom:1.2rem;'>`;
        emails.forEach(({uid, email, message}) => {
          html += `<li style='display:flex;flex-direction:column;gap:0.2em;margin-bottom:0.7em;'><span style='color:#00ff41;'>${email}</span>${message ? `<span style='color:#baffc9;font-size:0.97em;'>${message}</span>` : ''}<button class='modal-btn reject' data-uid='${uid}' data-entry='${entryId}' style='margin-top:0.3em;width:max-content;'>Reject</button></li>`;
        });
        html += `</ul>`;
        html += `<button class='modal-btn reject' id='reject-requests-btn'>Reject All</button>`;
        showModal(html);
        // Individual reject
        document.querySelectorAll('.modal-btn.reject[data-uid]').forEach(btn => {
          btn.onclick = async () => {
            const uid = btn.getAttribute('data-uid');
            const eid = btn.getAttribute('data-entry');
            const entryRef = doc(db, 'ledgerEntries', eid);
            const entrySnap = await getDoc(entryRef);
            if (entrySnap.exists()) {
              let reqs = (entrySnap.data().confirmationRequests || []);
              reqs = reqs.filter(r => (typeof r === 'string' ? r !== uid : r.uid !== uid));
              await updateDoc(entryRef, { confirmationRequests: reqs });
              showToast('Request rejected.', 'success');
              closeModal();
              loadEntries();
            }
          };
        });
        // Reject all
        document.getElementById('reject-requests-btn').onclick = async () => {
          await updateDoc(doc(db, 'ledgerEntries', entryId), {
            confirmationRequests: [],
            status: 'pending'
          });
          closeModal();
          showToast('All requests rejected. Entry set to unpaid.', 'success');
          loadEntries();
        };
      };
    });
  } else {
    // Archive: allow admin to delete
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

function formatDate(dateStr) {
  if (!dateStr || dateStr === "I don't remember") return "I don't remember";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

loadEntries();
