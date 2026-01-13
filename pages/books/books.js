import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDoc, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let unsubscribe = null;

function enterBooksPage() {
  if (unsubscribe) return; // already listening

  const q = query(collection(db, "Books"), orderBy("createdAt", "desc"));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const books = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      renderBooks(books);
    },
    (err) => console.error(err)
  );
}

function leaveBooksPage() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

function renderBooks(books) {
  const tbody = document.querySelector(".books-container tbody");

  if (!tbody) {
    // Try again on next frame
    requestAnimationFrame(() => renderBooks(books));
    return;
  }

  tbody.innerHTML = books.map(createBookRow).join("");
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
      <td class="cell-bookTitle">
          <span class="td-title">${bookName}</span> <br>
          <span class="td-isbn"> ISBN: ${isbnOrId}</span>
      </td>
      
      <td>${author}</td>
      <td>
        <span class="td-genre"> ${bookGenre}</span>
      </td>
      <td> 
        <span class="${statusClass}"> ${status}</span> 
      </td>
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

window.addEventListener("hashchange", () => {
  if (location.hash === "#/books" || location.hash === "") {
    enterBooksPage();
  } else {
    leaveBooksPage();
  }
});
// MAIN Invoke
enterBooksPage();


// document.addEventListener('click', (e) => {
//   if (e.target.closest('#addbookBtn')) {
//     const modal = document.getElementById('addbook-modal');
//     modal?.classList.add('show');
//   }
// });

// document.addEventListener('click', (e) => {
//   if (e.target.closest('.modal-close')) {
//     const modal = document.getElementById('addbook-modal');
//     modal?.classList.remove('show');
//   }
// });

// document.addEventListener('keydown', (e) => {
//   if (e.key === 'Escape') {
//     const modal = document.getElementById('addbook-modal');
//     modal?.classList.remove('show');
//   }
// });

// MODAL FUNCTIONALITIES (FIXED: correct modal ids + close the modal you clicked)
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal?.classList.remove("show");
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal?.classList.add("show");
}

function closeAddBookModal() {
  closeModal("addbook-modal");
  resetAddBookForm();
}

function openAddBookModal() {
  openModal("addbook-modal");
}

function closeEditBookModal() {
  closeModal("editbook-modal");
}

function openEditBookModal() {
  openModal("editbook-modal");
}

function confirmationModal() {
  const confrm = document.getElementById("confirmation-modal")
  confrm?.classList.add("show")
}

