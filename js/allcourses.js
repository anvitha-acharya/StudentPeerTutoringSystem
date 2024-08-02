// Save this as js/allcourses.js

document.addEventListener('DOMContentLoaded', function() {
    const createClassBtn = document.getElementById('create-class');
    const createClassContainer = document.getElementById('create-class-container');
    const createClassTable = document.getElementById('create-class-table').getElementsByTagName('tbody')[0];
    const conductTable = document.getElementById('conduct-table').getElementsByTagName('tbody')[0];
    const attendTable = document.getElementById('attend-table').getElementsByTagName('tbody')[0];


    createClassBtn.addEventListener('click', toggleCreateClassForm);
    fetchClassesToConduct();
    fetchCoursesTaught();
    fetchClassesToAttend();

    function toggleCreateClassForm() {
        if (createClassContainer.style.display === 'none') {
            createClassContainer.style.display = 'block';
        } else {
            createClassContainer.style.display = 'none';
        }
    }

    function fetchCoursesTaught() {
        fetch('/getCoursesTaught')
            .then(response => response.json())
            .then(courses => {
                createClassTable.innerHTML = '';
                courses.forEach(course => {
                    const row = createClassTable.insertRow();
                    row.innerHTML = `
                        <td>${course.ccode}</td>
                        <td>${course.course_name}</td>
                        <td><input type="date" class="date-input"></td>
                        <td><input type="time" class="time-input"></td>
                        <td><button class="create-btn">Create</button></td>
                    `;
                    row.querySelector('.create-btn').addEventListener('click', () => createClass(course.ccode, row));
                });
            })
            .catch(error => console.error('Error fetching courses taught:', error));
    }

    // Update this function in your js/allcourses.js file

function createClass(ccode, row) {
    const date = row.querySelector('.date-input').value;
    const time = row.querySelector('.time-input').value;

    if (!date || !time) {
        alert('Please enter both date and time');
        return;
    }

    fetch('/createClass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ccode, date, time }),
    })
    .then(response => response.json())
    .then(data => {
        alert(`${data.message}\nClass ID: ${data.classId}`);
        fetchClassesToConduct();
    })
    .catch(error => {
        console.error('Error creating class:', error);
        alert('Failed to create class. Please try again.');
    });
}

    function fetchClassesToConduct() {
        fetch('/getClassesToConduct')
            .then(response => response.json())
            .then(classes => {
                conductTable.innerHTML = '';
                classes.forEach(cls => {
                    const row = conductTable.insertRow();
                    row.innerHTML = `
                        <td>${cls.class_id}</td>
                        <td>${cls.course_name}</td>
                        <td>${cls.ccode}</td>
                        <td>${new Date(cls.c_date).toLocaleDateString()}</td>
                        <td>${cls.c_time}</td>
                        <td><button class="start-btn">Start</button></td>
                    `;
                    // Add event listener for start button if needed
                });
            })
            .catch(error => console.error('Error fetching classes to conduct:', error));
    }


function fetchClassesToAttend() {
    fetch('/getClassesToAttend')
        .then(response => response.json())
        .then(classes => {
            attendTable.innerHTML = '';
            classes.forEach(cls => {
                const row = attendTable.insertRow();
                row.innerHTML = `
                    <td>${cls.class_id}</td>
                    <td>${cls.course_name}</td>
                    <td>${cls.ccode}</td>
                    <td>${new Date(cls.c_date).toLocaleDateString()}</td>
                    <td>${cls.c_time}</td>
                    <td><button class="join-btn" data-class-id="${cls.class_id}">Join</button></td>
                `;
                row.querySelector('.join-btn').addEventListener('click', () => joinClass(cls.class_id));
            });
        })
        .catch(error => console.error('Error fetching classes to attend:', error));
}

function joinClass(classId) {
    fetch('/joinClass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Show dummy link in a pop-up
        const dummyLink = 'https://example.com/class-link';
        alert(`Join the class using this link: ${dummyLink}`);
        fetchClassesToAttend(); // Refresh the classes to attend list
    })
    .catch(error => {
        console.error('Error joining class:', error);
        alert('Failed to join class. Please try again.');
    });
}
});
