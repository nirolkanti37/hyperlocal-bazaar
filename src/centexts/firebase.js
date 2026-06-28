import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase Configuration - Hyperlocal Bazaar
const firebaseConfig = {
  apiKey: "AIzaSyDRKrsKY6Pg0746o0QijLtUnMmi46Nh_mk",
  authDomain: "hiperlocalbazer.firebaseapp.com",
  projectId: "hiperlocalbazer",
  storageBucket: "hiperlocalbazer.firebasestorage.app",
  messagingSenderId: "14459782791",
  appId: "1:14459782791:web:c8628273c7510ad6a85a22",
  measurementId: "G-0SCV8KZ9PM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// Re-exports for convenience
export { RecaptchaVerifier, signInWithPhoneNumber };

// Default export
export default app;
