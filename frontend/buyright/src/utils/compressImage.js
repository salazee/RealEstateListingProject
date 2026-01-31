// src/utils/compressImage.js
import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.6,          // max 600kb
    maxWidthOrHeight: 1280,  // resize large images
    useWebWorker: true,
  };

  return await imageCompression(file, options);
};
