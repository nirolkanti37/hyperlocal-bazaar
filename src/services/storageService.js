import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const DEFAULT_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: 'image/jpeg',
};

export const uploadImage = async (file, userId, path = 'products') => {
  try {
    // Compress image
    const compressedFile = await imageCompression(file, DEFAULT_OPTIONS);

    // Create unique filename
    const timestamp = Date.now();
    const extension = 'jpg';
    const filename = `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
    const fullPath = `${path}/${userId}/${filename}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, fullPath);
    await uploadBytes(storageRef, compressedFile);

    // Get download URL
    const url = await getDownloadURL(storageRef);

    return {
      success: true,
      url,
      path: fullPath,
      filename
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const uploadMultipleImages = async (files, userId, path = 'products') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, userId, path));
    const results = await Promise.all(uploadPromises);

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.warn(`${failed.length} images failed to upload`);
    }

    const successful = results.filter(r => r.success);
    return {
      success: true,
      images: successful.map(r => ({ url: r.url, path: r.path })),
      failedCount: failed.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteMultipleImages = async (imagePaths) => {
  try {
    const deletePromises = imagePaths.map(path => deleteImage(path));
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get image preview URL (for client-side preview before upload)
export const getImagePreview = (file) => {
  return URL.createObjectURL(file);
};

// Revoke preview URL (cleanup)
export const revokeImagePreview = (url) => {
  URL.revokeObjectURL(url);
};
