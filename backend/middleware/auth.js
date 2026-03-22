const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { _id: userDoc.id, ...userDoc.data() };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, requireRole };
