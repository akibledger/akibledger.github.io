import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    loginError.textContent = err.message;
  }
});
