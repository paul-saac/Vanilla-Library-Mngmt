import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

 function fetchStudents() {
    getDocs(booksCollection).then(booksSnapshot => {
        // code here runs after Promise resolves
    });
}