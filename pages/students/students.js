import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDoc, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let unsubscribe = null;
let editingStudentId = null;

function enterStudentsPage() {
    if (unsubscribe) return; // already listening

    const q = query(collection(db, "Students"), orderBy("lastName", "asc"));

    unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const students = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            allStudents = students;
            applySearchAndRender();
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
        <tr class="student-row" data-id="${id}">
            <td class="td-name">${lastName || 'N/A'}, ${firstName || 'N/A'} <br> 
                <span class="student-email">${email || 'N/A'}</span>
            </td>
            <td>${id || 'N/A'}</td>
            <td>${phone || 'N/A'}</td>
            <td>${department || 'N/A'}</td>
            <td>${year || 'N/A'}</td>
            <td> 
                <div class="student-actions">
                    <div class="edit-student" data-action="edit" data-id="${id}">
                        <img src="/shared/styles/icons/editstudent.svg" alt="" width="13px" height="13px">
                    </div>
                    <div class="delete-student" data-action="delete" data-id="${id}">
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

function openEditStudentModal() {
    openModal("editstudent-modal");
}

function closeEditStudentModal() {
    closeModal("editstudent-modal");
}

function openConfirmationModal() {
    openModal("deletestudent-modal");
}

function closeConfirmationModal() {
    closeModal("deletestudent-modal")
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

function resetAddStudent() {
    const f = AddStudentInputs();

    if (f.studentnum) {
        f.studentnum.value = "";
        f.studentnum.disabled = false; // in case you ever disable it
    }
    if (f.firstname) f.firstname.value = "";
    if (f.lastname) f.lastname.value = "";
    if (f.year) f.year.value = "";
    if (f.program) f.program.value = "";
    if (f.email) f.email.value = "";
    if (f.phone) f.phone.value = "";
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

        closeAddStudentModal(); // already calls resetAddBookForm() in your code
        resetAddStudent();
    } catch (err) {
        console.error(err);
        alert("Failed to add student.");
    }
}


//  EDIT STUDENT JS
function EditStudentInputs() {
    return {
        studentnum: document.getElementById("data-studentnum"),
        firstname: document.getElementById("data-firstname"),
        lastname: document.getElementById("data-lastname"),
        year: document.getElementById("data-year"),
        program: document.getElementById("data-program"),
        email: document.getElementById("data-email"),
        phone: document.getElementById("data-phone")
    };
}

async function openEditStudent(studentId) {
    try {
        const snap = await getDoc(doc(db, "Students", studentId));
        if (!snap.exists()) return alert("Student not found.");

        const data = snap.data();
        editingStudentId = studentId;

        const f = EditStudentInputs();
        f.studentnum.value = data.id ?? studentId ?? "";
        f.firstname.value = data.firstName ?? "";
        f.lastname.value = data.lastName ?? "";
        f.year.value = data.year ?? "";
        f.program.value = data.department ?? "";
        f.email.value = data.email ?? "";
        f.phone.value = data.phone ?? "";

        // prevent changing doc id during edit
        f.studentnum.disabled = true;


        openEditStudentModal();
    } catch (err) {
        console.error(err);
        alert("Failed to load book for editing.");
    }
}


async function handleEditStudent() {
    if (!editingStudentId) return alert("No student selected for editing.");

    const f = EditStudentInputs();

    const firstname = f.firstname?.value.trim() ?? "";
    const lastname = f.lastname?.value.trim() ?? "";
    const year = f.year?.value.trim() || "N/A";
    const program = f.program?.value.trim() || "N/A";
    const email = f.email?.value.trim() || "N/A";
    const phone = f.phone?.value.trim() || "N/A";

    if (!firstname) return alert("Please enter a first name.");
    if (!lastname) return alert("Please enter a last name.");

    const studentRef = doc(db, "Students", editingStudentId);

    try {
        await setDoc(
            studentRef,
            {
                // keep id/doc id stable
                id: editingStudentId,
                firstName: firstname,
                lastName: lastname,
                year,
                department: program,
                email,
                phone,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        closeEditStudentModal();
    } catch (err) {
        console.error(err);
        alert("Failed to save changes.");
    }
}

// ======================================DOM EVENT DELEGATION

// Esc closes any open modal
document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal.show").forEach((m) => m.classList.remove("show"));
});
// X Button closes any open modal
document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".modal-close");
    if (!closeBtn) return;
    const modal = closeBtn.closest(".modal");
    modal?.classList.remove("show");
});


// Add students modal buttons
document.addEventListener("click", (e) => {
    if (e.target.closest("#addStudentBtn")) openAddStudentModal();
    if (e.target.closest("#addstudent-cancel")) closeAddStudentModal();
    if (e.target.closest("#addstudent-submit")) handleAddStudent(); // keep your existing add logic
});

// Edit student modal buttons
document.addEventListener("click", (e) => {
    if (e.target.closest("#editstudent-cancel")) closeEditStudentModal();
    if (e.target.closest("#editstudent-submit")) handleEditStudent(); // keep your existing add logic
});

document.addEventListener("click", (e) => {
    const row = e.target.closest(".student-row");
    if (!row) return;

    const studentId = row.dataset.id;
    const actionEl = e.target.closest("[data-action]");

    // Button click
    if (actionEl) {
        const { action } = actionEl.dataset;

        if (action === "delete") deleteStudent(studentId);
        if (action === "edit") openEditStudent(studentId);

        return;
    }

    // Row click
    // BookDetails(bookId);
});

