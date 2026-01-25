import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getCountFromServer, limit, getDoc, getDocs, where, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function renderTotalBooksCount() {
  const totalbooks = document.getElementById("total-books-count");

  if (!totalbooks) {
    requestAnimationFrame(renderTotalBooksCount);
    return;
  }

  const booksCol = collection(db, "Books");
  const countSnap = await getCountFromServer(booksCol);
  const bookscount = countSnap.data().count;

  totalbooks.textContent = String(bookscount);
}

async function renderTotalStudents() {
  const totalstudents = document.getElementById("total-students-count");

  if (!totalstudents) {
    requestAnimationFrame(renderTotalStudents);
    return;
  }

  const studentsCol = collection(db, "Students");
  const studentsnap = await getCountFromServer(studentsCol);
  const studentscount = studentsnap.data().count;

  totalstudents.textContent = String(studentscount);
}

async function renderIssuedBooks() {
  const totalissued = document.getElementById("total-issued-books");

  if (!totalissued) {
    requestAnimationFrame(renderIssuedBooks);
    return;
  }
  const issuedcol = collection(db, "IssuedBooks");
  const issuedsnap = await getCountFromServer(issuedcol);
  const issuedcount = issuedsnap.data().count;

  totalissued.textContent = String(issuedcount);
}

async function renderOverdues() {
  const totaloverdue = document.getElementById('total-overdue-books');
  if (!totaloverdue) {
    requestAnimationFrame(renderOverdues);
    return;
  }

  const overduecol = collection(db, "IssuedBooks");
  const overduebooks = query(overduecol, where('issueStatus', '==', 'Overdue'));
  const overduesnap = await getCountFromServer(overduebooks);
  const overduecount = overduesnap.data().count;

  totaloverdue.textContent = String(overduecount);

}


let cachedActivity = [];
let unsubscribeActivity = null;

// SIMPLE: start realtime listener once, keep updating cachedBooks + UI
function FetchingActivity() {
  if (unsubscribeActivity) return; // already listening

  const q = query(collection(db, "Activity"), orderBy("at", "desc"));

  unsubscribeActivity = onSnapshot(
    q,
    (snapshot) => {
      cachedActivity = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      renderActivity(cachedActivity);
    },
    (err) => console.error(err)
  );
}

// optional cleanup (call when leaving page / closing modal if you want)
function stopFetchingActivity() {
  if (!unsubscribeActivity) return;
  unsubscribeActivity();
  unsubscribeActivity = null;
}


function renderActivity(activity) {
  const activityrow = document.querySelector(".recentactivity-rows");
  if (!activityrow) {
    requestAnimationFrame(() => renderActivity(activity));
    return;
  }
  activityrow.innerHTML = activity.map(createActivityRow).join("");
}

function formatFirestoreDate(value) {
  if (!value) return "—";
  if (typeof value?.toDate === "function") return value.toDate().toLocaleString();
  if (value instanceof Date) return value.toLocaleString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}


function createActivityRow(activity) {
  const {
    bookName = "N/A",
    at = null,
    studentName = "N/A",
    status = "Unavailable",
    type = "",
  } = activity;

  return `
      <div class="activity-row">
          <div class="activity-details">
              <h5>${bookName}</h5>
              <span>${status}: ${formatFirestoreDate(at)}</span>
          </div>
          <div class="status-borrowed">${status}</div>
      </div>
  `;
}











let cachedBooks = [];
let unsubscribeBooks = null;

// SIMPLE: start realtime listener once, keep updating cachedBooks + UI
function FetchingBooks() {
  if (unsubscribeBooks) return; // already listening

  const q = query(collection(db, "Books"), orderBy("createdAt", "desc"));

  unsubscribeBooks = onSnapshot(
    q,
    (snapshot) => {
      cachedBooks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      renderBooks(cachedBooks);
    },
    (err) => console.error(err)
  );
}

// optional cleanup (call when leaving page / closing modal if you want)
function stopFetchingBooks() {
  if (!unsubscribeBooks) return;
  unsubscribeBooks();
  unsubscribeBooks = null;
}


function renderBooks(books) {
  const bookrow = document.querySelector(".recentbooks-rows");
  if (!bookrow) {
    requestAnimationFrame(() => renderBooks(books));
    return;
  }
  bookrow.innerHTML = books.map(createBooksRow).join("");
}

function createBooksRow(book) {
  const {
    id = "",
    bookName = "Untitled",
    author = "Unknown Author",
    bookGenre = "N/A",
    isbn = "",
    status = "Unavailable",
    copies = 0,
    availableCopies,
  } = book;


  return `
        <div class="recentbook-row">
            <div class="recentbook-details">
                <h5>${bookName}</h5>
                <span>By ${author}</span>
            </div>
            <div class="bookgenre">${bookGenre}</div>
        </div>
  `;
}

renderTotalStudents();
renderTotalBooksCount();
renderIssuedBooks();
renderOverdues();
FetchingBooks();
FetchingActivity();
window.addEventListener("hashchange", () => {
  if (location.hash === "#/" || location.hash === "") {
    renderTotalBooksCount();
    renderTotalStudents();
    renderIssuedBooks();
    renderOverdues();
    FetchingBooks();
    FetchingActivity();
  }
  else {
    stopFetchingBooks();
    stopFetchingActivity();
  }
});









// async function renderTotalBooksCount() {
//   const el = document.getElementById("total-books-count");
//   const booksCol = collection(db, "Books"); // must match collection name exactly
//   const countSnap = await getCountFromServer(booksCol);
//   const count = countSnap.data().count;
//   if (!el) {
//     // Try again on next frame
//     requestAnimationFrame(() => renderTotalBooksCount());
//     return;
//   }
//   el.textContent = String(count);
// }

// renderTotalBooksCount();
// window.addEventListener("hashchange", () => {
//   if (location.hash === "#/" || location.hash === "") {
//     renderTotalBooksCount();
//   } else {
//   }
// });
