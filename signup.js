import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

const signupForm = document.getElementById("signup-form");
const signupError = document.getElementById("signup-error");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Add user to Firestore with role: 'user'
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "user",
      createdAt: new Date().toISOString()
    });
    window.location.href = "login.html";
  } catch (err) {
    signupError.textContent = err.message;
  }
});
