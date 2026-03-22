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
        branch: 'CSE',
        phone: '1234567890',
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
        branch: 'CSE',
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

    await batch.commit();
    console.log('Successfully added mock users to database.');
    console.log('-------------------------------------------');
    console.log('Student Login:');
    console.log('Email: student@vcet.edu.in');
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
