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
        unsubscribe();
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
    switch (normalizedStatus) {
        case "available":
            statusClass = "avail-light";
            break;
        case "borrowed":
            statusClass = "borrowed";
            break;
        case "returned":
            statusClass = "returned"; // make sure you have this CSS class (optional)
            break;
        case "overdue":
            statusClass = "overdue"; // make sure you have this CSS class (optional)
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
                    <div class="return-btn" data-action="return" data-id="${id}">
                        <span>Return</span>
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


let recentStudents = []; // cache (so we don't refetch every click)

function $(sel) {
  return document.querySelector(sel);
}

function openStudentMenu() {
  const menu = $("#student-dropdown-menu");
  if (menu) menu.classList.add("open");
}

function closeStudentMenu() {
  const menu = $("#student-dropdown-menu");
  if (menu) menu.classList.remove("open");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderStudentSuggestions(students) {
  const tbody = $("#student-suggestions");
  if (!tbody) return;

  if (!students.length) {
    tbody.innerHTML = `<tr><td>No recent students</td></tr>`;
    return;
  }

  tbody.innerHTML = students
    .map((s) => {
      const id = s.id ?? "N/A"; // student number (doc id)
      const firstName = s.firstName ?? "";
      const lastName = s.lastName ?? "";
      const department = s.department ?? "N/A";
      const email = s.email ?? "N/A";

      const fullName = `${firstName} ${lastName}`.trim() || "N/A";
      const meta = `${id} \u00B7 ${department}`;

      return `
        <tr class="student-suggestion"
            data-id="${escapeHtml(id)}"
            data-fullname="${escapeHtml(fullName)}"
            data-department="${escapeHtml(department)}"
            data-email="${escapeHtml(email)}">
          <td>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <div style="font-weight:600;">${escapeHtml(fullName)}</div>
              <div style="color:#6b7280;font-size:13px;">${escapeHtml(meta)}</div>
              <div style="color:#6b7280;font-size:13px;">${escapeHtml(email)}</div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function fetchRecentStudents3() {
  // Same pattern as students.js, just different query:
  // Students ordered by updatedAt desc, limit 3
  const q = query(collection(db, "Students"), orderBy("updatedAt", "desc"), limit(3));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

async function showRecentStudentsDropdown() {
  // make sure DOM exists (if your page loads via router)
  const tbody = $("#student-suggestions");
  if (!tbody) return;

  openStudentMenu();

  // fetch only once per page load
  if (recentStudents.length === 0) {
    try {
      recentStudents = await fetchRecentStudents3();
    } catch (err) {
      console.error(err);
      renderStudentSuggestions([]);
      return;
    }
  }

  renderStudentSuggestions(recentStudents);
}

// ====================== EVENT DELEGATION (same style as your students.js)
document.addEventListener("click", async (e) => {
  const studentInput = e.target.closest("#student-input");
  const suggestionRow = e.target.closest("#student-suggestions .student-suggestion");
  const dropdown = $("#student-dropdown");
  const input = $("#studentnum");

  // select suggestion
  if (suggestionRow && input) {
    const id = suggestionRow.dataset.id || "";
    const fullName = suggestionRow.dataset.fullname || "";
    const dept = suggestionRow.dataset.department || "";
    const email = suggestionRow.dataset.email || "";

    // put something readable in the input
    input.value = `${fullName} (${id})`;

    // store chosen student info for your "Issue Book" submit later
    input.dataset.studentId = id;
    input.dataset.studentName = fullName;
    input.dataset.studentDepartment = dept;
    input.dataset.studentEmail = email;

    closeStudentMenu();
    return;
  }

  // open dropdown when clicking the input area
  if (studentInput) {
    await showRecentStudentsDropdown();
    $("#studentnum")?.focus();
    return;
  }

  // close when clicking outside
  if (dropdown && !dropdown.contains(e.target)) {
    closeStudentMenu();
  }
});

// optional: ESC closes the menu
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeStudentMenu();
});