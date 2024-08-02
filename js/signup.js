$(document).ready(function() {
    $('#tutor-checkbox').change(function() {
        if ($(this).is(':checked')) {
            $('#tutor-fields').show();
        } else {
            $('#tutor-fields').hide();
        }
    });

    $('#signup-form').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        // Reset previous error messages
        $('.error-message').text('');

        // Get form data
        var formData = {
            name: $('#name').val(),
            year: $('#year').val(),
            branch: $('#branch').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            username: $('#username').val(),
            password: $('#password').val(),
            tutorCheckbox: $('#tutor-checkbox').is(':checked'),
            time: $('#time').val(),
            daysFree: [] // Initialize an empty array to store selected days
        };

        // Validate username
        if (formData.username.trim().length < 6 || formData.username.trim().length > 30) {
            $('#username-error').text('Username must be between 6 and 30 characters');
            return; // Prevent further processing
        }

        // Validate password (example: must contain at least 1 uppercase letter and 1 number)
        var passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(formData.password)) {
            $('#password-error').text('Password must have at least 1 uppercase character and 1 number');
            return; // Prevent further processing
        }

        // Check selected days if signed up as a tutor
        if (formData.tutorCheckbox) {
            $('.days-checkboxes input:checked').each(function() {
                formData.daysFree.push($(this).val());
            });
        }

        // Submit form data via AJAX
        $.ajax({
            url: '/signup',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                // Store user data in localStorage or handle as needed
                localStorage.setItem('user', JSON.stringify(formData));

                // Handle success (e.g., redirect to another page)
                window.location.href = 'allcourses.html';
            },
            error: function(xhr, status, error) {
                if (xhr.status === 409) {
                    $('#username-error').text('Username already taken');
                } else {
                    console.error('Error:', error);
                    alert('An error occurred while signing up. Please try again.');
                }
            }
        });
    });
});
