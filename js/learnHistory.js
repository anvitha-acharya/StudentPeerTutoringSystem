// Learn History Page

// Function to handle rating submission
function handleRatingSubmission(event) {
    if (event.target.tagName === 'INPUT' && event.target.classList.contains('rating-input')) {
        const rating = event.target.value;
        // You can perform further actions here, such as sending the rating to a server or storing it locally.
        console.log(`Submitted rating: ${rating}`);
        // Optionally, you can provide visual feedback or perform other actions based on the rating submission.
    }
}

// Event listener for rating input change
document.querySelector('.history-table tbody').addEventListener('change', handleRatingSubmission);
