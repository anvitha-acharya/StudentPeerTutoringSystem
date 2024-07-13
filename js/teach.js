$(document).ready(function() {
    // Handle button click to accept teaching request
    $('.accept-button').click(function() {
        var studentName = $(this).data('student');
        var courseName = $(this).data('course');

        // Perform action when the button is clicked (e.g., accept request, update UI)
        alert('Accepted teaching request from ' + studentName + ' for ' + courseName);
    });
});
