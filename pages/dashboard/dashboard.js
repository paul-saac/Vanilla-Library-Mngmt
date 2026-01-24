import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getCountFromServer, getDoc, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function renderTotalBooksCount() {
  const el = document.getElementById("total-books-count");
  const booksCol = collection(db, "Books"); // must match collection name exactly
  const countSnap = await getCountFromServer(booksCol);
  const count = countSnap.data().count;
  if (!el) {
    // Try again on next frame
    requestAnimationFrame(() => renderTotalBooksCount());
    return;
  }
  el.textContent = String(count);
}

renderTotalBooksCount();
window.addEventListener("hashchange", () => {
  if (location.hash === "#/" || location.hash === "") {
    renderTotalBooksCount();
  } else {
  }
});
