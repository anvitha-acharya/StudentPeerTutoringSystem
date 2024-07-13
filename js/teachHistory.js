// Teach History Page

// Function to handle accept button click
function handleAcceptButtonClick(event) {
    if (event.target.tagName === 'BUTTON' && event.target.classList.contains('accept-button')) {
        const studentName = event.target.dataset.student;
        const course = event.target.dataset.course;
        // You can perform further actions here, such as updating the status or performing other logic based on the button click.
        console.log(`Accepted request from ${studentName} for course ${course}`);
        // Optionally, you can provide visual feedback or perform other actions based on the button click.
    }
}

// Event listener for accept button click
document.querySelector('.history-table tbody').addEventListener('click', handleAcceptButtonClick);
