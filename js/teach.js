$(document).ready(function() {
    // Function to add a new course
    $('#teaching-form').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        // Retrieve course name
        const courseName = $('#course-name').val();
        // AJAX request to add course
        $.ajax({
            type: 'POST',
            url: '/addCourse',
            data: JSON.stringify({ courseName }),
            contentType: 'application/json',
            success: function(response) {
                console.log('Course added successfully:', response);
                // Handle success, update UI as needed
                appendCourse(response.ccode, courseName);
            },
            error: function(error) {
                console.error('Error adding course:', error.responseJSON.message);
                // Handle error, show error message to user
                alert('An error occurred while adding the course. Please try again.');
            }
        });
    });

    // Function to append course to table
    function appendCourse(ccode, courseName) {
        var newRow = `<tr>
                        <td class="course-code">${ccode}</td>
                        <td>${courseName}</td>
                        <td><button class="delete-button">Delete</button></td>
                    </tr>`;
        $('#data-table tbody').append(newRow);
    }

    // Fetch courses when page loads
    function fetchCourses() {
        $.ajax({
            type: 'GET',
            url: '/getCourses',
            success: function(response) {
                console.log('Courses fetched successfully:', response);
                // Append each course to the table
                response.courses.forEach(course => {
                    appendCourse(course.ccode, course.course_name);
                });
            },
            error: function(error) {
                console.error('Error fetching courses:', error);
                alert('An error occurred while fetching the courses. Please try again.');
            }
        });
    }

    // Fetch courses when the page loads
    fetchCourses();

    // Function to delete a course
    $(document).on('click', '.delete-button', function() {
        var row = $(this).closest('tr');
        var ccode = row.find('.course-code').text();

        // AJAX call to delete the course
        $.ajax({
            url: '/deleteCourse/' + ccode,
            type: 'DELETE',
            success: function(response) {
                row.remove(); // Remove row from table
            },
            error: function(xhr, status, error) {
                console.error('Error deleting course:', error);
                alert('An error occurred while deleting the course. Please try again.');
            }
        });
    });
});
