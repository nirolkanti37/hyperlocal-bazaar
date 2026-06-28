import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDRKrsKY6Pg0746o0QijLtUnMmi46Nh_mk",
  authDomain: "hiperlocalbazer.firebaseapp.com",
  projectId: "hiperlocalbazer",
  storageBucket: "hiperlocalbazer.firebasestorage.app",
  messagingSenderId: "14459782791",
  appId: "1:14459782791:web:c8628273c7510ad6a85a22",
  measurementId: "G-0SCV8KZ9PM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;
