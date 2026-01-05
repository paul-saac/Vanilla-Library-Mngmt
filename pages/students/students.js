import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Fetch and display Students
async function fetchStudents() {
    try {
        const studentsCollection = collection(db, 'Students');
        const studentsSnapshot = await getDocs(studentsCollection);
        const studentsList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        displayStudents(studentsList);
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

function displayStudents(students) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    students.forEach(student => {
        const row = `
            <tr>
                <td>${student.id || 'N/A'}</td>
                <td>${student.lastName || 'N/A'}</td>
                <td>${student.firstName || 'N/A'}</td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.department || 'N/A'}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

//Refresh everytime the hashchanged
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/students') {
        fetchStudents();
    }
});

fetchStudents();
