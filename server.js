const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const port = process.env.PORT || 8081;


const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'spts'
});
const app = express();
app.use(session({
    key: 'session_cookie_name',
    secret: '', // Change this to a secure secret in production
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "spts"
});

// Middleware for session management
app.use(session({
    secret: '', // Change this to a secure secret in production
    resave: false,
    saveUninitialized: true
}));

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});
//Handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM student WHERE username = ? AND password = ?";
    
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error checking login credentials:', err);
            res.status(500).send({ success: false, message: 'Internal server error' });
            return;
        }
        if (results.length > 0) {
            // Store user data in session
            req.session.username = results[0].username; // Ensure username is stored in session
            res.status(200).send({ success: true, message: 'Login successful', user: results[0] });
        } else {
            res.status(401).send({ success: false, message: 'Invalid username or password' });
        }
    });
});
// Handle user signup
app.post('/signup', (req, res) => {
    const { name, year, branch, email, phone, username, password, tutorCheckbox, daysFree, time } = req.body;

    const studentQuery = "INSERT INTO student (name, year, branch, email, phone, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(studentQuery, [name, year, branch, email, phone, username, password], (err, studentResult) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(409).send({ message: 'Username already taken' });
            } else {
                console.error('Error inserting user:', err);
                res.status(500).send({ message: 'Internal server error' });
            }
        } else {
            if (tutorCheckbox) {
                const tutorQuery = "INSERT INTO tutor (username, time) VALUES (?, ?)";
                db.query(tutorQuery, [username, time], (err, tutorResult) => {
                    if (err) {
                        console.error('Error inserting tutor:', err);
                        res.status(500).send({ message: 'Error registering as tutor' });
                        return;
                    }

                    // Insert each day into availability_days table
                    const availabilityQuery = "INSERT INTO availability_days (username, days) VALUES ?";
                    const daysData = daysFree.map(day => [username, day]);
                    
                    db.query(availabilityQuery, [daysData], (err, availabilityResult) => {
                        if (err) {
                            console.error('Error inserting availability:', err);
                            res.status(500).send({ message: 'Error registering availability' });
                            return;
                        }
                        // User registered successfully as student and tutor
                        req.session.username = username; // Store username in session
                        res.status(200).send({ message: 'User registered successfully as student and tutor' });
                    });
                });
            } else {
                // User registered successfully as student
                req.session.username = username; // Store username in session
                res.status(200).send({ message: 'User registered successfully as student' });
            }
        }
    });
});
//get username
app.get('/getCurrentUser', (req, res) => {
    const currentUsername = req.session.username; // Assuming you store the username in the session
    res.send({ username: currentUsername });
});

const bodyParser = require('body-parser');

app.use(bodyParser.json());

//My Classes Page

// Fetch classes to attend
app.get('/getClassesToAttend', (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    const query = `
        SELECT c.class_id, co.course_name, co.ccode, c.c_date, c.c_time
        FROM class c
        JOIN courses_offered cof ON c.ccode = cof.ccode
        JOIN courses co ON cof.ccode = co.ccode
        JOIN courses_interested ci ON co.ccode = ci.ccode
        WHERE ci.username = ? AND c.c_date >= CURDATE()
        ORDER BY c.c_date, c.c_time
    `;

    db.query(query, [username, username], (err, results) => {
        if (err) {
            console.error('Error fetching classes to attend:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }
        res.json(results);
    });
});

// Handle joining a class
app.post('/joinClass', (req, res) => {
    const { classId } = req.body;
    const username = req.session.username;

    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }

        // Insert into s_name table
        const insertQuery = `
            INSERT INTO s_name (class_id, s_name)
            VALUES (?, ?)
        `;

        db.query(insertQuery, [classId, username], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error inserting into s_name:', err);
                    res.status(500).send({ message: 'Error joining class' });
                });
            }

            // Increment student_count in tutor table
            const updateQuery = `
                UPDATE tutor t
                JOIN class c ON t.username = c.tname
                SET t.student_count = t.student_count + 1
                WHERE c.class_id = ?
            `;

            db.query(updateQuery, [classId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error updating tutor student_count:', err);
                        res.status(500).send({ message: 'Error joining class' });
                    });
                }

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error committing transaction:', err);
                            res.status(500).send({ message: 'Error joining class' });
                        });
                    }
                    res.json({ message: 'Successfully joined the class' });
                });
            });
        });
    });
});

// Fetch courses offered by the tutor
app.get('/getCoursesTaught', (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    const query = `
        SELECT c.ccode, c.course_name 
        FROM courses_offered co
        JOIN courses c ON co.ccode = c.ccode
        WHERE co.username = ?
    `;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching courses taught:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }
        res.json(results);
    });
});


