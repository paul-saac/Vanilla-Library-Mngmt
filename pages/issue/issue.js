import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let unsubscribe = null;
let allIssues = [];

function enterIssuePage() {
    if (unsubscribe) return; // already listening

    const q = query(collection(db, "IssuedBooks"), orderBy("firstName", "asc"));

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


function createIssuesRow(issue) {
    const {
        id = "",
        studentNum = "N/A",
        firstName = "N/A",
        lastName = "N/A",
        bookName = "Untitled",
        author = "N/A",
        borrowDate = "N/A",
        dueDate = "N/A",
        returnDate = "-",
        issueStatus = "Unavailable"
    } = issue;


    return `
        <tr class="issue-row" data-id="${id}">
            <td class="td-name">${lastName}, ${firstName} <br> 
                <span class="student-num">${studentNum}</span>
            </td>
            <td class="td-book">${bookName} <br> 
                <span class="book-num">${author}</span>
            </td>
            <td>${borrowDate}</td>
            <td>${dueDate}</td>
            <td>${returnDate}</td>
            <td>${issueStatus}</td>
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
