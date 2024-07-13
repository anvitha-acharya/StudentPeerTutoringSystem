// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Fetch profile data from some source (could be an API, localStorage, etc.)
    // For demonstration, setting up mock data
    const profileData = {
        name: 'John Doe',
        phone: '123-456-7890',
        year: 'Senior',
        branch: 'Computer Science',
        username: 'johndoe123',
        password: '', // For security reasons, do not prepopulate password
        coursesInterested: 'Mathematics, Physics'
    };

    // Function to populate form fields with profile data
    function populateForm() {
        document.getElementById('name').value = profileData.name;
        document.getElementById('phone').value = profileData.phone;
        document.getElementById('year').value = profileData.year;
        document.getElementById('branch').value = profileData.branch;
        document.getElementById('username').value = profileData.username;
        document.getElementById('courses-interested').value = profileData.coursesInterested;
    }

    // Call the populateForm function to fill the form with initial data
    populateForm();

    // Event listener for form submission
    document.getElementById('profile-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Perform form validation and submission logic here
        // For example, fetch updated form data and submit it to the server

        // Redirect to another page after form submission if needed
        // window.location.href = 'someotherpage.html';
    });
});