// Create a new class
app.post('/createClass', (req, res) => {
    const { ccode, date, time } = req.body;
    const username = req.session.username;

    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }

        // Insert into class table
        const classQuery = `
            INSERT INTO class (ccode, tname, c_date, c_time)
            VALUES (?, ?, ?, ?)
        `;

        db.query(classQuery, [ccode,username, date, time], (err, classResult) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error creating class:', err);
                    res.status(500).send({ message: 'Error creating class' });
                });
            }

            const classId = classResult.insertId;

            // Insert into classes_conducting table
            const conductingQuery = `
                INSERT INTO classes_conducting (class_id, username)
                VALUES (?, ?)
            `;

            db.query(conductingQuery, [classId, username], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error inserting into classes_conducting:', err);
                        res.status(500).send({ message: 'Error creating class' });
                    });
                }

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error committing transaction:', err);
                            res.status(500).send({ message: 'Error creating class' });
                        });
                    }
                    res.json({ message: 'Class created successfully', classId: classId });
                });
            });
        });
    });
});

// Update the getClassesToConduct route to join with classes_conducting
app.get('/getClassesToConduct', (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    const query = `
       SELECT c.class_id, co.course_name, c.ccode, c.c_date, c.c_time
        FROM class c
        JOIN courses co ON c.ccode = co.ccode
        WHERE c.tname = ? AND c.c_date >= CURDATE()
        ORDER BY c.c_date, c.c_time
    `;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching classes to conduct:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }
        res.json(results);
    });
});


