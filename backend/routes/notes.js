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

    let query = db.collection('notes').orderBy('createdAt', 'desc');

    // We'll filter client-side for search since Firestore doesn't support full-text
    const snapshot = await query.get();
    let notes = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

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

// DELETE /api/notes/:id - Delete a note (only by uploader)
router.delete('/:id', auth, async (req, res) => {
  try {
    const docRef = db.collection('notes').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = doc.data();
    if (noteData.uploadedBy !== req.user._id) {
      return res.status(403).json({ error: 'You can only delete your own notes' });
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
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
