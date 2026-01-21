import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, limit, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let unsubscribeIssues = null;
let unsubscribeStudents = null;

let allIssues = [];

function enterIssuePage() {
    if (unsubscribeIssues) return; // already listening

    const q = query(collection(db, "IssuedBooks"), orderBy("borrowDate", "desc"));

    unsubscribeIssues = onSnapshot(
        q,
        (snapshot) => {
            const issues = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            allIssues = issues;
            // applySearchAndRender();
            renderIssue(issues);
        },
        (err) => console.error(err)
    );
}

function leaveIssuePage() {
    if (unsubscribeIssues) {
        unsubscribeIssues();
        unsubscribeIssues = null;
    }
}

function renderIssue(issues) {
    const tbody = document.querySelector(".issue-container tbody");

    if (!tbody) {
        // Try again on next frame
        requestAnimationFrame(() => renderIssue(issues));
        return;
    }

    tbody.innerHTML = issues.map(createIssuesRow).join("");
}

function formatFirestoreDate(value) {
    if (!value) return "—";

    const format = (d) =>
        d.toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric"
        });

    // Firestore Timestamp { seconds, nanoseconds, toDate() }
    if (typeof value?.toDate === "function") return format(value.toDate());

    // If it’s already a JS Date
    if (value instanceof Date) return format(value);

    // If stored as a string (optional fallback)
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return format(d);

    // Last resort
    return String(value);
}

function createIssuesRow(issue) {
    const {
        id = "",
        studentNum = "N/A",
        firstName = "N/A",
        lastName = "N/A",
        bookName = "Untitled",
        author = "N/A",
        borrowDate = null,
        dueDate = null,
        returnDate = null,
        issueStatus = "Unavailable"
    } = issue;

    const normalizedStatus = issueStatus.toLowerCase();

    let statusClass;
    let actions;
    let actionclass;
    switch (normalizedStatus) {
        case "borrowed":
            statusClass = "borrowed";
            actions = "Return";
            actionclass = "return-btn "
            break;
        case "returned":
            statusClass = "returned";
            actions = "";
            actionclass = "without-return-btn"
            break;
        case "overdue":
            statusClass = "overdue"; // make sure you have this CSS class (optional)
            actions = "Return";
            actionclass = "return-btn "
            break;
        default:
            statusClass = "unavailable"; // fallback class
            break;
    }

    return `
        <tr class="issue-row" data-id="${id}">
            <td class="th-studentname">
                <span class="td-name">${lastName}, ${firstName}</span> <br>
                <span class="td-next">${studentNum}</span>
            </td>
            <td class="th-bookname">
                <span class="td-name">${bookName}</span> <br>
                <span class="td-next">${author}</span>
            </td>
            <td>${formatFirestoreDate(borrowDate)}</td>
            <td>${formatFirestoreDate(dueDate)}</td>
            <td>${formatFirestoreDate(returnDate)}</td>
            <td>    
                <span class="${statusClass}"> ${issueStatus}</span>
            </td>
            <td> 
                <div class="issue-actions">
                    <div class="${actionclass}" data-action="return" data-id="${id}">
                        <span>${actions}</span>
                    </div>
                </div>
            </td>
        </tr>
    `;

}

window.addEventListener("hashchange", () => {
    if (location.hash === "#/issue" || location.hash === "") {
        enterIssuePage();
    } else {
        leaveIssuePage();
    }
});
// MAIN INVOKE
enterIssuePage();


// MODAL FUNCTIONALITIES
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal?.classList.remove("show");
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal?.classList.add("show");
}

function openIssueModal() {
    openModal("addissue-modal");
}

function closeIssueModal() {
    closeModal("addissue-modal");
}

// Close any modal when clicking X (works for both add/edit modals)
document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".modal-close");
    if (!closeBtn) return;
    const modal = closeBtn.closest(".modal");
    modal?.classList.remove("show");
});

// Esc closes any open modal
document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal.show").forEach((m) => m.classList.remove("show"));
});

// Add students modal buttons
document.addEventListener("click", (e) => {
    if (e.target.closest("#addissuebtn")) openIssueModal();
    if (e.target.closest("#addissue-cancel")) closeIssueModal();
    // if (e.target.closest("#addissue-submit")) handleAddStudent(); // keep your existing add logic
});


// ADD ISSUE MODAL
function AddIssuesInputs() {
    return {
        studentnum: document.getElementById("studentnum"),
        book: document.getElementById("book"),
    };
}

function resetAddIssue() {
    const f = AddStudentInputs();

    if (f.studentnum) f.firstname.value = "";
    if (f.book) f.lastname.value = "";

}

async function handleAddIssue() {
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

        closeIssueModal();
        resetAddIssue();
    } catch (err) {
        console.error(err);
        alert("Failed to add student.");
    }
}

// DROPDOWN SUGEESTOIN STUDENTS
let cachedStudents = null;

async function FetchingStudents() {
    if (cachedStudents) {
        renderStudents(cachedStudents);
        return cachedStudents;
    }

    const q = query(
        collection(db, "Students"),
        orderBy("lastName", "asc"),
        limit(3)
    );

    const snapshot = await getDocs(q);

    cachedStudents = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));

    renderStudents(cachedStudents);
    return cachedStudents;
}

function renderStudents(students) {
    const tbody = document.querySelector(".student-suggestions tbody");

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
        email = "N/A",
    } = student;

    return `
        <tr class="suggestion-row" data-id="${id}">
            <td class="td-name">${lastName || "N/A"}, ${firstName || "N/A"} <br>
                <span class="student-email">${email || "N/A"}</span>
            </td>
        </tr>
  `;
}

document.addEventListener("focusin", async (e) => {
    if (e.target.closest("#studentnum")) {
        const box = document.querySelector(".student-suggestions");
        if (!box) return;

        await FetchingStudents();
        box.style.display = "block";
    }
});


document.addEventListener("pointerdown", (e) => {
    const input = document.querySelector("#studentnum");
    const box = document.querySelector(".student-suggestions");
    if (!input || !box) return;


    const clickedInsideInput = input.contains(e.target);
    const clickedInsideBox = box.contains(e.target);

    if (!clickedInsideInput && !clickedInsideBox) {
        box.style.display = "none";
    }
});
