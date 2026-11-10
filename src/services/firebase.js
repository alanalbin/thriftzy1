import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut
} from 'firebase/auth';

const STORAGE_KEY = 'thriftzy_firebase_config';

/**
 * Retrieve current Firebase configuration from localStorage or Vite environment variables
 */
export function getFirebaseConfig() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.apiKey) return parsed;
      }
    } catch (e) {}
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'thriftzy-store.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'thriftzy-store',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'thriftzy-store.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1084226305417',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1084226305417:web:8c5b96f13e7d'
  };
}

/**
 * Check if a real, valid Firebase API key is configured
 */
export function isFirebaseConfigured() {
  const cfg = getFirebaseConfig();
  return Boolean(
    cfg?.apiKey &&
    cfg.apiKey.length > 20 &&
    !cfg.apiKey.includes('DEMO') &&
    !cfg.apiKey.includes('your_firebase')
  );
}

// Initialize Firebase App
let firebaseApp = null;
let firebaseAuth = null;
let googleAuthProvider = null;

function initFirebase() {
  try {
    const config = getFirebaseConfig();
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else if (config.apiKey) {
      firebaseApp = initializeApp(config);
    } else {
      // Default placeholder app
      firebaseApp = initializeApp({
        apiKey: 'AIzaSyA_DEMO_KEY_PLEASE_CONFIGURE',
        authDomain: 'thriftzy-store.firebaseapp.com',
        projectId: 'thriftzy-store',
        appId: '1:1084226305417:web:8c5b96f13e7d'
      });
    }

    firebaseAuth = getAuth(firebaseApp);
    googleAuthProvider = new GoogleAuthProvider();
    googleAuthProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (err) {
    console.warn('[Firebase] Initialization notice:', err);
  }
}

initFirebase();

export const auth = firebaseAuth;
export const googleProvider = googleAuthProvider;

/**
 * Save user-provided Firebase configuration to localStorage and re-initialize
 */
export function saveFirebaseConfig(newConfig) {
  if (typeof window !== 'undefined' && newConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    initFirebase();
  }
}

/**
 * Sign In with Google via Firebase Auth
 * Triggers official Firebase Google popup window
 */
export async function signInWithFirebaseGoogle() {
  if (!firebaseAuth || !googleAuthProvider) {
    initFirebase();
  }

  try {
    const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
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
    console.warn('[Firebase Auth] signInWithPopup error code:', error.code, error.message);

    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        cancelled: true,
        errorCode: error.code,
        errorMessage: 'Sign-in window was closed before completion.'
      };
    }

    if (error.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
      return {
        success: false,
        unauthorizedDomain: true,
        errorCode: error.code,
        errorMessage: `Domain "${currentHost}" is not authorized. Please add it in Firebase Console -> Authentication -> Settings -> Authorized domains.`
      };
    }

    if (
      error.code === 'auth/invalid-api-key' ||
      error.code === 'auth/api-key-not-valid' ||
      error.code === 'auth/app-deleted'
    ) {
      return {
        success: false,
        needsConfig: true,
        errorCode: error.code,
        errorMessage: 'Invalid Firebase API Key. Please provide your Firebase Web App credentials.'
      };
    }

    return {
      success: false,
      errorCode: error.code,
      errorMessage: error.message || 'Firebase Google authentication failed.'
    };
  }
}

/**
 * Firebase Sign Out
 */
export async function firebaseSignOut() {
  try {
    if (firebaseAuth) {
      await fbSignOut(firebaseAuth);
    }
  } catch (e) {
    console.warn('[Firebase Auth] Sign out notice:', e);
  }
}
