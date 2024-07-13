$(document).ready(function() {
    $('#login-form').submit(function(event) {
        event.preventDefault(); // Prevent the form from submitting
        
        // Get the values from the username and password inputs
        var username = $('#username').val();
        var password = $('#password').val();

        console.log('Username:', username);
        console.log('Password:', password);

        // You can add your custom login logic here
        // For example, you can send the data to a server using AJAX
        // and handle the response accordingly
    });
});
