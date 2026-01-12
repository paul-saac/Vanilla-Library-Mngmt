import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let unsubscribe = null;

function enterStudentsPage() {
    if (unsubscribe) return; // already listening

    const q = query(collection(db, "Students"), orderBy("firstName", "asc"));

    unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const students = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            renderStudents(students);
        },
        (err) => console.error(err)
    );
}

function leaveStudentsPage() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
}

function renderStudents(students) {
    const tbody = document.querySelector(".members-container tbody");

    if (!tbody) {
        // Try again on next frame
        requestAnimationFrame(() => renderStudents(students));
        return;
    }

    tbody.innerHTML = students.map(createStudentsRow).join("");
}


function createStudentsRow(student) {
    const {
        id = "",
        firstName = "Untitled",
        lastName = "Unknown Author",
        phone = "N/A",
        year = "",
        department = "Unavailable",
        email = "N/A"
    } = student;


    return `
        <tr class="student-data">
            <td class="td-name">${lastName || 'N/A'}, ${firstName || 'N/A'} <br> 
                <span class="student-email">${email || 'N/A'}</span>
            </td>
            <td>${id || 'N/A'}</td>
            <td>${phone || 'N/A'}</td>
            <td>${department || 'N/A'}</td>
            <td>${year || 'N/A'}</td>
            <td> 
                <div class="student-actions">
                    <div class="edit-student">
                        <img src="/shared/styles/icons/editstudent.svg" alt="" width="13px" height="13px">
                    </div>
                    <div class="delete-student">
                        <img src="/shared/styles/icons/deletestudent.svg" alt="" width="13px" height="13px">
                    </div>
                </div>
            
            </td>
        </tr>
    `;

}

window.addEventListener("hashchange", () => {
    if (location.hash === "#/students" || location.hash === "") {
        enterStudentsPage();
    } else {
        leaveStudentsPage();
    }
});
// MAIN INVOKE
enterStudentsPage();





document.addEventListener('click', (e) => {

    const allBtn = e.target.closest('.filter-all .filter');
    const courseBtn = e.target.closest('.filter-course .filter');
    const yearBtn = e.target.closest('.filter-year .filter');

    const allFilterBtn = document.querySelector('.filter-all .filter');
    const courseFilters = document.querySelectorAll('.filter-course .filter');
    const yearFilters = document.querySelectorAll('.filter-year .filter');

    if (allBtn) {
        courseFilters.forEach(f => f.classList.remove('filter-active'));
        yearFilters.forEach(f => f.classList.remove('filter-active'));
        allFilterBtn.classList.add('filter-active');
    }

    if (courseBtn) {
        allFilterBtn.classList.remove('filter-active');

        if (courseBtn.classList.contains('filter-active')) {
            courseBtn.classList.remove('filter-active');
            return;
        }
        courseBtn.classList.add('filter-active');
    }

    if (yearBtn) {
        allFilterBtn.classList.remove('filter-active');

        if (yearBtn.classList.contains('filter-active')) {
            yearBtn.classList.remove('filter-active');
            return;
        }

        yearBtn.classList.add('filter-active');
    }
});

