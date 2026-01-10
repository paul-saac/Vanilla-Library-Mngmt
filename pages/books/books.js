import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let unsubscribe = null;

async function fetchBooks() {
  try {
    // First, fetch data immediately with getDocs
    const booksCol = collection(db, "Books");
    const q = query(booksCol, orderBy("bookName"));
    const booksSnapshot = await getDocs(q);
    const booksList = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (window.location.hash === '#/books' || window.location.hash === '') {
      renderBooks(booksList);
    }

    // Then set up real-time listener for future changes
    setupRealtimeListener();
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

function setupRealtimeListener() {
  // Clean up old listener if exists
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  const booksCol = collection(db, "Books");
  const q = query(booksCol, orderBy("bookName"));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const books = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Only render if on books page
      if (window.location.hash === '#/books' || window.location.hash === '') {
        renderBooks(books);
      }
    },
    (err) => console.error("Error setting up listener:", err)
  );
}

function renderBooks(books) {
  const tbody = document.querySelector(".books-container tbody");
  if (!tbody) return;

  tbody.innerHTML = books.map((book) => createBookRow(book)).join("");
}

function createBookRow(book) {
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

  const available = availableCopies ?? copies ?? 0;
  const total = copies ?? 0;

  const normalizedStatus = (status || "").toLowerCase();
  const statusClass = normalizedStatus === "available" ? "avail-light" : "unavail";
  const isbnOrId = isbn || id || "N/A";

  return `
    <tr class="book-row" data-id="${id}" data-isbn="${isbn}">
      <td class="td-title">${bookName}</td>
      <td>${author}</td>
      <td>${bookGenre}</td>
      <td>${isbnOrId}</td>
      <td> <span class="${statusClass}"> ${status}</span> </td>
      <td>${available}/${total}</td>
      <td class="td-actions">
        <div class="books-actions">
          <div class="edit-book" data-action="edit" data-id="${id}">
            <img src="/shared/styles/icons/editstudent.svg" alt="Edit" width="13" height="13">
          </div>
          <div class="delete-book" data-action="delete" data-id="${id}">
            <img src="/shared/styles/icons/deletestudent.svg" alt="Delete" width="13" height="13">
          </div>
        </div>
      </td>
    </tr>
  `;
}

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#/books' || window.location.hash === '') {
    fetchBooks();
  } else {
    // Clean up listener when leaving page
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }
});

// Kick off fetch
fetchBooks();

document.addEventListener('click', (e) => {
  if (e.target.closest('#addbookBtn')) {
    const modal = document.getElementById('addbook-modal');
    modal?.classList.add('show');
  }
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.modal-close')) {
    const modal = document.getElementById('addbook-modal');
    modal?.classList.remove('show');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('addbook-modal');
    modal?.classList.remove('show');
  }
});

const modalEl = document.getElementById("addbook-modal");
const submitBtn = document.getElementById("addbook-submit");
const cancelBtn = document.getElementById("addbook-cancel");

const inputBookName = document.getElementById("bookname");
const inputAuthor = document.getElementById("bookauthor");
const inputIsbn = document.getElementById("bookisbn");
const inputGenre = document.getElementById("bookgenre");
const inputDate = document.getElementById("bookdate"); // <-- fix: was accidentally "Date = ..."
const inputCopies = document.getElementById("bookcopies");

function openAddBookModal() {
  modalEl?.classList.add("show");
  inputBookName?.focus();
}

function closeAddBookModal() {
  modalEl?.classList.remove("show");
}

function resetAddBookForm() {
  if (inputBookName) inputBookName.value = "";
  if (inputAuthor) inputAuthor.value = "";
  if (inputIsbn) inputIsbn.value = "";
  if (inputGenre) inputGenre.value = "";
  if (inputDate) inputDate.value = "";
  if (inputCopies) inputCopies.value = "";
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#addbookBtn")) openAddBookModal();
  if (e.target.closest(".modal-close")) closeAddBookModal();

  if (modalEl && e.target === modalEl) closeAddBookModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAddBookModal();
});

cancelBtn?.addEventListener("click", () => {
  closeAddBookModal();
  resetAddBookForm();
});

async function handleAddBook() {
  if (!inputBookName || !inputIsbn || !inputCopies) {
    alert("Add Book form inputs are missing in books.html (ISBN/Copies/etc).");
    return;
  }

  const bookName = (inputBookName.value || "").trim();
  const isbn = (inputIsbn.value || "").trim().replace(/\s+/g, "");
  const copies = Number.parseInt((inputCopies.value || "").trim(), 10);

  // Optional fields => store "N/A" when empty
  const author = (inputAuthor?.value || "").trim() || "N/A";
  const bookGenre = (inputGenre?.value || "").trim() || "N/A";
  const publishDate = (inputDate?.value || "").trim() || "N/A";

  if (!bookName) return alert("Please enter a Title.");
  if (!isbn) return alert("Please enter an ISBN.");
  if (isbn.includes("/")) return alert("ISBN cannot contain '/'.");
  if (!Number.isFinite(copies) || copies < 0) return alert("Copies must be a valid number (0 or more).");

  const status = copies > 0 ? "Available" : "Unavailable";

  try {
    if (submitBtn) submitBtn.disabled = true;

    const bookRef = doc(db, "Books", isbn);

    await setDoc(
      bookRef,
      {
        isbn,
        bookName,
        author,
        bookGenre,
        publishDate,
        copies,
        availableCopies: copies,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Close modal AFTER successful submit
    closeAddBookModal();
    resetAddBookForm();
  } catch (err) {
    console.error("Error adding book:", err);
    alert("Failed to add book. Check console for details.");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

submitBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  handleAddBook();
});
