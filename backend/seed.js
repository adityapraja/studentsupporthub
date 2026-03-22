/**
 * Seed script to populate Firestore with sample alumni data.
 * Run with: node backend/seed.js
 */

require('dotenv').config();
const { db } = require('./config/firebase');

const sampleAlumni = [
  {
    name: 'Rahul Sharma',
    batch: '2022',
    currentPosition: 'Software Engineer at Google',
    description: 'Specializes in distributed systems and cloud infrastructure. Active mentor for current students.',
    linkedin: 'https://linkedin.com/in/rahulsharma',
    whatsapp: '+91 9876543210',
    phone: '+91 9876543210'
  },
  {
    name: 'Priya Patel',
    batch: '2021',
    currentPosition: 'Data Scientist at Microsoft',
    description: 'Working on ML models for Azure. Previously interned at Amazon. Open to mentoring.',
    linkedin: 'https://linkedin.com/in/priyapatel',
    whatsapp: '+91 9876543211',
    phone: '+91 9876543211'
  },
  {
    name: 'Amit Kumar',
    batch: '2023',
    currentPosition: 'Cloud Architect at Amazon',
    description: 'AWS certified. Building scalable microservices. Happy to help with career guidance.',
    linkedin: 'https://linkedin.com/in/amitkumar',
    whatsapp: '+91 9876543212',
    phone: '+91 9876543212'
  },
  {
    name: 'Sneha Reddy',
    batch: '2020',
    currentPosition: 'Project Manager at Infosys',
    description: 'Leading cross-functional teams. PMP certified. Can guide on management career paths.',
    linkedin: 'https://linkedin.com/in/snehareddy',
    whatsapp: '+91 9876543213',
    phone: '+91 9876543213'
  },
  {
    name: 'Vikram Singh',
    batch: '2022',
    currentPosition: 'Frontend Developer at Flipkart',
    description: 'React and TypeScript expert. Contributing to open source. Available for mock interviews.',
    linkedin: 'https://linkedin.com/in/vikramsingh',
    whatsapp: '+91 9876543214',
    phone: '+91 9876543214'
  },
  {
    name: 'Ananya Gupta',
    batch: '2021',
    currentPosition: 'Systems Analyst at TCS',
    description: 'Enterprise systems integration. Oracle certified. Happy to share interview experiences.',
    linkedin: 'https://linkedin.com/in/ananyagupta',
    whatsapp: '+91 9876543215',
    phone: '+91 9876543215'
  },
  {
    name: 'Karthik Nair',
    batch: '2023',
    currentPosition: 'Backend Developer at Zoho',
    description: 'Building SaaS products. Java and Python. Open to helping juniors with DSA preparation.',
    linkedin: 'https://linkedin.com/in/karthiknair',
    whatsapp: '+91 9876543216',
    phone: '+91 9876543216'
  },
  {
    name: 'Meera Joshi',
    batch: '2020',
    currentPosition: 'DevOps Engineer at Wipro',
    description: 'CI/CD pipelines, Docker, Kubernetes. AWS and GCP experience. Can guide on DevOps careers.',
    linkedin: 'https://linkedin.com/in/meerajoshi',
    whatsapp: '+91 9876543217',
    phone: '+91 9876543217'
  }
];

async function seed() {
  try {
    console.log('Connected to Firebase');

    // Clear existing alumni data
    const existingDocs = await db.collection('alumni').get();
    const batch = db.batch();
    existingDocs.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('Cleared existing alumni data');

    // Insert sample alumni
    for (const alumniData of sampleAlumni) {
      await db.collection('alumni').add({
        ...alumniData,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`Inserted ${sampleAlumni.length} alumni records`);

    console.log('Done. Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
