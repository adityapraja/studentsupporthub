const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { sendOTPEmail } = require('../utils/mailer');

const router = express.Router();

const COLLEGE_DOMAIN = process.env.COLLEGE_DOMAIN || 'vcet.edu.in';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, collegeId, semester, branch, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or teacher' });
    }

    // Validate college domain
    const emailDomain = email.split('@')[1];
    if (emailDomain !== COLLEGE_DOMAIN) {
      return res.status(400).json({ error: `Only @${COLLEGE_DOMAIN} emails are allowed` });
    }

    // Check if user already exists
    const existing = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    if (!existing.empty) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Create user document
    const userRef = await db.collection('users').add({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      collegeId: collegeId || '',
      semester: semester || '',
      branch: branch || '',
      phone: phone || '',
      verified: false,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful. OTP sent to your email.',
      email: email.toLowerCase(),
      userId: userRef.id
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date(userData.otpExpiry) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Mark user as verified and clear OTP
    await userDoc.ref.update({
      verified: true,
      otp: null,
      otpExpiry: null
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: userDoc.id, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        collegeId: userData.collegeId,
        semester: userData.semester,
        branch: userData.branch,
        phone: userData.phone
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const otp = generateOTP();

    await userDoc.ref.update({
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });

    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Check role matches
    if (role && userData.role !== role) {
      return res.status(400).json({ error: `This account is registered as a ${userData.role}` });
    }

    // Check if verified
    if (!userData.verified) {
      return res.status(400).json({ error: 'Account not verified. Please complete OTP verification.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: userDoc.id, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        collegeId: userData.collegeId,
        semester: userData.semester,
        branch: userData.branch,
        phone: userData.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        collegeId: userData.collegeId,
        semester: userData.semester,
        branch: userData.branch,
        phone: userData.phone
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/auth/mock-setup (For testing only)
router.get('/mock-setup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      {
        name: 'Demo Student', email: 'student@vcet.edu.in', password: hashedPassword,
        role: 'student', collegeId: 'STU12345', semester: 'VI', branch: 'CSE',
        phone: '1234567890', verified: true, createdAt: new Date().toISOString()
      },
      {
        name: 'Demo Teacher', email: 'teacher@vcet.edu.in', password: hashedPassword,
        role: 'teacher', collegeId: 'TCH9876', semester: '', branch: 'CSE',
        phone: '0987654321', verified: true, createdAt: new Date().toISOString()
      }
    ];

    const batch = db.batch();
    for (const email of users.map(u => u.email)) {
      const existing = await db.collection('users').where('email', '==', email).get();
      existing.docs.forEach(doc => batch.delete(doc.ref));
    }
    for (const user of users) {
      batch.set(db.collection('users').doc(), user);
    }
    await batch.commit();

    res.send(`
      <h2>Mock Users Created Successfully!</h2>
      <p><b>Student:</b> student@vcet.edu.in / password123</p>
      <p><b>Teacher:</b> teacher@vcet.edu.in / password123</p>
      <p><a href="/">Go to Login</a></p>
    `);
  } catch (err) {
    res.status(500).send('Error creating mock users: ' + err.message);
  }
});

module.exports = router;
