const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'firebase-credentials.json');

let db;
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log('Firebase initialized successfully');
} catch (err) {
  console.error('Firebase initialization error:', err.message);
  console.error('Make sure firebase-credentials.json exists in backend/config/');
  process.exit(1);
}

module.exports = { admin, db };
