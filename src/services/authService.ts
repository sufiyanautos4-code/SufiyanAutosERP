import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { AuthUser, UserRole } from '../types';
import { debugFirebaseConfig, logAuthError } from '../utils/firebaseDebug';

const CURRENT_USER_SESSION_KEY = 'evee_active_user_session_v1';

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrator',
  SHOWROOM_MANAGER: 'Showroom & Branch Manager',
  SALES_OFFICER: 'Sales & Leasing Officer',
  ACCOUNTS_CASHIER: 'Accounts & Installments Cashier'
};

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-cyan-600'
];

export function getRandomAvatarBg(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing. If you saw "The requested action is invalid", Google Sign-In needs to be enabled in Firebase Console.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign-in. Please add localhost/your domain in Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Google sign-in is not supported in this environment. Please use a standard browser window.';
    case 'auth/auth-domain-config-required':
      return 'Firebase Auth configuration is missing. Please check your .env file.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled in your Firebase project. Please enable "Google" provider in Firebase Console > Authentication > Sign-in method.';
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Please check your .env file.';
    case 'auth/app-deleted':
      return 'Firebase app configuration is invalid.';
    case 'auth/invalid-user-token':
      return 'Your session has expired. Please sign in again.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access is temporarily disabled. Please try again later.';
    default:
      if (message.includes('auth/invalid-action-code') || message.includes('invalid action') || message.includes('requested action is invalid')) {
        return 'Google Sign-In is not enabled yet in your Firebase project. Please enable Google in Firebase Console > Authentication > Sign-in method.';
      }
      if (message.includes('unauthorized-domain') || message.includes('domain')) {
        return 'This domain is not authorized for authentication. Please add it to Authorized Domains in Firebase Console.';
      }
      if (message.includes('auth/')) {
        return message.split('auth/')[1].replace(/-/g, ' ').replace(/\)\.?$/, '');
      }
      return message || 'Authentication failed. Please try again or use email/password sign in.';
  }
}

/**
 * Fetch or initialize a user's Firestore profile under `users/{uid}`
 */
export async function getOrCreateUserProfile(
  firebaseUser: FirebaseUser,
  fallbackDetails?: {
    name?: string;
    phone?: string;
  }
): Promise<AuthUser> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const nowIso = new Date().toISOString();

  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      
      // Determine most accurate name
      let resolvedName = data.name;
      if (!resolvedName || resolvedName === 'Showroom Staff' || resolvedName === 'Showroom User') {
        resolvedName = fallbackDetails?.name || firebaseUser.displayName || resolvedName || 'User';
      }

      const phone = data.phone !== undefined ? data.phone : (fallbackDetails?.phone || '');

      const userProfile: AuthUser = {
        id: firebaseUser.uid,
        name: resolvedName,
        email: firebaseUser.email || data.email || '',
        phone,
        avatarBg: data.avatarBg || getRandomAvatarBg(),
        photoURL: firebaseUser.photoURL || data.photoURL || undefined,
        createdAt: data.createdAt || nowIso,
        lastLoginAt: nowIso
      };

      // Asynchronously update profile in Firestore with fresh lastLoginAt and any missing fields
      const updates: Record<string, any> = {
        lastLoginAt: nowIso,
        email: userProfile.email,
        name: resolvedName,
        updatedAt: serverTimestamp()
      };
      if (fallbackDetails?.phone && !data.phone) updates.phone = fallbackDetails.phone;

      updateDoc(userRef, updates).catch(() => {});

      return userProfile;
    } else {
      // Create clean new profile document without arbitrary defaults
      const name = fallbackDetails?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
      const avatarBg = getRandomAvatarBg();

      const newProfile: AuthUser = {
        id: firebaseUser.uid,
        name,
        email: firebaseUser.email || '',
        phone: fallbackDetails?.phone || '',
        avatarBg,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: nowIso,
        lastLoginAt: nowIso
      };

      await setDoc(userRef, {
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        phone: newProfile.phone,
        avatarBg: newProfile.avatarBg,
        photoURL: newProfile.photoURL || null,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        updatedAt: serverTimestamp()
      });

      return newProfile;
    }
  } catch (err) {
    console.warn('Firestore profile fetch error, generating local user profile:', err);
    return {
      id: firebaseUser.uid,
      name: fallbackDetails?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
      email: firebaseUser.email || '',
      phone: fallbackDetails?.phone || '',
      avatarBg: getRandomAvatarBg(),
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: nowIso,
      lastLoginAt: nowIso
    };
  }
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Clear old session cache immediately so old account data is never leaked
    clearLocalSessionUser();

    const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
    
    // Update Firebase Auth displayName
    if (data.name.trim()) {
      try {
        await updateProfile(cred.user, { displayName: data.name.trim() });
      } catch (e) {
        console.warn('Could not set displayName on auth user:', e);
      }
    }

    const userProfile = await getOrCreateUserProfile(cred.user, {
      name: data.name.trim(),
      phone: data.phone?.trim() || ''
    });

    saveLocalSessionUser(userProfile);
    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: getFriendlyAuthErrorMessage(err) };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    clearLocalSessionUser();
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const userProfile = await getOrCreateUserProfile(cred.user);
    saveLocalSessionUser(userProfile);
    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: getFriendlyAuthErrorMessage(err) };
  }
}

