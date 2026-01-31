// src/utils/uploadToCloudinary.js
import { compressImage } from './compressImage';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided');

  // ✅ compress BEFORE upload
  const compressedFile = await compressImage(file);

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error('Image upload failed');
  }

  const data = await res.json();

  // IMPORTANT: still return secure_url
  return data.secure_url;
};
