document.addEventListener('DOMContentLoaded', function() {
    fetchTeachHistory();
});

function fetchTeachHistory() {
    fetch('/getTeachHistory')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('.history-table tbody');
            tableBody.innerHTML = '';
            data.forEach(item => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${item.class_id}</td>
                    <td>${item.course_name}</td>
                    <td>${new Date(item.c_date).toLocaleDateString()}</td>
                    <td>${item.c_time}</td>
                    <td>${item.avg_ratings}</td>
                `;
            });
        })
        .catch(error => console.error('Error fetching teach history:', error));
}
