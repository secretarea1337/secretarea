import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged 
} from 'firebase/auth';
import { getFirestore, doc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCs7GCq4TKOqjaEo7OsoQ6RkGhaT1m0bXw",
  authDomain: "secretarea-1337.firebaseapp.com",
  projectId: "secretarea-1337",
  storageBucket: "secretarea-1337.firebasestorage.app",
  messagingSenderId: "58466402021",
  appId: "1:58466402021:web:ba224f579527f3b4ae1e0c"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Augment auth instance to preserve compatibility with existing call sites
if (typeof (auth as any).onAuthStateChanged !== 'function') {
  (auth as any).onAuthStateChanged = (cb: (user: any) => void) => firebaseOnAuthStateChanged(auth, cb);
}
if (typeof (auth as any).signOut !== 'function') {
  (auth as any).signOut = () => firebaseSignOut(auth);
}

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
export const discordProvider = new OAuthProvider('discord.com');
export const githubProvider = new GithubAuthProvider();

// Sign-in helper functions
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      console.warn(`[Firebase Auth] Domain '${host}' is not in your Firebase Console Authorized Domains list. Please add it in Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
    }
    throw error;
  }
};

export const signInWithDiscord = async () => {
  try {
    return await signInWithPopup(auth, discordProvider);
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      console.warn(`[Firebase Auth] Domain '${host}' is not in your Firebase Console Authorized Domains list. Please add it in Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
    }
    throw error;
  }
};

export const signInWithGithub = async () => {
  try {
    return await signInWithPopup(auth, githubProvider);
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      console.warn(`[Firebase Auth] Domain '${host}' is not in your Firebase Console Authorized Domains list. Please add it in Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
    }
    throw error;
  }
};

// Export standalone auth methods for flexibility
export const onAuthStateChanged = (cb: (user: any) => void) => firebaseOnAuthStateChanged(auth, cb);
export const signOut = () => firebaseSignOut(auth);
export const logout = signOut;

export default app;
