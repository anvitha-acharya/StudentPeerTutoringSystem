$(document).ready(function() {
    $('#login-form').submit(function(event) {
        event.preventDefault(); // Prevent the form from submitting

        // Get the values from the username and password inputs
        var username = $('#username').val();
        var password = $('#password').val();

        console.log('Username:', username);
        console.log('Password:', password);

        // AJAX request to server to handle login
        $.ajax({
            type: 'POST',
            url: '/login',
            data: JSON.stringify({ username: username, password: password }),
            contentType: 'application/json',
            success: function(response) {
                // Handle successful login
                if(response.success) {
                    window.location.href = 'allcourses.html';
                } else {
                    alert('Login failed: ' + response.message);
                }
            }
        });
    });
});
