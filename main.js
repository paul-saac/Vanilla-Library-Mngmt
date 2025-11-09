import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
 
// SIDEBAR RESPONSIVE
const sidebar = document.getElementById('sidebar')

function toggleSidebar() {  
    sidebar.classList.toggle('show')
}

// SIDEBAR SELECTOR
const sidebarLinks = document.querySelectorAll('aside ul li a');

sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        // Remove 'active' from all
        sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
        // Add 'active' to the clicked one
        this.parentElement.classList.add('active');
    });
});

const accountdetails = document.getElementById('profile-pic');

accountdetails?.addEventListener('click', e => {
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