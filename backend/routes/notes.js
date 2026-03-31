const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/notes - Upload a note
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, semester, tags } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const cloudinaryResult = await uploadToCloudinary(req.file, req.user.role);

    const noteData = {
      title,
      subject,
      semester: semester || '',
      branch: 'INFT',
      tags: tags || '',
      uploadedBy: req.user._id,
      uploaderName: req.user.name,
      fileLink: cloudinaryResult.secureUrl,
      cloudinaryPublicId: cloudinaryResult.publicId,
      type: req.user.role,
      isOfficial: req.user.role === 'teacher',
      isReported: false,
      reportCount: 0,
      reportedBy: [],
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('notes').add(noteData);

    res.status(201).json({
      message: 'Note uploaded successfully',
      note: { id: docRef.id, ...noteData }
    });
  } catch (err) {
    console.error('Upload note error:', err);
    res.status(500).json({ error: 'Failed to upload note' });
  }
});

// GET /api/notes - Fetch notes
router.get('/', auth, async (req, res) => {
  try {
    const { type, search, sortBy } = req.query;
    const currentUserId = req.user._id;

    let query = db.collection('notes').orderBy('createdAt', 'desc');

    // We'll filter client-side for search since Firestore doesn't support full-text
    const snapshot = await query.get();
    let notes = snapshot.docs.map(doc => {
      const noteData = doc.data();
      const reportedBy = Array.isArray(noteData.reportedBy) ? noteData.reportedBy : [];

      return {
        _id: doc.id,
        ...noteData,
        reportCount: noteData.reportCount || 0,
        isReported: Boolean(noteData.isReported),
        hasReportedByCurrentUser: reportedBy.includes(currentUserId)
      };
    });

    // Filter by type if specified
    if (type && ['student', 'teacher'].includes(type)) {
      notes = notes.filter(n => n.type === type);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(searchLower) ||
        n.subject.toLowerCase().includes(searchLower) ||
        (n.tags && n.tags.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    if (sortBy === 'semester') {
      notes.sort((a, b) => (a.semester || '').localeCompare(b.semester || ''));
    } else if (sortBy === 'subject') {
      notes.sort((a, b) => a.subject.localeCompare(b.subject));
    }
    // Default is by time (already sorted by createdAt desc)

    res.json({ notes });
  } catch (err) {
    console.error('Fetch notes error:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// PATCH /api/notes/:id/report - Report a note (students only)
router.patch('/:id/report', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can report notes' });
    }

    const docRef = db.collection('notes').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = doc.data();

    if (noteData.uploadedBy === req.user._id) {
      return res.status(400).json({ error: 'You cannot report your own note' });
    }

    const reportedBy = Array.isArray(noteData.reportedBy) ? noteData.reportedBy : [];
    if (reportedBy.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already reported this note' });
    }

    const updatedReportedBy = [...reportedBy, req.user._id];

    await docRef.update({
      reportedBy: updatedReportedBy,
      reportCount: updatedReportedBy.length,
      isReported: true,
      lastReportedAt: new Date().toISOString()
    });

    res.json({
      message: 'Note reported successfully',
      reportCount: updatedReportedBy.length
    });
  } catch (err) {
    console.error('Report note error:', err);
    res.status(500).json({ error: 'Failed to report note' });
  }
});

// PATCH /api/notes/:id/ignore-report - Ignore a report (teachers only)
router.patch('/:id/ignore-report', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can ignore reports' });
    }

    const docRef = db.collection('notes').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = doc.data();
    if (!noteData.isReported) {
      return res.status(400).json({ error: 'This note is not currently reported' });
    }

    await docRef.update({
      isReported: false,
      reportCount: 0,
      reportedBy: [],
      ignoredAt: new Date().toISOString(),
      ignoredBy: req.user._id
    });

    res.json({ message: 'Report ignored successfully' });
  } catch (err) {
    console.error('Ignore report error:', err);
    res.status(500).json({ error: 'Failed to ignore report' });
  }
});

// DELETE /api/notes/:id - Delete a note (only by uploader)
router.delete('/:id', auth, async (req, res) => {
  try {
    const docRef = db.collection('notes').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = doc.data();
    const isUploader = noteData.uploadedBy === req.user._id;
    const isTeacherRemovingReported = req.user.role === 'teacher' && noteData.isReported;

    if (!isUploader && !isTeacherRemovingReported) {
      return res.status(403).json({ error: 'You are not allowed to delete this note' });
    }

    // Best-effort cleanup in Cloudinary (old notes may not have this field)
    if (noteData.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(noteData.cloudinaryPublicId);
      } catch (cloudErr) {
        console.error('Cloudinary delete failed:', cloudErr);
      }
    }

    await docRef.delete();
    res.json({
      message: isTeacherRemovingReported ? 'Reported note removed successfully' : 'Note deleted successfully'
    });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
