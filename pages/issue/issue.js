import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// async function fetchBoth() {
//     try {
//         const bothCollection = collection(db, 'IssuedBooks');
//         const bothSnapshot = await getDocs(studentsCollection);
//         const bothList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//         if (window.location.hash === '#/students') {
//             displayStudents(studentsList);
//         }
//     } catch (error) {
//         console.error("Error fetching students:", error);
//     }
// }

// function displayBoth(students) {
//     const tableBody = document.querySelector('tbody');
//     tableBody.innerHTML = ''; // Clear existing rows

//     students.forEach(student => {
//         const row = `
//             <tr>
//                 <td>${student.id || 'N/A'}</td>
//                 <td>${student.lastName || 'N/A'}</td>
//                 <td>${student.firstName || 'N/A'}</td>
//                 <td>${student.email || 'N/A'}</td>
//                 <td>${student.department || 'N/A'}</td>
//             </tr>
//         `;
//         tableBody.innerHTML += row;
//     });
// }

// //Refresh everytime the hashchanged
// window.addEventListener('hashchange', () => {
//     if (window.location.hash === '#/students') {
//         fetchStudents();
//     }
// });

// fetchStudents();