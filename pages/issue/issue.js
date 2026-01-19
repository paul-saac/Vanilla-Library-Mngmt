import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let unsubscribe = null;
let allIssues = [];

function enterIssuePage() {
    if (unsubscribe) return; // already listening

    const q = query(collection(db, "IssuedBooks"), orderBy("borrowDate", "desc"));

    unsubscribe = onSnapshot(
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
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
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
                    <div class="edit-issue" data-action="edit" data-id="${id}">
                        <img src="/shared/styles/icons/editstudent.svg" alt="" width="13px" height="13px">
                    </div>
                    <div class="delete-issue" data-action="delete" data-id="${id}">
                        <img src="/shared/styles/icons/deletestudent.svg" alt="" width="13px" height="13px">
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
