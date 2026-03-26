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

async function getOrCreateSubfolder(drive, parentId, folderName) {
  try {
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id;
    }

    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };

    const createRes = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
      supportsAllDrives: true
    });

    // Make the folder publicly readable so files inside it can be read if inherited
    await drive.permissions.create({
      fileId: createRes.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true
    });

    return createRes.data.id;
  } catch (err) {
    console.error('Error in getOrCreateSubfolder:', err);
    return parentId; // Fallback to parent
  }
}

const uploadToGoogleDrive = async (file, userRole) => {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  let targetFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (targetFolderId && userRole) {
    const folderName = userRole === 'teacher' ? 'Teachers' : 'Students';
    targetFolderId = await getOrCreateSubfolder(drive, targetFolderId, folderName);
  }

  const fileMetadata = {
    name: file.originalname,
    parents: targetFolderId ? [targetFolderId] : []
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path)
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
    supportsAllDrives: true
  });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    },
    supportsAllDrives: true
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
