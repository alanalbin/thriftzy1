import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut
} from 'firebase/auth';

// Firebase configuration using Vite environment variables with graceful store defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA_DEMO_THRIFTZY_STORE_AUTH',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'thriftzy-store.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'thriftzy-store',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'thriftzy-store.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1084226305417',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1084226305417:web:8c5b96f13e7d'
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Check if user has provided active custom Firebase keys in .env
export function isFirebaseConfigured() {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(key && !key.includes('DEMO'));
}

/**
 * Sign In with Google via Firebase Auth
 * Triggers official Firebase Google popup window
 */
export async function signInWithFirebaseGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userData = {
      firebase_uid: user.uid,
      google_id: user.providerData?.[0]?.uid || user.uid,
      email: (user.email || '').trim().toLowerCase(),
      name: user.displayName || user.email?.split('@')[0] || 'Customer',
      avatar:
        user.photoURL ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email)}`,
      phone: user.phoneNumber || '',
      auth_provider: 'firebase_google'
    };

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.warn('[Firebase Auth] signInWithPopup info:', error.code, error.message);
    return {
      success: false,
      errorCode: error.code,
      errorMessage: error.message
    };
  }
}

/**
 * Firebase Sign Out
 */
export async function firebaseSignOut() {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('[Firebase Auth] Sign out notice:', e);
  }
}
