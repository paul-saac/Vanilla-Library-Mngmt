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

document.addEventListener('click', (e) => {

    const allBtn = e.target.closest('.filter-all .filter');
    const courseBtn = e.target.closest('.filter-course .filter');
    const yearBtn = e.target.closest('.filter-year .filter');

    const allFilterBtn = document.querySelector('.filter-all .filter');
    const courseFilters = document.querySelectorAll('.filter-course .filter');
    const yearFilters = document.querySelectorAll('.filter-year .filter');

    if (!allFilterBtn) return;

    if (allBtn) {
        courseFilters.forEach(f => f.classList.remove('filter-active'));
        yearFilters.forEach(f => f.classList.remove('filter-active'));
        allFilterBtn.classList.add('filter-active');
    }

    if (courseBtn) {
        allFilterBtn.classList.remove('filter-active');

        if (courseBtn.classList.contains('filter-active')) {
            courseBtn.classList.remove('filter-active');
            return;
        }
        courseBtn.classList.add('filter-active');
    }

    if (yearBtn) {
        allFilterBtn.classList.remove('filter-active');
        
        if (yearBtn.classList.contains('filter-active')) {
            yearBtn.classList.remove('filter-active');
            return;
        }

        yearBtn.classList.add('filter-active');
    }
});



//Refresh everytime the hashchanged
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/students') {
        fetchStudents();
    }
});