app.get('/getCourses', (req, res) => {
    const username = req.session.username; // Retrieve username from session
    if (!username) {
        res.status(401).send({ message: 'Unauthorized: No session available' });
        return;
    }

    const fetchCoursesQuery = "SELECT c.ccode, c.course_name FROM courses_offered co JOIN courses c ON co.ccode = c.ccode WHERE co.username = ?";
    db.query(fetchCoursesQuery, [username], (err, coursesResult) => {
        if (err) {
            console.error('Error fetching courses:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }
        res.status(200).send({ courses: coursesResult });
    });
});
//Teach page

// Handle adding a course
app.post('/addCourse', (req, res) => {
    const { courseName } = req.body;
    const username = req.session.username; // Retrieve username from session
    if (!username) {
        res.status(401).send({ message: 'Unauthorized: No session available' });
        return;
    }
    const ccode = uuidv4().substr(0, 8); // Generate unique course code

    // Check if username exists in tutor table
    const tutorQuery = "SELECT * FROM tutor WHERE username = ?";
    db.query(tutorQuery, [username], (err, tutorResult) => {
        if (err) {
            console.error('Error checking tutor:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }

        if (tutorResult.length === 0) {
            res.status(404).send({ message: 'Tutor not found' });
            return;
        }

        // Insert into courses table
        const insertCourseQuery = "INSERT INTO courses (ccode, course_name) VALUES (?, ?)";
        db.query(insertCourseQuery, [ccode, courseName], (err, result) => {
            if (err) {
                console.error('Error inserting course:', err);
                res.status(500).send({ message: 'Internal server error' });
                return;
            }

            // Insert into courses_offered table
            const insertOfferedQuery = "INSERT INTO courses_offered (username, ccode) VALUES (?, ?)";
            db.query(insertOfferedQuery, [username, ccode], (err, result) => {
                if (err) {
                    console.error('Error inserting into courses_offered:', err);
                    res.status(500).send({ message: 'Internal server error' });
                    return;
                }

                // Fetch all courses offered by this tutor
                const fetchCoursesQuery = "SELECT c.ccode, c.course_name FROM courses_offered co JOIN courses c ON co.ccode = c.ccode WHERE co.username = ?";
                db.query(fetchCoursesQuery, [username], (err, coursesResult) => {
                    if (err) {
                        console.error('Error fetching courses:', err);
                        res.status(500).send({ message: 'Internal server error' });
                        return;
                    }
                    res.status(200).send({ message: 'Course added successfully', courses: coursesResult });
                });
            });
        });
    });
});



// Handle deleting a course
app.delete('/deleteCourse/:ccode', (req, res) => {
    const { ccode } = req.params;

    // Delete from courses_offered table
    const deleteOfferedQuery = "DELETE FROM courses_offered WHERE ccode = ?";
    db.query(deleteOfferedQuery, [ccode], (err, result) => {
        if (err) {
            console.error('Error deleting from courses_offered:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }

        // Delete from courses table
        const deleteCourseQuery = "DELETE FROM courses WHERE ccode = ?";
        db.query(deleteCourseQuery, [ccode], (err, result) => {
            if (err) {
                console.error('Error deleting course:', err);
                res.status(500).send({ message: 'Internal server error' });
                return;
            }
            res.status(200).send({ message: 'Course deleted successfully' });
        });
    });
});

//Learn Page

// Fetch all courses offered by all tutors
app.get('/getAllCourses', (req, res) => {
    const currentUsername = req.query.username;

    const fetchCoursesQuery = `
        SELECT t.username AS tutor_name, c.course_name, c.ccode, t.ratings, t.student_count, GROUP_CONCAT(d.days) AS days
        FROM courses_offered co
        JOIN courses c ON co.ccode = c.ccode
        JOIN tutor t ON co.username = t.username
        JOIN availability_days d ON co.username = d.username
        WHERE t.username != ?
        GROUP BY t.username, c.course_name, c.ccode;
    `;

    db.query(fetchCoursesQuery, [currentUsername], (err, coursesResult) => {
        if (err) {
            console.error('Error fetching courses:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }
        res.status(200).send({ courses: coursesResult });
    });
});

// Add course to interested list
app.post('/addCourseInterested', (req, res) => {
    const username = req.session.username; // Retrieve username from session
    const ccode = req.body.ccode;

    // Validate 'ccode' exists in 'courses' table
    const validateCourseQuery = "SELECT * FROM courses WHERE ccode = ?";
    db.query(validateCourseQuery, [ccode], (err, results) => {
        if (err) {
            console.error('Error validating course:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Course not found' });
            return;
        }

        // Proceed to insert into 'courses_interested'
        const addCourseQuery = "INSERT INTO courses_interested (username, ccode) VALUES (?, ?)";
        db.query(addCourseQuery, [username, ccode], (err, result) => {
            if (err) {
                console.error('Error adding course to interested list:', err);
                res.status(500).send({ message: 'Internal server error' });
                return;
            }

            // Fetch the course details to send back in the response
            const fetchCourseQuery = "SELECT * FROM courses WHERE ccode = ?";
            db.query(fetchCourseQuery, [ccode], (err, courseResult) => {
                if (err) {
                    console.error('Error fetching course details:', err);
                    res.status(500).send({ message: 'Internal server error' });
                    return;
                }

                const course = courseResult[0]; // Assuming ccode is unique, so only one result
                res.status(200).send({ course });
            });
        });
    });
});


// Fetch courses interested by the user
app.get('/getCoursesInterested', (req, res) => {
    const username = req.session.username; // Retrieve username from session
    if (!username) {
        res.status(401).send({ message: 'Unauthorized: No session available' });
        return;
    }

    const fetchInterestedCoursesQuery = `
        SELECT c.ccode, c.course_name
        FROM courses_interested ci
        JOIN courses c ON ci.ccode = c.ccode
        WHERE ci.username = ?`;
    db.query(fetchInterestedCoursesQuery, [username], (err, coursesResult) => {
        if (err) {
            console.error('Error fetching interested courses:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }
        res.status(200).send({ courses: coursesResult });
    });
});

// Delete course from interested list
app.delete('/deleteCourseInterested/:ccode', (req, res) => {
    const username = req.session.username; // Retrieve username from session
    const ccode = req.params.ccode;
    if (!username) {
        res.status(401).send({ message: 'Unauthorized: No session available' });
        return;
    }

    const deleteCourseQuery = "DELETE FROM courses_interested WHERE username = ? AND ccode = ?";
    db.query(deleteCourseQuery, [username, ccode], (err, result) => {
        if (err) {
            console.error('Error deleting course from interested list:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }
        res.status(200).send({ message: 'Course removed from interested list' });
    });
});

// LearnHistory Page

app.get('/getLearnHistory', (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    const query = `
        SELECT c.class_id, s.username AS tutor_name, co.course_name, c.c_date, c.c_time, c.ratings
        FROM class c
        JOIN s_name sn ON c.class_id = sn.class_id
        JOIN student s ON c.tname = s.username
        JOIN courses co ON c.ccode = co.ccode
        WHERE sn.s_name = ?
        ORDER BY c.c_date DESC, c.c_time DESC
    `;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching learn history:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }
        res.json(results);
    });
});

app.post('/submitRating', (req, res) => {
    const { classId, rating, feedback } = req.body;
    const username = req.session.username;

    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).send({ success: false, message: 'Internal server error' });
        }

        // Update class table
        const updateClassQuery = 'UPDATE class SET ratings = ?, feedback = ? WHERE class_id = ?';
        db.query(updateClassQuery, [rating, feedback, classId], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error updating class rating:', err);
                    res.status(500).send({ success: false, message: 'Error updating rating' });
                });
            }

            // Update tutor ratings
            const updateTutorQuery = `
               UPDATE tutor t
                JOIN (
                SELECT tname, AVG(ratings) as avg_rating
                FROM class
                WHERE tname = (SELECT tname FROM class WHERE class_id = ?)
                AND ratings IS NOT NULL
                GROUP BY tname
                ) c ON t.username = c.tname
                SET t.ratings = c.avg_rating
                WHERE t.username = c.tname
            `;
            db.query(updateTutorQuery, [classId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error updating tutor rating:', err);
                        res.status(500).send({ success: false, message: 'Error updating rating' });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error committing transaction:', err);
                            res.status(500).send({ success: false, message: 'Error updating rating' });
                        });
                    }
                    res.json({ success: true, message: 'Rating submitted successfully' });
                });
            });
        });
    });
});
//Teach History
app.get('/getTeachHistory', (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).send({ message: 'Unauthorized: No session available' });
    }

    const query = `
        SELECT c.class_id, co.course_name, c.c_date, c.c_time, AVG(c.ratings) as avg_ratings
        FROM class c
        JOIN courses co ON c.ccode = co.ccode
        WHERE c.tname = ? 
        GROUP BY c.class_id, co.course_name, c.c_date, c.c_time
        ORDER BY c.c_date DESC, c.c_time DESC
    `;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching teach history:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }
        res.json(results);
    });
});

