require('dotenv').config();
const { uploadToGoogleDrive } = require('./backend/utils/googleDrive');
const fs = require('fs');

async function test() {
  fs.writeFileSync('test-file.txt', 'This is a test upload.');
  try {
    const res = await uploadToGoogleDrive({
      originalname: 'test-file.txt',
      mimetype: 'text/plain',
      path: 'test-file.txt'
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Failed:', err.message);
  }
}
test();
