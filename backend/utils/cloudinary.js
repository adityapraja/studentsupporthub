const fs = require('fs');
const cloudinary = require('cloudinary').v2;

function getUploadFolder(uploadType, userRole) {
  const roleFolder = userRole === 'teacher' ? 'Teachers' : 'Students';

  if (uploadType === 'grievances') {
    return `grievances/${roleFolder}`;
  }

  return `notes/${roleFolder}`;
}

function assertCloudinaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary env vars missing (CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET)');
  }
}

async function uploadToCloudinary(file, userRole, uploadType = 'notes') {
  assertCloudinaryConfigured();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const folder = getUploadFolder(uploadType, userRole);

  let result;
  try {
    // Use raw so PDFs/DOCs/PPTs upload reliably (not just images)
    result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'raw',
      folder
    });
  } finally {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }

  return {
    secureUrl: result.secure_url || result.url,
    publicId: result.public_id
  };
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) return;

  assertCloudinaryConfigured();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw'
  });
}

module.exports = { uploadToCloudinary, deleteFromCloudinary };

