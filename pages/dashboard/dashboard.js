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

window.addEventListener("hashchange", () => {
  if (location.hash === "#/" || location.hash === "") {
    renderTotalBooksCount();
    renderTotalStudents();
    renderIssuedBooks();
    renderOverdues();
    FetchingBooks();
  }
  else {
    stopFetchingBooks();
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