/**
 * Sign in with Google (OAuth Popup with Redirect Fallback)
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    // Debug configuration
    const debugInfo = debugFirebaseConfig();
    if (!debugInfo.isValid) {
      return { 
        success: false, 
        error: 'Firebase configuration is incomplete. Please check your .env file and restart the development server.' 
      };
    }

    clearLocalSessionUser();
    
    // Try popup first
    try {
      console.log('Attempting Google Sign-In with popup...');
      const cred = await signInWithPopup(auth, googleProvider);
      console.log('Google Sign-In popup successful');
      
      const userProfile = await getOrCreateUserProfile(cred.user, {
        name: cred.user.displayName || undefined
      });
      saveLocalSessionUser(userProfile);
      return { success: true, user: userProfile };
    } catch (popupError: any) {
      // Log detailed error for debugging
      logAuthError(popupError);
      
      // If popup fails, check if it's a blocker or user cancelled
      if (popupError.code === 'auth/popup-blocked') {
        throw popupError; // Re-throw to be caught by outer catch
      }
      if (popupError.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in was cancelled before completing.' };
      }
      if (popupError.code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Google sign-in was cancelled.' };
      }
      // For other errors, re-throw to outer catch
      throw popupError;
    }
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    logAuthError(err);
    return { success: false, error: getFriendlyAuthErrorMessage(err) };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err: any) {
    return { success: false, error: getFriendlyAuthErrorMessage(err) };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Error signing out:', err);
  } finally {
    clearLocalSessionUser();
  }
}

/**
 * Update User Profile document in Firestore
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<AuthUser, 'id' | 'email' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    if (updates.role) {
      payload.roleTitle = ROLE_LABELS[updates.role] || 'Staff Member';
    }
    await updateDoc(userRef, payload);

    // Also update cached session if matching
    const current = getLocalSessionUser();
    if (current && current.id === userId) {
      const merged = { ...current, ...updates, ...(updates.role ? { roleTitle: ROLE_LABELS[updates.role] } : {}) };
      saveLocalSessionUser(merged);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update user profile.' };
  }
}

/**
 * Real-time Auth State Subscription
 */
export function subscribeAuthState(
  onUserChanged: (user: AuthUser | null, loading: boolean) => void
): () => void {
  let unsubscribeDoc: (() => void) | null = null;

  const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
    if (unsubscribeDoc) {
      unsubscribeDoc();
      unsubscribeDoc = null;
    }

    if (firebaseUser) {
      // First try to load fast from local cache only if the UID matches
      const cached = getLocalSessionUser();
      if (cached && cached.id === firebaseUser.uid) {
        onUserChanged(cached, false);
      } else {
        // Clear mismatched stale session immediately
        clearLocalSessionUser();
      }

      // Real-time listener on user doc in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      unsubscribeDoc = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const profileName = data.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
            const profile: AuthUser = {
              id: firebaseUser.uid,
              name: profileName,
              email: firebaseUser.email || data.email || '',
              phone: data.phone || '',
              ...(data.role ? { role: data.role as UserRole, roleTitle: data.roleTitle || ROLE_LABELS[data.role as UserRole] } : {}),
              ...(data.shopLocation ? { shopLocation: data.shopLocation } : {}),
              avatarBg: data.avatarBg || 'bg-blue-600',
              photoURL: firebaseUser.photoURL || data.photoURL || undefined,
              createdAt: data.createdAt || new Date().toISOString(),
              lastLoginAt: data.lastLoginAt
            };
            saveLocalSessionUser(profile);
            onUserChanged(profile, false);
          } else {
            // Profile doc doesn't exist yet, create it safely with fallback details
            getOrCreateUserProfile(firebaseUser, {
              name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User')
            }).then((p) => {
              saveLocalSessionUser(p);
              onUserChanged(p, false);
            });
          }
        },
        async (error) => {
          console.warn('User doc listener error:', error);
          const fallback = await getOrCreateUserProfile(firebaseUser, {
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User')
          });
          saveLocalSessionUser(fallback);
          onUserChanged(fallback, false);
        }
      );
    } else {
      clearLocalSessionUser();
      onUserChanged(null, false);
    }
  });

  return () => {
    if (unsubscribeDoc) unsubscribeDoc();
    unsubscribeAuth();
  };
}

// ==========================================
// SESSION STORAGE HELPERS (FOR FAST 0ms BOOT)
// ==========================================

export function getLocalSessionUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalSessionUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
  } catch (err) {
    console.error('Session cache error:', err);
  }
}

export function clearLocalSessionUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
  } catch (err) {
    console.error('Session clear error:', err);
  }
}
