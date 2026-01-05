import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Fetch and display books
async function fetchBooks() {
    try {
        const booksCollection = collection(db, 'Books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (window.location.hash === '#/books') {
            displayBooks(booksList);
        }
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

function displayBooks(books) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    books.forEach(book => {
        const row = `
            <tr>
                <td>${book.bookName || 'N/A'}</td>
                <td>${book.publisher || 'N/A'}</td>
                <td>${book.publishDate || 'N/A'}</td>
                <td>${book.price || 'N/A'}</td>
                <td>${book.status || 'N/A'}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

//Refresh everytime the hashchanged
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/books') {
        fetchBooks();
    }
});

fetchBooks();