function closeConfirmationModal() {
  closeModal("confirmation-modal")
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

// Open Add modal
document.addEventListener("click", (e) => {
  if (e.target.closest("#addbookBtn")) {
    editingBookId = null;
    openAddBookModal();
  }
});

// Add modal buttons
document.addEventListener("click", (e) => {
  if (e.target.closest("#addbook-cancel")) closeAddBookModal();
  if (e.target.closest("#addbook-submit")) handleAddBook(); // keep your existing add logic
});

// Edit modal buttons
document.addEventListener("click", (e) => {
  if (e.target.closest("#editbook-cancel")) {
    editingBookId = null;
    closeEditBookModal();
  }
  if (e.target.closest("#editbook-submit")) handleEditBook();
});



// When opening Add modal, ensure we are not editing
document.addEventListener("click", (e) => {
  if (!e.target.closest("#addbookBtn")) return;
  editingBookId = null;
});

// When canceling edit modal, clear editing state
document.addEventListener("click", (e) => {
  if (!e.target.closest("#editbook-cancel")) return;
  editingBookId = null;
  resetAddBookForm();
  closeEditBookModal();
});






// ...existing code...

// EDIT/ADD FORM INPUTS (separate forms)
function AddBookInputs() {
  return {
    bookName: document.getElementById("bookname"),
    author: document.getElementById("bookauthor"),
    isbn: document.getElementById("bookisbn"),
    genre: document.getElementById("bookgenre"),
    publishDate: document.getElementById("bookdate"),
    copies: document.getElementById("bookcopies"),
  };
}

function EditBookInputs() {
  return {
    bookName: document.getElementById("data-bookname"),
    author: document.getElementById("data-bookauthor"),
    isbn: document.getElementById("data-bookisbn"),
    genre: document.getElementById("data-bookgenre"),
    publishDate: document.getElementById("data-bookdate"),
    copies: document.getElementById("data-bookcopies"),
  };
}

function resetAddBookForm() {
  const f = AddBookInputs();
  if (f.bookName) f.bookName.value = "";
  if (f.author) f.author.value = "";
  if (f.isbn) {
    f.isbn.value = "";
    f.isbn.disabled = false;
  }
  if (f.genre) f.genre.value = "";
  if (f.publishDate) f.publishDate.value = "";
  if (f.copies) f.copies.value = "0";
}

// BOOK ACTIONS
let editingBookId = null;

// Row action buttons: Edit/Delete
document.addEventListener("click", (e) => {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;

  const { action, id: bookId } = actionEl.dataset;
  if (!bookId) return;

  if (action === "delete") deleteBook(bookId);
  if (action === "edit") openEditBook(bookId);
});



async function openEditBook(bookId) {
  try {
    const snap = await getDoc(doc(db, "Books", bookId));
    if (!snap.exists()) return alert("Book not found.");

    const data = snap.data();
    editingBookId = bookId;

    const f = EditBookInputs();
    f.bookName.value = data.bookName ?? "";
    f.author.value = data.author ?? "";
    f.isbn.value = data.isbn ?? bookId;
    f.genre.value = data.bookGenre ?? "";
    f.publishDate.value = data.publishDate ?? "";
    f.copies.value = data.copies ?? 0;

    // prevent changing doc id during edit
    f.isbn.disabled = true;

    openEditBookModal();
  } catch (err) {
    console.error(err);
    alert("Failed to load book for editing.");
  }
}

// ADD: saves a NEW book using the Add modal inputs
async function handleAddBook() {
  const f = AddBookInputs();

  const bookName = f.bookName?.value.trim() ?? "";
  const isbnRaw = (f.isbn?.value ?? "").trim().replace(/\s+/g, "");
  const copies = Number.parseInt((f.copies?.value ?? "").trim(), 10);

  const author = f.author?.value.trim() || "N/A";
  const bookGenre = f.genre?.value.trim() || "N/A";
  const publishDate = f.publishDate?.value.trim() || "N/A";

  if (!bookName) return alert("Please enter a Title.");
  if (!isbnRaw) return alert("Please enter an ISBN.");
  if (!Number.isFinite(copies) || copies < 0) return alert("Copies must be 0 or more.");

  const bookRef = doc(db, "Books", isbnRaw);

  try {
    const existing = await getDoc(bookRef);
    if (existing.exists()) {
      return alert("A book with this ISBN already exists. Use Edit instead.");
    }

    await setDoc(bookRef, {
      isbn: isbnRaw,
      bookName,
      author,
      bookGenre,
      publishDate,
      copies,
      availableCopies: copies,
      status: copies > 0 ? "Available" : "Unavailable",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    resetAddBookForm();
    closeAddBookModal(); // already calls resetAddBookForm() in your code
  } catch (err) {
    console.error(err);
    alert("Failed to add book.");
  }
}

// EDIT: updates an EXISTING book using the Edit modal inputs
async function handleEditBook() {
  if (!editingBookId) return alert("No book selected for editing.");

  const f = EditBookInputs();

  const bookName = f.bookName?.value.trim() ?? "";
  const copies = Number.parseInt((f.copies?.value ?? "").trim(), 10);

  const author = f.author?.value.trim() || "N/A";
  const bookGenre = f.genre?.value.trim() || "N/A";
  const publishDate = f.publishDate?.value.trim() || "N/A";

  if (!bookName) return alert("Please enter a Title.");
  if (!Number.isFinite(copies) || copies < 0) return alert("Copies must be 0 or more.");

  const bookRef = doc(db, "Books", editingBookId);

  try {
    const snap = await getDoc(bookRef);
    if (!snap.exists()) return alert("Book no longer exists.");

    const prev = snap.data();
    const prevCopies = Number(prev.copies ?? 0);
    const prevAvailable = Number(prev.availableCopies ?? prevCopies);
    const delta = copies - prevCopies;

    const availableCopies = Math.max(0, Math.min(prevAvailable + delta, copies));
    const status = copies > 0 ? "Available" : "Unavailable";

    await setDoc(
      bookRef,
      {
        // keep isbn/doc id stable
        isbn: prev.isbn ?? editingBookId,
        bookName,
        author,
        bookGenre,
        publishDate,
        copies,
        availableCopies,
        status,
        createdAt: prev.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    editingBookId = null;
    closeEditBookModal();
  } catch (err) {
    console.error(err);
    alert("Failed to save changes.");
  }
}

async function deleteBook(bookId) {
  if (!bookId) return;

  confirmationModal();

  document.addEventListener("click", async (e) => {
    const confirmDelete = e.target.closest("#confirmation-yes");
    const noDelete = e.target.closest("#confirmation-no");

    if (confirmDelete) {
      await deleteDoc(doc(db, "Books", bookId));
      closeConfirmationModal()
      console.log("Book deleted:", bookId);
      console.error(err);
    }

    if (noDelete) {
      closeConfirmationModal()
      console.log("oeoe")
    }

  });
}

// ...existing code...