import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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
const provider = new GoogleAuthProvider();

const signupForm = document.getElementById("signup-form");
const signupError = document.getElementById("signup-error");
const googleBtn = document.getElementById("google-signup-btn");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "user",
      createdAt: new Date().toISOString()
    });
    await sendEmailVerification(userCredential.user);
    signupError.style.color = '#00ff41';
    signupError.textContent = "Verification email sent! Please check your inbox and verify your email before logging in.";
    signupForm.reset();
  } catch (err) {
    signupError.style.color = '#ff4141';
    signupError.textContent = err.message;
  }
});

if (googleBtn) {
  googleBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Add user to Firestore if new
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user",
        createdAt: new Date().toISOString()
      }, { merge: true });
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        signupError.style.color = '#00ff41';
        signupError.textContent = "Verification email sent! Please check your inbox and verify your email before logging in.";
        await auth.signOut();
      } else {
        window.location.href = "index.html";
      }
    } catch (err) {
      signupError.style.color = '#ff4141';
      signupError.textContent = err.message;
    }
  });
}
