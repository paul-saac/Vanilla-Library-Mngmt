import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { auth } from './auth/login.js';
// SIDEBAR RESPONSIVE
const sidebar = document.getElementById('sidebar')

function toggleSidebar() {
    sidebar.classList.toggle('show')
}

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