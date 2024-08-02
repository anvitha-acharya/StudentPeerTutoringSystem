$(document).ready(function() {
    let interestedCourses = [];

    // Fetch the current username
    $.ajax({
        url: '/getCurrentUser',
        type: 'GET',
        success: function(response) {
            const currentUsername = response.username;

            // Fetch courses interested by the user
            $.ajax({
                url: '/getCoursesInterested',
                type: 'GET',
                success: function(response) {
                    // Populate courses interested table
                    interestedCourses = response.courses.map(course => course.ccode);
                    response.courses.forEach(function(item) {
                        var newRow = `<tr data-ccode="${item.ccode}">
                                        <td>${item.ccode}</td>
                                        <td>${item.course_name}</td>
                                        <td><button class="delete-button" data-ccode="${item.ccode}">Delete</button></td>
                                      </tr>`;
                        $('#courses-interested-table-body').append(newRow);
                    });

                    // Fetch tutor and courses data only after fetching interested courses
                    fetchTutorAndCoursesData(currentUsername);
                },
                error: function(error) {
                    console.error('Error fetching interested courses:', error);
                }
            });

            function fetchTutorAndCoursesData(currentUsername) {
                $.ajax({
                    url: '/getAllCourses',
                    type: 'GET',
                    data: { username: currentUsername },
                    success: function(response) {
                        // Populate tutors table
                        response.courses.forEach(function(item) {
                            var disabled = interestedCourses.includes(item.ccode) ? 'disabled' : '';
                            var row = `<tr>
                                           <td>${item.tutor_name}</td>
                                           <td>${item.course_name}</td>
                                           <td>${item.ccode}</td>
                                           <td>${item.ratings}</td>
                                           <td>${item.student_count}</td>
                                           <td>${item.days}</td>
                                           <td><button class="add-button" data-ccode="${item.ccode}" ${disabled}>Add</button></td>
                                       </tr>`;
                            $('#tutors-table-body').append(row);
                        });

                        // Handle add button click
                        $('.add-button').click(function() {
                            var ccode = $(this).data('ccode');
                            var button = $(this);
                            button.prop('disabled', true); // Disable the button after click

                            // AJAX request to add course to courses_interested
                            $.ajax({
                                url: '/addCourseInterested',
                                type: 'POST',
                                data: JSON.stringify({ ccode }),
                                contentType: 'application/json',
                                success: function(response) {
                                    console.log('Course added to interested:', response);
                                    // Handle success, update UI as needed (e.g., add to courses-interested table)
                                    var newRow = `<tr data-ccode="${ccode}">
                                                    <td>${ccode}</td>
                                                    <td>${response.course.course_name}</td>
                                                    <td><button class="delete-button" data-ccode="${ccode}">Delete</button></td>
                                                  </tr>`;
                                    $('#courses-interested-table-body').append(newRow);
                                },
                                error: function(xhr, status, error) {
                                    console.error('Error adding course to interested:', xhr.responseJSON.message);
                                    // Handle error, show error message to user
                                    alert('An error occurred while adding the course to interested. Please try again.');
                                    button.prop('disabled', false); // Re-enable the button on error
                                }
                            });
                        });
                    },
                    error: function(error) {
                        console.error('Error fetching tutor and courses data:', error);
                    }
                });
            }

            // Handle delete button click in courses-interested table
            $(document).on('click', '.delete-button', function() {
                var row = $(this).closest('tr');
                var ccode = $(this).data('ccode');

                // AJAX request to delete course from courses_interested
                $.ajax({
                    url: `/deleteCourseInterested/${ccode}`,
                    type: 'DELETE',
                    success: function(response) {
                        console.log('Course deleted from interested:', response);
                        row.remove(); // Remove row from table
                        // Re-enable the corresponding add button in tutors table
                        $(`.add-button[data-ccode="${ccode}"]`).prop('disabled', false);
                    },
                    error: function(xhr, status, error) {
                        console.error('Error deleting course from interested:', xhr.responseJSON.message);
                        alert('An error occurred while deleting the course from interested. Please try again.');
                    }
                });
            });
        },
        error: function(error) {
            console.error('Error fetching current username:', error);
        }
    });
});
