// js/learnHistory.js

document.addEventListener('DOMContentLoaded', function() {
    fetchLearnHistory();
});

function fetchLearnHistory() {
    fetch('/getLearnHistory')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('.history-table tbody');
            tableBody.innerHTML = '';
            data.forEach(item => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tutor_name}</td>
                    <td>${item.course_name}</td>
                    <td>${new Date(item.c_date).toLocaleDateString()}</td>
                    <td>${item.c_time}</td>
                    <td>${item.ratings ? item.ratings : `<button class="rate-btn" data-class-id="${item.class_id}">Rate</button>`}</td>
                `;
                if (!item.ratings) {
                    row.querySelector('.rate-btn').addEventListener('click', () => showRatingPopup(item.class_id));
                }
            });
        })
        .catch(error => console.error('Error fetching learn history:', error));
}

function showRatingPopup(classId) {
    const popup = document.createElement('div');
    popup.className = 'rating-popup';
    popup.innerHTML = `
        <h3>Rate the Class</h3>
        <select id="rating">
            <option value="">Select a rating</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        </select>
        <textarea id="feedback" maxlength="200" placeholder="Provide your feedback (max 200 characters)"></textarea>
        <button id="submit-rating">Submit</button>
        <button id="close-popup">Close</button>
    `;
    document.body.appendChild(popup);

    document.getElementById('close-popup').addEventListener('click', () => {
        document.body.removeChild(popup);
    });

    document.getElementById('submit-rating').addEventListener('click', () => {
        const rating = document.getElementById('rating').value;
        const feedback = document.getElementById('feedback').value;
        if (!rating) {
            alert('Please select a rating');
            return;
        }
        submitRating(classId, rating, feedback);
        document.body.removeChild(popup);
    });
}

function submitRating(classId, rating, feedback) {
    fetch('/submitRating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId, rating, feedback }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Rating submitted successfully');
            fetchLearnHistory(); // Refresh the table
        } else {
            alert('Failed to submit rating');
        }
    })
    .catch(error => console.error('Error submitting rating:', error));
}
