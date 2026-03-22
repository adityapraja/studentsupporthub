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
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/alumni', alumniRoutes);

// Catch-all route for React frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Student Support Hub server running on port ${PORT}`);
});