// DELETE STUDENT JS
async function deleteStudent(studentId) {
    if (!studentId) return;

    openConfirmationModal();

    document.addEventListener("click", async (e) => {
        const confirmDelete = e.target.closest("#confirmation-yes");
        const noDelete = e.target.closest("#confirmation-no");

        if (confirmDelete) {
            await deleteDoc(doc(db, "Students", studentId));
            closeConfirmationModal();
        }

        if (noDelete) {
            closeConfirmationModal();
        }

    });
}

// SEARCH AND FILTERS STUDENTS 
let allStudents = [];
let searchText = "";
let searchDebounceTimer = null;

function normalize(v) {
    return (v ?? "").toString().toLowerCase().trim();
}

function applySearchAndRender() {
    const q = normalize(searchText);

    // Multi-select: read ALL active course buttons
    const activeCourses = Array.from(
        document.querySelectorAll(".filter-course .filter.filter-active")
    )
        .map((el) => (el.id || el.dataset.course || el.textContent || "").trim())
        .filter(Boolean);

    // Multi-select: read ALL active year buttons
    const activeYears = Array.from(
        document.querySelectorAll(".filter-year .filter.filter-active")
    )
        .map((el) => (el.id || el.dataset.year || el.textContent || "").trim())
        .filter(Boolean);

    const filtered = allStudents.filter((b) => {
        const id = normalize(b.id);
        const firstname = normalize(b.firstName);
        const lastname = normalize(b.lastName);
        const year = normalize(b.year);
        const department = normalize(b.department);
        const email = normalize(b.email);
        const phone = normalize(b.phone);

        // Search matches (if empty search => match all)
        const searchMatch =
            !q ||
            firstname.includes(q) ||
            lastname.includes(q) ||
            year.includes(q) ||
            id.includes(q) ||
            department.includes(q) ||
            email.includes(q) ||
            phone.includes(q);

        // Course matches (if no active courses => match all)
        const courseMatch =
            activeCourses.length === 0 ||
            activeCourses.some((c) => department.includes(normalize(c)));

        // Year matches (if no active years => match all)
        const yearMatch =
            activeYears.length === 0 ||
            activeYears.some((y) => year.includes(normalize(y)));

        return searchMatch && courseMatch && yearMatch;
    });

    renderStudents(filtered);
}

// // FILTER BUTTONS first logic
// function courseBSIT() {
//     const filtered = allStudents.filter((b) => {
//         const department = b.department;
//         return department.includes("BSIT");
//     });
//     renderStudents(filtered);
// }
// function courseBSCS() {
//     const filtered = allStudents.filter((b) => {
//         const department = b.department;
//         return department.includes("BSCS");
//     });
//     renderStudents(filtered);
// }



// document.addEventListener("click", (e) => {
//     const all = e.target.closest("#ALL");
//     const bsit = e.target.closest("#BSIT");
//     const bscs = e.target.closest("#BSCS");
//     const bshm = e.target.closest("#BSHM");
//     const bstm = e.target.closest("#BSTM");

//     if (all) applySearchAndRender();
//     if (bsit) courseBSIT();
//     if (bscs) courseBSCS();
//     if (bshm) courseBSIT();
//     if (bstm) courseBSIT();
// });


document.addEventListener("input", (e) => {
    const input = e.target.closest(".searchTerm");
    if (!input) return;

    // Debounce so we don't rerender on every single keystroke instantly
    window.clearTimeout(searchDebounceTimer);
    searchDebounceTimer = window.setTimeout(() => {
        searchText = input.value;
        applySearchAndRender();
    }, 120);
});

document.addEventListener('click', (e) => {

    const allBtn = e.target.closest('.filter-all .filter');
    const courseBtn = e.target.closest('.filter-course .filter');
    const yearBtn = e.target.closest('.filter-year .filter');

    const allFilterBtn = document.querySelector('.filter-all .filter');
    const courseFilters = document.querySelectorAll('.filter-course .filter');
    const yearFilters = document.querySelectorAll('.filter-year .filter');

    if (!allFilterBtn) return;

    if (allBtn) {
        courseFilters.forEach(f => f.classList.remove('filter-active'));
        yearFilters.forEach(f => f.classList.remove('filter-active'));
        allFilterBtn.classList.add('filter-active');
        applySearchAndRender();
        return;
    }

    if (courseBtn) {
        allFilterBtn.classList.remove('filter-active');
        courseBtn.classList.toggle('filter-active');
    }

    if (yearBtn) {
        allFilterBtn.classList.remove('filter-active');
        yearBtn.classList.toggle('filter-active');
    }

    // If NOTHING is active in course + year, auto-activate ALL
    const anyCourseActive = document.querySelectorAll('.filter-course .filter.filter-active').length > 0;
    const anyYearActive = document.querySelectorAll('.filter-year .filter.filter-active').length > 0;

    if (!anyCourseActive && !anyYearActive) {
        allFilterBtn.classList.add('filter-active');
    }

    if (courseBtn || yearBtn) applySearchAndRender();
});