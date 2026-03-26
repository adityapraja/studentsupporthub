const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'teacher@vcet.edu.in',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Got token:', token.substring(0, 20) + '...');

    const filePath = 'test-file.txt';
    fs.writeFileSync(filePath, 'This is a test upload via the API.');
    
    console.log('Uploading file...');
    const form = new FormData();
    form.append('title', 'Test Note');
    form.append('subject', 'Math');
    form.append('file', fs.createReadStream(filePath));

    const uploadRes = await axios.post('http://localhost:3000/api/notes', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Upload SUCCESS:', uploadRes.data);

  } catch (err) {
    if (err.response) {
      console.error('Upload FAILED with status', err.response.status);
      console.error('Error info:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Upload FAILED without response:', err.message);
    }
  }
}
testUpload();