app.post('/updateProfile', (req, res) => {
    const { name, phone, year, branch, email, username, password, tutorCheckbox, time, daysFree } = req.body;

    // Update student details
    const updateStudentQuery = `UPDATE student SET name = ?, phone = ?, year = ?, branch = ?, email = ?, password = ? WHERE username = ?`;
    db.query(updateStudentQuery, [name, phone, year, branch, email, password, username], (err) => {
        if (err) {
            console.error('Error updating student details:', err);
            return res.status(500).send({ success: false, message: 'Failed to update profile' });
        }

        if (tutorCheckbox) {
            // Check if user is already a tutor
            console.log('Checking if user is already a tutor...');
            const checkTutorQuery = `SELECT * FROM tutor WHERE username = ?`;
            db.query(checkTutorQuery, [username], (err, results) => {
                if (err) {
                    console.error('Error checking tutor details:', err);
                    return res.status(500).send({ success: false, message: 'Failed to update profile' });
                }

                if (results.length > 0) {
                    // User is already a tutor, update tutor details
                    console.log('User is already a tutor, updating tutor details...');
                    const updateTutorQuery = `UPDATE tutor SET time = ? WHERE username = ?`;
                    db.query(updateTutorQuery, [time, username], (err) => {
                        if (err) {
                            console.error('Error updating tutor details:', err);
                            return res.status(500).send({ success: false, message: 'Failed to update profile' });
                        }
                        console.log('Tutor details updated.');
                        // Update availability_days
                        updateAvailabilityDays(username, daysFree, res);
                    });
                } else {
                    // User is not a tutor, insert tutor details
                    console.log('User is not a tutor, inserting tutor details...');
                    const insertTutorQuery = `INSERT INTO tutor (username, time) VALUES (?, ?)`;
                    db.query(insertTutorQuery, [username, time], (err) => {
                        if (err) {
                            console.error('Error inserting tutor details:', err);
                            return res.status(500).send({ success: false, message: 'Failed to update profile' });
                        }
                        console.log('Tutor details inserted.');
                        // Insert availability_days
                        updateAvailabilityDays(username, daysFree, res);
                    });
                }
            });
        } else {
            return res.send({ success: true });
        }
    });
});

function updateAvailabilityDays(username, daysFree, res) {
    // Delete existing availability days
    const deleteDaysQuery = `DELETE FROM availability_days WHERE username = ?`;
    db.query(deleteDaysQuery, [username], (err) => {
        if (err) {
            console.error('Error deleting availability days:', err);
            return res.status(500).send({ success: false, message: 'Failed to update profile' });
        }

        // Insert new availability days
        const insertDaysQuery = `INSERT INTO availability_days (username, days) VALUES (?, ?)`;
        let insertCount = 0;
        daysFree.forEach(day => {
            db.query(insertDaysQuery, [username, day], (err) => {
                if (err) {
                    console.error('Error inserting availability days:', err);
                    return res.status(500).send({ success: false, message: 'Failed to update profile' });
                }
                insertCount++;
                if (insertCount === daysFree.length) {
                    console.log('Availability days inserted.');
                    return res.send({ success: true });
                }
            });
        });
    });
}


// Handle user logout
app.post('/logout', (req, res) => {
    // Destroy session upon logout
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send({ message: 'Internal server error' });
            return;
        }
        res.status(200).send({ message: 'Logged out successfully' });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
