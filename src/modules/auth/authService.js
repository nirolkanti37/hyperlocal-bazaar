import { 
  signInWithPhoneNumber, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

// Setup reCAPTCHA verifier — singleton per container, clears old one first
export const setupRecaptcha = (containerId) => {
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
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { success: true, confirmation };
  } catch (error) {
    // Clear bad verifier so next attempt starts fresh
    if (window._recaptchaVerifier) {
      try { window._recaptchaVerifier.clear(); } catch (_) {}
      window._recaptchaVerifier = null;
    }

    let friendlyMessage = 'OTP পাঠাতে ব্যর্থ হয়েছে';
    if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = 'এই ডোমেইন Firebase-এ authorized নয়। Firebase Console → Authentication → Settings → Authorized domains-এ domain যোগ করুন।';
    } else if (error.code === 'auth/invalid-phone-number') {
      friendlyMessage = 'ফোন নম্বরটি সঠিক নয়। +880 সহ পূর্ণ নম্বর দিন।';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyMessage = 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    } else if (error.code === 'auth/quota-exceeded') {
      friendlyMessage = 'SMS কোটা শেষ হয়ে গেছে। পরে আবার চেষ্টা করুন।';
    }

    return { success: false, error: friendlyMessage, code: error.code };
  }
};

// Verify OTP code
export const verifyOTP = async (confirmationResult, code) => {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    await createUserDocument(user);
    return { success: true, user };
  } catch (error) {
    let friendlyMessage = 'OTP ভুল বা মেয়াদ শেষ হয়ে গেছে';
    if (error.code === 'auth/invalid-verification-code') {
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
      fcmToken: null,
    });
  }
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
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
