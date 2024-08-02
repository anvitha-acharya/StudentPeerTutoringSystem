$(document).ready(function() {
    // Load user data from localStorage
    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        $('#name').val(user.name);
        $('#phone').val(user.phone);
        $('#year').val(user.year);
        $('#branch').val(user.branch);
        $('#email').val(user.email);
        $('#username').val(user.username);
        $('#password').val(user.password); // You may want to handle passwords more securely

        if (user.isTutor) {
            $('#tutor-checkbox').prop('checked', true);
            $('#tutor-fields').show();
            $('#time').val(user.time);
            user.daysFree.forEach(function(day) {
                $('#' + day.toLowerCase()).prop('checked', true);
            });
        }
    }

    $('#tutor-checkbox').change(function() {
        if ($(this).is(':checked')) {
            $('#tutor-fields').show();
        } else {
            $('#tutor-fields').hide();
        }
    });

    $('#profile-form').submit(function(event) {
        event.preventDefault();

        var formData = {
            name: $('#name').val(),
            phone: $('#phone').val(),
            year: $('#year').val(),
            branch: $('#branch').val(),
            email: $('#email').val(),
            username: $('#username').val(),
            password: $('#password').val(),
            tutorCheckbox: $('#tutor-checkbox').is(':checked'),
            time: $('#time').val(),
            daysFree: []
        };

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

        // Update user data via AJAX
        $.ajax({
            type: 'POST',
            url: '/updateProfile',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                if (response.success) {
                    // Update localStorage
                    localStorage.setItem('user', JSON.stringify(formData));
                    alert('Profile updated successfully');
                } else {
                    alert('Failed to update profile: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('Failed to update profile: ' + error);
            }
        });
    });
});
