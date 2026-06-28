import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// FOR DEVELOPMENT ONLY: Disable app verification on localhost
// This removes the reCAPTCHA requirement when testing locally
// REMOVE THIS LINE BEFORE DEPLOYING TO PRODUCTION!
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  auth.settings.appVerificationDisabledForTesting = true;
  console.log('%c[DEV] App verification disabled for testing on localhost', 'color: orange; font-weight: bold');
}

/**
 * Setup invisible reCAPTCHA verifier
 * @param {HTMLElement} containerElement - The actual DOM element (from useRef)
 */
export const setupRecaptcha = (containerElement) => {
  try {
    // Clean up existing verifier
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        // ignore cleanup errors
      }
      window.recaptchaVerifier = null;
    }

    if (!containerElement) {
      throw new Error('reCAPTCHA container element is null');
    }

    // Create invisible reCAPTCHA using the actual DOM element
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerElement, {
      size: 'invisible',
      callback: (response) => {
        console.log('reCAPTCHA verified:', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        resetRecaptcha();
      }
    });

    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    throw error;
  }
};

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number with country code
 * @param {HTMLElement} containerElement - reCAPTCHA container element (from useRef)
 */
export const sendOTP = async (phoneNumber, containerElement) => {
  try {
    // Setup reCAPTCHA fresh each time
    setupRecaptcha(containerElement);

    if (!window.recaptchaVerifier) {
      throw new Error('reCAPTCHA initialization failed');
    }

    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+88${phoneNumber.replace(/^0/, '')}`;

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      window.recaptchaVerifier
    );

    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    console.error('OTP send error:', error);

    if (error.code === 'auth/captcha-check-failed') {
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number. Please check and try again.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    }
    if (error.code === 'auth/argument-error') {
      throw new Error('reCAPTCHA setup error. Please refresh the page.');
    }
    if (error.code === 'auth/missing-app-credential') {
      throw new Error('App verification failed. Please refresh the page.');
    }

    throw error;
  }
};

/**
 * Verify OTP code
 * @param {string} otpCode - The 6-digit OTP
 */
export const verifyOTP = async (otpCode) => {
  try {
    if (!window.confirmationResult) {
      throw new Error('No OTP request found. Please request OTP first.');
    }

    const result = await window.confirmationResult.confirm(otpCode);
    const user = result.user;

    await createUserDocument(user);
    return result;
  } catch (error) {
    console.error('OTP verification error:', error);

    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP. Please check and try again.');
    }
    if (error.code === 'auth/code-expired') {
      throw new Error('OTP expired. Please request a new one.');
    }

    throw error;
  }
};

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (user) => {
  try {
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
        isActive: true,
        role: 'user',
        location: null,
        rating: 0,
        totalSales: 0,
        followers: [],
        following: []
      });
    } else {
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { uid, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updateProfile(user, {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL
    });

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await signOut(auth);
    resetRecaptcha();
    window.confirmationResult = null;
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Reset reCAPTCHA
 */
export const resetRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
    window.recaptchaVerifier = null;
  }
  if (window.recaptchaWidgetId) {
    window.recaptchaWidgetId = null;
  }
};