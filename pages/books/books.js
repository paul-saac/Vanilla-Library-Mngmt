import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const booksWrapper = document.querySelector(".books-wrapper");

// Listen to Firestore and render cards
function initBooksListener() {
    const booksCol = collection(db, "Books");
    const q = query(booksCol, orderBy("bookName"));

    onSnapshot(
        q,
        (snapshot) => {
            const books = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            renderBooks(books);
        },
        (err) => console.error("Error fetching books:", err)
    );
}

function renderBooks(books) {
    booksWrapper.innerHTML = books.map((book) => createBookCard(book)).join("");
}

function createBookCard(book) {
    const {
        id = "",
        bookName = "Untitled",
        author = "Unknown Author",
        publisher = "",
        bookGenre = "N/A",
        publishDate = "N/A",
        status = "Unavailable",
        copies = 0,
        availableCopies,
    } = book;

    const available = availableCopies ?? copies ?? 0;
    const total = copies ?? 0;
    const statusClass = status?.toLowerCase() === "available" ? "avail-light" : "unavail";

    return `
    <div class="book">
      <div class="book-cover"></div>
      <div class="details">
        <div class="book-header">
          <div class="title-header">
            <h3 class="book-title">${bookName}</h3>
            <p class="book-author">by ${author || publisher || "Unknown Author"}</p>
            <h5 class="book-id">ID: ${id}</h5>
          </div>
          <div class="book-actions">
            <div class="edit-book">
              <img src="/pages/books/icons/Edit.svg" alt="Edit" width="13" height="13">
            </div>
            <div class="delete-book">
              <img src="/pages/books/icons/Delete.svg" alt="Delete" width="13" height="13">
            </div>
          </div>
        </div>
        <div class="book-footer">
          <div class="book-availability">
            <a class="${statusClass}">${status}</a>
            <p class="copies">${available}/${total}</p>
          </div>
          <div class="footer-container">
            <p>Genre: ${bookGenre}</p>
            <p>Publish Date: ${publishDate}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Kick off listener
initBooksListener();
