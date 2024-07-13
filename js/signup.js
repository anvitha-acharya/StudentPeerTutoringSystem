// signup.js

$(document).ready(function() {
    $('#signup-form').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        // Reset previous error messages
        $('.error-message').text('');

        // Get form data
        var formData = {
            name: $('#name').val(),
            year: $('#year').val(),
            branch: $('#branch').val(),
            courses: $('#courses').val(),
            phone: $('#phone').val(),
            username: $('#username').val(),
            password: $('#password').val()
        };

        // Validate username
        if(formData.username.trim().length < 6 || formData.username.trim().length > 30) {
            $('#username-error').text('Username must be between 6 and 30 characters');
            return; // Prevent further processing
        }

        // Validate password (example: must contain at least 1 uppercase letter and 1 number)
        var passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        if(!passwordRegex.test(formData.password)) {
            $('#password-error').text('Password must have at least 1 uppercase character and 1 number');
            return; // Prevent further processing
        }

        // Dummy example: Log form data
        console.log('Form Data:', formData);

        // Dummy example: Redirect to dashboard after successful signup
        // Replace with your actual signup logic
        // window.location.href = 'dashboard.html';
    });
});
