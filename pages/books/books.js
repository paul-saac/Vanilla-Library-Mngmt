import { db } from "./shared/scripts/firebaseConfig.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const tableBody = document.querySelector("#booksTable tbody");
async function loadBooks() {
  const querySnapshot = await getDocs(collection(db, "Books"));

  querySnapshot.forEach((doc) => {
    const book = doc.data();

    const row = `
      <tr>
        <td>${book.Tile}</td>
        <td>${book.Publisher}</td>
        <td>${book.Date}</td>
        <td>${book.Price}</td>
        <td>${book.Status}</td>
      </tr>
    `;

    tableBody.innerHTML += row;
  });
}

loadBooks();