import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
// import { getFirestore} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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
export { app, auth};

// SIDEBAR RESPONSIVE
const sidebar = document.getElementById('sidebar')

function toggleSidebar() {
    sidebar.classList.toggle('show')
}

// ===========================================================================================================
// SIDEBAR SELECTOR FOR HOVER
const sidebarLinks = document.querySelectorAll('aside ul li a');

sidebarLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        // Remove 'active' from all
        sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
        // Add 'active' to the clicked one
        this.parentElement.classList.add('active');
    });
});

const accountModal = document.querySelector('#modal-account');
const accountdetails = document.getElementById('profile-pic');
const modals = [accountModal];

accountdetails.addEventListener('click', e => {
    e.preventDefault();
    console.log("pepe");
    accountModal.classList.add('show');

});
modals.forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});
function closeAllModals() {
    modals.forEach(modal => modal.classList.remove('show'));
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        getItems(user.uid);

        const accountDetailsBox = document.querySelector(".account-details");
        if (accountDetailsBox) {
            const accountEmail = document.createElement("h4");
            accountEmail.innerText = `Email: ${user.email}`;
            accountDetailsBox.appendChild(accountEmail);
        }
    } else {
        todoListUL.innerHTML = "";
    }
});