const express = require('express');
const { auth } = require('../middleware/auth');
const { db } = require('../config/firebase');

const router = express.Router();

// GET /api/alumni - Fetch all alumni
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;

    const snapshot = await db.collection('alumni').orderBy('batch', 'desc').get();
    let alumni = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    // Client-side search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      alumni = alumni.filter(a =>
        a.name.toLowerCase().includes(searchLower) ||
        (a.currentPosition && a.currentPosition.toLowerCase().includes(searchLower)) ||
        (a.description && a.description.toLowerCase().includes(searchLower))
      );
    }

    res.json({ alumni });
  } catch (err) {
    console.error('Fetch alumni error:', err);
    res.status(500).json({ error: 'Failed to fetch alumni data' });
  }
});

// GET /api/alumni/:id - Fetch single alumni
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await db.collection('alumni').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Alumni not found' });
    }
    res.json({ alumni: { _id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error('Fetch alumni error:', err);
    res.status(500).json({ error: 'Failed to fetch alumni data' });
  }
});

module.exports = router;
