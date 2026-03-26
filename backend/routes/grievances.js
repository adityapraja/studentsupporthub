const express = require('express');
const multer = require('multer');
const { auth, requireRole } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { uploadToGoogleDrive } = require('../utils/googleDrive');
const { sendGrievanceNotification } = require('../utils/mailer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/grievances - Submit a grievance (students only)
router.post('/', auth, requireRole('student'), upload.single('attachment'), async (req, res) => {
  try {
    const { title, category, priority, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Title, category, and description are required' });
    }

    let attachmentLink = null;
    if (req.file) {
      try {
        // Pass role so Drive uploads go to the correct subfolder
        const driveResult = await uploadToGoogleDrive(req.file, req.user.role);
        attachmentLink = driveResult.webViewLink;
      } catch (driveErr) {
        console.error('Google Drive upload failed:', driveErr);
      }
    }

    const grievanceData = {
      title,
      category,
      priority: priority || 'Medium',
      description,
      status: 'Submitted',
      submittedBy: req.user._id,
      attachmentLink,
      teacherReply: null,
      repliedBy: null,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('grievances').add(grievanceData);

    // Send email notification to authority
    try {
      await sendGrievanceNotification({ ...grievanceData, id: docRef.id });
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
    }

    res.status(201).json({
      message: 'Grievance submitted successfully',
      grievance: { id: docRef.id, ...grievanceData }
    });
  } catch (err) {
    console.error('Submit grievance error:', err);
    res.status(500).json({ error: 'Failed to submit grievance' });
  }
});

// GET /api/grievances - Get grievances
router.get('/', auth, async (req, res) => {
  try {
    let query;

    if (req.user.role === 'student') {
      query = db.collection('grievances')
        .where('submittedBy', '==', req.user._id)
        .orderBy('createdAt', 'desc');
    } else if (req.user.role === 'teacher') {
      query = db.collection('grievances')
        .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    const grievances = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    res.json({ grievances });
  } catch (err) {
    console.error('Fetch grievances error:', err);
    res.status(500).json({ error: 'Failed to fetch grievances' });
  }
});

// GET /api/grievances/:id - Get single grievance
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await db.collection('grievances').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const grievance = { _id: doc.id, ...doc.data() };

    // Students can only view their own
    if (req.user.role === 'student' && grievance.submittedBy !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ grievance });
  } catch (err) {
    console.error('Fetch grievance error:', err);
    res.status(500).json({ error: 'Failed to fetch grievance' });
  }
});

// PUT /api/grievances/:id/reply - Reply to a grievance (teachers only)
router.put('/:id/reply', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { reply, status } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply is required' });
    }

    const validStatuses = ['Submitted', 'Under Review', 'Resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const docRef = db.collection('grievances').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const updateData = {
      teacherReply: reply,
      repliedBy: req.user._id
    };
    if (status) {
      updateData.status = status;
    }

    await docRef.update(updateData);

    const updated = await docRef.get();
    res.json({
      message: 'Reply submitted successfully',
      grievance: { _id: updated.id, ...updated.data() }
    });
  } catch (err) {
    console.error('Reply grievance error:', err);
    res.status(500).json({ error: 'Failed to reply to grievance' });
  }
});

// PUT /api/grievances/:id/status - Update grievance status (teachers only)
router.put('/:id/status', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const docRef = db.collection('grievances').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    await docRef.update({ status });

    const updated = await docRef.get();
    res.json({
      message: 'Status updated successfully',
      grievance: { _id: updated.id, ...updated.data() }
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
