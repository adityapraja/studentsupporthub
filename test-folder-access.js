require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'];

async function test() {
  console.log('Starting test...');
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'backend', 'config', 'google-credentials.json'),
    scopes: SCOPES
  });
  console.log('Auth initialized');
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    console.log('Fetching file list...');
    const res = await drive.files.list({
      pageSize: 1
    });
    console.log('List SUCCESS:', res.data.files);
  } catch (err) {
    console.error('List FAILED:', err.message);
  }
  process.exit(0);
}
test();
