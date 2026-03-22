const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Firebase (must be before routes)
require('./config/firebase');

const authRoutes = require('./routes/auth');
const grievanceRoutes = require('./routes/grievances');
const noteRoutes = require('./routes/notes');
const alumniRoutes = require('./routes/alumni');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/alumni', alumniRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'register.html'));
});

app.get('/otp', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'otp.html'));
});

app.get('/student-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'student-dashboard.html'));
});

app.get('/teacher-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'teacher-dashboard.html'));
});

app.get('/grievances', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'grievances.html'));
});

app.get('/grievance-details', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'grievance-details.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'notes.html'));
});

app.get('/upload-notes', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'upload-notes.html'));
});

app.get('/alumni', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'alumni.html'));
});

app.get('/teacher-grievances', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'teacher-grievances.html'));
});

app.get('/teacher-notes', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'teacher-notes.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Student Support Hub server running on port ${PORT}`);
});
