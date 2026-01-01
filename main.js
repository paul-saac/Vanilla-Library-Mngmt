import { db, auth } from "./shared/scripts/firebaseConfig.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

// ACCOUNT PRFILE
const accountModal = document.querySelector('#modal-account');
const accountdetails = document.getElementById('profile-pic');
const modals = [accountModal];
accountdetails.addEventListener('click', e => {
    e.preventDefault();

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
onAuthStateChanged(auth, user => {
    const box = document.querySelector(".account-details");
    if (box) {
        box.innerHTML = "";
        const emailEl = document.createElement("h4");
        emailEl.textContent = `Email: ${user.email}`;
        box.appendChild(emailEl);
    }
});
// NOTIFICATION
const notifbtn = document.getElementById('notif-btn');
const notifmenu = document.querySelector('.notification-content');

if (notifbtn && notifmenu) {
    notifbtn.addEventListener('click', (e) => {
        e.preventDefault();
        notifmenu.classList.toggle('show');
        notifbtn.classList.toggle('highlight')
    });
}

// DROP DOWN
// ...existing code...
const dropbtn = document.getElementById('dropdown-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');

if (dropbtn && dropdownMenu) {
    dropbtn.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownMenu.classList.toggle('show');
        dropbtn.classList.toggle('rotated');
    });
}

// LOG OUT
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "./auth/login.html"
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
});