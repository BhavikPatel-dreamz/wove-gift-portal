import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary once
cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
  secure: true
});

export async function uploadFile(file, folderName) {
  try {
    // Handle both File/Buffer inputs
    const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
}

export async function deleteFile(imageUrl) {
  if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) {
    return;
  }

  try {
    const urlParts = imageUrl.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const fullPublicId = `${folder}/${publicId}`;
    
    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error('Failed to delete Cloudinary image:', error);
    throw error;
  }
}