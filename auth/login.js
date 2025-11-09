import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBzVudrq_MK5GXiVIlrsDRV5XtGPZ8K5ro",
    authDomain: "library-sys-53d31.firebaseapp.com",
    projectId: "library-sys-53d31",
    storageBucket: "library-sys-53d31.firebasestorage.app",
    messagingSenderId: "593530003665",
    appId: "1:593530003665:web:25dbd6cd027a2f191225f0",
    measurementId: "G-HBYTYZBV6B"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Handle Google Login
const googleLoginBtn = document.getElementById("googleLoginBtn");

googleLoginBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // Prevent form submission
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // ✅ Redirect to homepage
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    alert("Google Sign-In failed. Please try again.");
  }
});

