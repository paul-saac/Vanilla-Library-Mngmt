import { auth, db } from "../shared/scripts/firebaseConfig.js";
import { signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// LOGIN
const emailinput = document.getElementById('email');
const passwordinput = document.getElementById('password');
const loginform = document.getElementById('login-form');

loginform.addEventListener("submit", (e) => {
  e.preventDefault();

  const loginemail = emailinput.value;
  const loginpassword = passwordinput.value;

  signInWithEmailAndPassword(auth, loginemail, loginpassword)
    .then((userCredential) => {
      //FUNCTION FOR LOGIN 
      window.location.href = "home.html";
      emailinput.value = "";
      passwordinput.value =  "";
      alert("Signed-in")
    })
    .catch((error) => {
      
    });
});

