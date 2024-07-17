const express = require('express');
const mysql = require('mysql');
const port = process.env.PORT || 8081;
const app = express();
const path = require('path');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: ""
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Fetch user from the database
    const query = 'SELECT * FROM student WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).send({ success: false, message: 'Internal server error' });
            return;
        }
        if (results.length > 0) {
            res.send({ success: true });
        } else {
            res.send({ success: false, message: 'Invalid username or password' });
        }
    });
});

app.post('/signup', (req, res) => {
    const { name, year, branch, email, phone, username, password } = req.body;
    const sql = `INSERT INTO student (name, year, branch, email, phone, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, year, branch, email, phone, username, password], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error inserting user');
            return;
        }
        console.log('User inserted successfully');
        res.send('User inserted successfully');
    });
});


app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
