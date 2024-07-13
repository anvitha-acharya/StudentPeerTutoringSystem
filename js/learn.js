$(document).ready(function() {
    // Handle button click to request a class
    $('.request-button').click(function() {
        var teacherName = $(this).data('teacher');
        var courseName = $(this).data('course');

        // Perform action when the button is clicked (e.g., send request to backend, update UI)
        alert('Request sent to ' + teacherName + ' for ' + courseName + ' class!');
    });
});
