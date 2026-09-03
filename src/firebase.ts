import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD3QFQ0ywi3oB27vluWOC4MX-YrhBxgO7g',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sufiyanautos-4975a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sufiyanautos-4975a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sufiyanautos-4975a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '69327235740',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:69327235740:web:57f834752f0bb2a8141b59'
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


