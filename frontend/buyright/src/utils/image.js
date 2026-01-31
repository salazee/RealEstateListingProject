// src/utils/image.js

/**
 * Converts a normal Cloudinary URL into an optimized one
 * - f_auto  -> automatic format (WebP, AVIF, etc.)
 * - q_auto  -> automatic quality
 * - w_xxx   -> responsive width
 */

export const getOptimizedImage = (url, width = 800) => {
  if (!url) return '';

  // Safety check: only modify Cloudinary URLs
  if (!url.includes('/upload/')) return url;

  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width}/`
  );
};
