import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const googleBtn = document.getElementById("google-login-btn");
const resendBtn = document.getElementById("resend-verification-btn");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      loginError.style.color = '#ff4141';
      loginError.innerHTML = "Email not verified. <button id='resend-verification-btn' style='color:#00ff41;background:none;border:none;cursor:pointer;text-decoration:underline;'>Resend Verification Email</button>";
      document.getElementById('resend-verification-btn').onclick = async () => {
        await sendEmailVerification(userCredential.user);
        loginError.style.color = '#00ff41';
        loginError.textContent = "Verification email resent! Please check your inbox.";
      };
      await auth.signOut();
      return;
    }
    window.location.href = "index.html";
  } catch (err) {
    loginError.style.color = '#ff4141';
    loginError.textContent = err.message;
  }
});

if (googleBtn) {
  googleBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user.emailVerified) {
        loginError.style.color = '#ff4141';
        loginError.innerHTML = "Email not verified. <button id='resend-verification-btn' style='color:#00ff41;background:none;border:none;cursor:pointer;text-decoration:underline;'>Resend Verification Email</button>";
        document.getElementById('resend-verification-btn').onclick = async () => {
          await sendEmailVerification(user);
          loginError.style.color = '#00ff41';
          loginError.textContent = "Verification email resent! Please check your inbox.";
        };
        await auth.signOut();
        return;
      }
      window.location.href = "index.html";
    } catch (err) {
      loginError.style.color = '#ff4141';
      loginError.textContent = err.message;
    }
  });
}
