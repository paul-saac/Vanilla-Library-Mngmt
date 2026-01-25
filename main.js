import { auth } from "./shared/scripts/firebaseConfig.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


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

// Set active link based on current hash/route
function setActiveLink() {
    const currentHash = window.location.hash || '#/';

    sidebarLinks.forEach(link => {
        const linkHash = link.getAttribute('href');
        link.parentElement.classList.remove('active');

        if (linkHash === currentHash) {
            link.parentElement.classList.add('active');
        }
    });
}
// Call on page load
setActiveLink();
// Call whenever hash changes
window.addEventListener('hashchange', setActiveLink);



// // ACCOUNT PRFILE
const accountEmailEl = document.getElementById('account-email');
onAuthStateChanged(auth, user => {
    if (accountEmailEl) {
        accountEmailEl.textContent = user?.email || '';
    }
});



// NOTIFICATION
// const notifbtn = document.getElementById('notif-btn');
// const notifmenu = document.querySelector('.notification-content');

// if (notifbtn && notifmenu) {
//     notifbtn.addEventListener('click', (e) => {
//         e.preventDefault();
//         notifmenu.classList.toggle('show');
//         notifbtn.classList.toggle('highlight')
//     });
// }

// DROP DOWN
// ...existing code...
const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');

let onDocClick = null;
let onKeyDown = null;

function openDropdown() {
    if (!dropdownBtn || !dropdownMenu) return;
    dropdownMenu.classList.add('show');
    dropdownBtn.classList.add('rotated');
    dropdownBtn.setAttribute('aria-expanded', 'true');

    onDocClick = (e) => {
        const inside = e.target.closest('.dropdown');
        if (!inside) closeDropdown();
    };
    onKeyDown = (e) => {
        if (e.key === 'Escape') closeDropdown();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
}

function closeDropdown() {
    if (!dropdownBtn || !dropdownMenu) return;
    dropdownMenu.classList.remove('show');
    dropdownBtn.classList.remove('rotated');
    dropdownBtn.setAttribute('aria-expanded', 'false');

    if (onDocClick) { document.removeEventListener('click', onDocClick); onDocClick = null; }
    if (onKeyDown) { document.removeEventListener('keydown', onKeyDown); onKeyDown = null; }
}

if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdownMenu.classList.contains('show')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });
    // prevent clicks inside the menu from closing it
    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
}



// LOG OUT
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html"
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
});