// Function to handle add course button click
function handleAddCourseButtonClick(event) {
    if (event.target.tagName === 'BUTTON' && event.target.classList.contains('add-course-button')) {
        const courseName = event.target.parentNode.parentNode.querySelector('td:first-child').textContent;
        // You can perform further actions here, such as adding the course to the student's interested courses.
        console.log(`Added course: ${courseName}`);
        // Optionally, you can provide visual feedback or perform other actions based on the button click.
    }
}

// Function to handle request button click
function handleRequestButtonClick(event) {
    if (event.target.tagName === 'BUTTON' && event.target.classList.contains('request-button')) {
        const tutorName = event.target.parentNode.parentNode.querySelector('td:nth-child(2)').textContent;
        const courseName = event.target.parentNode.parentNode.querySelector('td:first-child').textContent;
        // You can perform further actions here, such as sending a request to the tutor for the class.
        console.log(`Requested class from ${tutorName} for course ${courseName}`);
        // Optionally, you can provide visual feedback or perform other actions based on the button click.
    }
}

// Event listeners for add course and request buttons
document.querySelector('.courses-table tbody').addEventListener('click', handleAddCourseButtonClick);
document.querySelector('.courses-table tbody').addEventListener('click', handleRequestButtonClick);
