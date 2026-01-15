import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDoc, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

// MODAL FUNCTIONALITIES
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal?.classList.remove("show");
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal?.classList.add("show");
}

function openAddStudentModal() {
    openModal("addstudent-modal");
}

function closeAddStudentModal() {
    closeModal("addstudent-modal");
}


// ADD STUDENT MODAL
function AddStudentInputs() {
    return {
        studentnum: document.getElementById("studentnum"),
        firstname: document.getElementById("firstname"),
        lastname: document.getElementById("lastname"),
        year: document.getElementById("year"),
        program: document.getElementById("program"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone")
    };
}

async function handleAddStudent() {
    const f = AddStudentInputs();

    const studentnum = f.studentnum?.value.trim() ?? "";
    const firstname = f.firstname?.value.trim() ?? "";
    const lastname = f.lastname?.value.trim() ?? "";

    const year = f.year?.value.trim() || "N/A";
    const program = f.program?.value.trim() || "N/A";
    const email = f.email?.value.trim() || "N/A";
    const phone = f.phone?.value.trim() || "N/A";

    if (!studentnum) return alert("Please enter a student number.");
    if (!firstname) return alert("Please enter a first name.");
    if (!lastname) return alert("Please enter a last name.");
    if (!phone) return alert("Please enter a phone number.");

    const bookRef = doc(db, "Students", studentnum);

    try {
        const existing = await getDoc(bookRef);
        if (existing.exists()) {
            return alert("A book with this ISBN already exists. Use Edit instead.");
        }

        await setDoc(bookRef, {
            id: studentnum,
            firstName: firstname,
            lastName: lastname,
            year,
            department: program,
            email,
            phone,
            Membersince: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        // resetAddstudentModal();
        closeAddStudentModal(); // already calls resetAddBookForm() in your code
    } catch (err) {
        console.error(err);
        alert("Failed to add student.");
    }
}
// DOM EVENT DELEGATION
//ADDSTUDENT BUTTON
document.addEventListener("click", (e) => {
  if (e.target.closest("#addStudentBtn")) {
    openAddStudentModal();
  }
});

// CANCEL BUTTON
document.addEventListener("click", (e) => {
  if (!e.target.closest("#addstudent-cancel")) return;
//   resetAddBookForm();
  closeAddStudentModal();
});

// Add modal buttons
document.addEventListener("click", (e) => {
  if (e.target.closest("#addstudent-cancel")) closeAddStudentModal();
  if (e.target.closest("#addstudent-submit")) handleAddStudent(); // keep your existing add logic
});