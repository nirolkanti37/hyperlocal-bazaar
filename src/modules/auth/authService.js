import { 
  signInWithPhoneNumber, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

// ── Network Check ──────────────────────────────────────
const isOnline = () => {
  return navigator.onLine;
};

// ── Email / Password Auth ──────────────────────────────────────

export const registerWithEmail = async (email, password, displayName) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    createUserDocument({ ...result.user, displayName }).catch(() => {});
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: emailErrorMessage(error) };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: emailErrorMessage(error) };
  }
};

export const resetPassword = async (email) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: emailErrorMessage(error) };
  }
};

const emailErrorMessage = (error) => {
  // Handle network errors first
  if (!isOnline()) {
    return 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে। লগইন করুন।';
    case 'auth/invalid-email':
      return 'ইমেইল ঠিকানাটি সঠিক নয়।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
    case 'auth/user-not-found':
      return 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই। নিবন্ধন করুন।';
    case 'auth/wrong-password':
      return 'পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।';
    case 'auth/invalid-credential':
      return 'ইমেইল বা পাসওয়ার্ড ভুল।';
    case 'auth/too-many-requests':
      return 'অনেকবার ভুল হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।';
    case 'auth/network-request-failed':
      return 'নেটওয়ার্ক সমস্যা। ইন্টারনেট চেক করুন।';
    default:
      return 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।';
  }
};

// Setup reCAPTCHA verifier — singleton per container, clears old one first
export const setupRecaptcha = (containerId) => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Clear existing verifier to avoid "already rendered" error
  if (window._recaptchaVerifier) {
    try {
      window._recaptchaVerifier.clear();
    } catch (_) {}
    window._recaptchaVerifier = null;
  }

  window._recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      // Auto-clear so next attempt gets a fresh verifier
      window._recaptchaVerifier = null;
    },
  });

  return window._recaptchaVerifier;
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।', code: 'network-error' };
    }

    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { success: true, confirmation };
  } catch (error) {
    // Clear bad verifier so next attempt starts fresh
    if (typeof window !== 'undefined' && window._recaptchaVerifier) {
      try { window._recaptchaVerifier.clear(); } catch (_) {}
      window._recaptchaVerifier = null;
    }

    let friendlyMessage = 'OTP পাঠাতে ব্যর্থ হয়েছে';
    const msg = error.message || '';

    // Check network first
    if (!isOnline()) {
      friendlyMessage = 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।';
    } else if (error.code === 'auth/billing-not-enabled' || msg.includes('BILLING_NOT_ENABLED')) {
      friendlyMessage = 'SMS সেবা চালু নেই। Firebase Blaze Plan দরকার। অ্যাডমিনকে জানান।';
    } else if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = 'এই domain অনুমোদিত নয়।';
    } else if (error.code === 'auth/invalid-phone-number') {
      friendlyMessage = 'ফোন নম্বরটি সঠিক নয়। ১১ ডিজিটের নম্বর দিন।';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyMessage = 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    } else if (error.code === 'auth/quota-exceeded') {
      friendlyMessage = 'SMS কোটা শেষ। পরে আবার চেষ্টা করুন।';
    } else if (error.code === 'auth/captcha-check-failed') {
      friendlyMessage = 'reCAPTCHA ব্যর্থ। পেজ reload করে আবার চেষ্টা করুন।';
    } else if (error.code === 'auth/network-request-failed') {
      friendlyMessage = 'নেটওয়ার্ক সমস্যা। ইন্টারনেট চেক করুন।';
    }

    return { success: false, error: friendlyMessage, code: error.code };
  }
};

// Verify OTP code
export const verifyOTP = async (confirmationResult, code) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    const result = await confirmationResult.confirm(code);
    const user = result.user;

    // Save user doc to Firestore — non-blocking: failure doesn't break login
    createUserDocument(user).catch(() => {
      // Firestore might be offline or not set up yet — login still succeeds
    });

    return { success: true, user };
  } catch (error) {
    let friendlyMessage = 'OTP ভুল বা মেয়াদ শেষ হয়ে গেছে';
    
    if (!isOnline()) {
      friendlyMessage = 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।';
    } else if (error.code === 'auth/invalid-verification-code') {
      friendlyMessage = 'OTP কোডটি ভুল। আবার চেক করুন।';
    } else if (error.code === 'auth/code-expired') {
      friendlyMessage = 'OTP-এর মেয়াদ শেষ। আবার OTP পাঠান।';
    }
    
    return { success: false, error: friendlyMessage, code: error.code };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const getCurrentUser = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Update user profile
export const updateUserProfile = async (user, data) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    await updateProfile(user, data);
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create user document in Firestore
export const createUserDocument = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      location: null,
      rating: 0,
      reviewCount: 0,
      isSeller: false,
      isAdmin: false,
      fcmToken: null,
    });
  }
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
