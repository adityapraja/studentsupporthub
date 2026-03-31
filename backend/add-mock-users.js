require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('./config/firebase');

async function addMockUsers() {
  try {
    console.log('1. Starting script...');
    console.log('2. Hashing password...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('3. Password hashed.');

    const users = [
      {
        name: 'Demo Student',
        email: 'student@vcet.edu.in',
        password: hashedPassword,
        role: 'student',
        collegeId: 'STU12345',
        semester: 'VI',
        branch: 'INFT',
        phone: '1234567890',
        verified: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Demo Student 2',
        email: 'student2@vcet.edu.in',
        password: hashedPassword,
        role: 'student',
        collegeId: 'STU67890',
        semester: 'IV',
        branch: 'INFT',
        phone: '9876543210',
        verified: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Demo Teacher',
        email: 'teacher@vcet.edu.in',
        password: hashedPassword,
        role: 'teacher',
        collegeId: 'TCH9876',
        semester: '',
        branch: 'INFT',
        phone: '0987654321',
        verified: true,
        createdAt: new Date().toISOString()
      }
    ];

    const batch = db.batch();

    // Check if they already exist
    const emails = users.map(u => u.email);
    for (const email of emails) {
      const existing = await db.collection('users').where('email', '==', email).get();
      existing.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    // Add new docs
    for (const user of users) {
      const docRef = db.collection('users').doc();
      batch.set(docRef, user);
    }

    const clearCollection = async (collectionName) => {
      const snapshot = await db.collection(collectionName).get();
      if (snapshot.empty) return 0;

      const deleteBatch = db.batch();
      snapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
      return snapshot.size;
    };

    const deletedNotes = await clearCollection('notes');
    const deletedGrievances = await clearCollection('grievances');

    await batch.commit();
    console.log('Successfully added mock users to database.');
    console.log(`Cleared ${deletedNotes} notes.`);
    console.log(`Cleared ${deletedGrievances} grievances.`);
    console.log('-------------------------------------------');
    console.log('Student Login:');
    console.log('Email: student@vcet.edu.in');
    console.log('Password: password123');
    console.log('-------------------------------------------');
    console.log('Student 2 Login:');
    console.log('Email: student2@vcet.edu.in');
    console.log('Password: password123');
    console.log('-------------------------------------------');
    console.log('Teacher Login:');
    console.log('Email: teacher@vcet.edu.in');
    console.log('Password: password123');
    console.log('-------------------------------------------');
    process.exit(0);

  } catch (err) {
    console.error('Error adding mock users:', err);
    process.exit(1);
  }
}

addMockUsers();
