import { db } from "../../shared/scripts/firebaseConfig.js";
import { collection, getDocs, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Fetch and display Students
async function fetchStudents() {
    try {
        const studentsCollection = collection(db, 'Students');
        const studentsSnapshot = await getDocs(studentsCollection);
        const studentsList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (window.location.hash === '#/students') {
            displayStudents(studentsList);
        }
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

function displayStudents(students) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    students.forEach(student => {
        const row = `
            <tr class="student-data">
                <td class="td-name">${student.lastName || 'N/A'}, ${student.firstName || 'N/A'} <br> 
                    <span class="student-email">${student.email || 'N/A'}</span>
                </td>
                <td>${student.id || 'N/A'}</td>
                <td>${student.phone || 'N/A'}</td>
                <td>${student.department || 'N/A'}</td>
                <td>${student.year || 'N/A'}</td>
                <td> 
                    <div class="student-actions">
                        <div class="edit-student">
                            <img src="/shared/styles/icons/editstudent.svg" alt="" width="13px" height="13px">
                        </div>
                        <div class="delete-student">
                            <img src="/shared/styles/icons/deletestudent.svg" alt="" width="13px" height="13px">
                        </div>
                    </div>
                
                </td>
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

// CLICKING ON FILTERS
const allFilterBtn = document.querySelector('.filter-all .filter');
const courseFilters = document.querySelectorAll('.filter-course .filter');
const yearFilters = document.querySelectorAll('.filter-year .filter');

// Handle "All" button click
allFilterBtn.addEventListener('click', function (e) {
    // Remove 'filter-active' from all course and year filters
    courseFilters.forEach(f => f.classList.remove('filter-active'));
    yearFilters.forEach(f => f.classList.remove('filter-active'));
    // Keep 'filter-active' on the "All" button
    this.classList.add('filter-active');
});

// Handle course filter clicks
courseFilters.forEach(filter => {
    filter.addEventListener('click', function (e) {
        // Remove 'filter-active' from "All" button only
        allFilterBtn.classList.remove('filter-active');
        // Remove 'filter-active' from other course filters only
        courseFilters.forEach(f => f.classList.remove('filter-active'));
        // Add 'filter-active' to the clicked one
        this.classList.add('filter-active');
    });
});

// Handle year filter clicks
yearFilters.forEach(filter => {
    filter.addEventListener('click', function (e) {
        // Remove 'filter-active' from "All" button only
        allFilterBtn.classList.remove('filter-active');
        // Remove 'filter-active' from other year filters only
        yearFilters.forEach(f => f.classList.remove('filter-active'));
        // Add 'filter-active' to the clicked one
        this.classList.add('filter-active');
    });
});
