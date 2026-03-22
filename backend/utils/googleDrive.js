const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '..', 'config', 'google-credentials.json'),
    scopes: SCOPES
  });
  return auth;
}

const uploadToGoogleDrive = async (file) => {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: file.originalname,
    parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : []
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path)
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink'
  });

  // Make the file publicly readable
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });

  // Clean up the temporary local file
  fs.unlinkSync(file.path);

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
    webContentLink: response.data.webContentLink
  };
};

module.exports = { uploadToGoogleDrive };
