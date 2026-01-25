import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDoc, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let unsubscribe = null;
let allBooks = [];
let searchText = "";
let searchDebounceTimer = null;

function normalize(v) {
  return (v ?? "").toString().toLowerCase().trim();
}

function applySearchAndRender() {
  const q = normalize(searchText);

  if (!q) {
    renderBooks(allBooks);
    return;
  }

  const filtered = allBooks.filter((b) => {
    const id = normalize(b.id);
    const title = normalize(b.bookName);
    const author = normalize(b.author);
    const isbn = normalize(b.isbn);
    const genre = normalize(b.bookGenre);
    const status = normalize(b.status);
    const date = normalize(b.publishDate);

    return (
      title.includes(q) ||
      author.includes(q) ||
      isbn.includes(q) ||
      id.includes(q) ||
      genre.includes(q) ||
      status.includes(q) ||
      date.includes(q)
    );
  });

  renderBooks(filtered);
}

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


function enterBooksPage() {
  if (unsubscribe) return; // already listening

  const q = query(collection(db, "Books"), orderBy("createdAt", "desc"));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const books = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // IMPORTANT: store snapshot, then render based on current search text
      allBooks = books;
      applySearchAndRender();
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

  
  const available = Number(availableCopies ?? copies ?? 0);
  const total = Number(copies ?? 0);

  // ✅ derive UI status from available copies
  const displayStatus = available > 0 ? "Available" : "Unavailable";
  const statusClass = available > 0 ? "avail-light" : "unavail";

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
        <span class="${statusClass}"> ${displayStatus}</span>
      </td>
      <td>${available}/${total}</td>
      <td class="td-actions">
        <div class="books-actions">
          <div class="edit-book" data-action="edit" data-id="${id}">
            <img src="./shared/styles/icons/editbook.svg" alt="Edit" width="13" height="13">
          </div>
          <div class="delete-book" data-action="delete" data-id="${id}">
            <img src="./shared/styles/icons/deletebook.svg" alt="Delete" width="13" height="13">
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


// MODALS OPEN/CLOSE FUNCTIONS
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

function openDetailsModal() {
  openModal("details-modal");
}
function closeDetailsModal() {
  closeModal("details-modal");
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
    description: document.getElementById("book-description")
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
    description: document.getElementById("data-description")
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
  if (f.copies) f.copies.value = "";
  if (f.description) f.description.value = "";

}

// BOOK ACTIONS
let editingBookId = null;

// Row action buttons: Edit/Delete
document.addEventListener("click", (e) => {
  const row = e.target.closest(".book-row");
  if (!row) return;

  const bookId = row.dataset.id;

  const actionEl = e.target.closest("[data-action]");

  // 🔹 Button click
  if (actionEl) {
    const { action } = actionEl.dataset;

    if (action === "delete") deleteBook(bookId);
    if (action === "edit") openEditBook(bookId);

    return;
  }

  // 🔹 Row click
  BookDetails(bookId);
});



async function BookDetails(bookId) {
  try {
    const snap = await getDoc(doc(db, "Books", bookId));
    const data = snap.data();

    const title = document.querySelector(".details-title span");
    const author = document.querySelector(".details-author span");
    const published = document.querySelector(".details-publishdate span")
    const isbn = document.querySelector(".details-isbn span");
    const category = document.querySelector(".details-category span");
    const availability = document.querySelector(".details-availability span")
    const description = document.querySelector(".details-description span")


    author.textContent = data.author;
    title.textContent = data.bookName;
    published.textContent = data.publishDate;
    isbn.textContent = data.isbn;
    category.textContent = data.bookGenre;
    availability.textContent = `${data.availableCopies} of ${data.copies} copies available`
    description.textContent = data.description;


    openDetailsModal();
  } catch (err) {
    alert(err)
  }
}



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
    f.description.value = data.description ?? "";

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
  const description = f.description?.value.trim() || "N/A";

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
      description,
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
  const description = f.description?.value.trim() || "N/A";

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
        description,
        createdAt: prev.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

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
    }

    if (noDelete) {
      closeConfirmationModal()
      console.log("oeoe")
    }

  });
}

// ...existing code...