# Student Peer Tutoring System

A **full-stack web application** that allows university students to **register, offer, and request tutoring sessions**. The system connects peers for academic support, manages their teaching/learning histories, and tracks session progress.

## Features

- **User Registration & Login**  
  Students can sign up as learners, tutors, or both.
  
- **Course Matching**  
  Automatically matches students with tutors based on chosen subjects.

- **Session Management**  
  Create, join, and track tutoring sessions with details like date, time, and topic.

- **Feedback System**  
  Collect and display reviews to improve learning quality.

- **History Tracking**  
  Maintain logs of teaching and learning sessions.

---

## Tech Stack

**Frontend:** HTML, CSS, JavaScript (Dynamic UI)  
**Backend:** Node.js, Express.js  
**Database:** MySQL  
**Other Tools:** Git, npm

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/anvitha-acharya/StudentPeerTutoringSystem.git
cd StudentPeerTutoringSystem
```
### 2. Install Backend Dependencies
```bash
cd backend
npm install
```
### 3. Setup Database

Install MySQL and create database:
```sql
CREATE DATABASE peer_tutoring;
```
Import the SQL schema from database/schema.sql:
```bash
mysql -u root -p peer_tutoring < database/schema.sql
```
Update server.js with your MySQL username & password.

### 4. Run the application

```bash
npm start
```
The website will be running at http://localhost:3000


