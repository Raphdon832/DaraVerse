// src/services/authService.ts
// Authentication service – thin wrapper around Firebase Auth.
// Supports anonymous auth, email/password, and linking anonymous → email.

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously as firebaseSignInAnonymously,
    signOut as firebaseSignOut,
    linkWithCredential,
    EmailAuthProvider,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signInWithCredential,
    updateProfile,
    sendPasswordResetEmail,
    type User,
    type UserCredential,
    type Unsubscribe,
} from "firebase/auth";

import { auth } from "../config/firebase";

// ─── Anonymous sign-in ─────────────────────────────────────────────────────────
/** Sign in anonymously – creates a new anonymous user. */
export const signInAnonymously = (): Promise<UserCredential> =>
    firebaseSignInAnonymously(auth);

// ─── Google sign-in ────────────────────────────────────────────────────────────
/** Sign in with Google (Web Popup). Note: Native usesDifferent logic. */
export const signInWithGoogle = (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
};

/** Sign in to Firebase with a Google credential (IdToken). */
export const signInWithGoogleCredential = (idToken: string, accessToken?: string): Promise<UserCredential> => {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    return signInWithCredential(auth, credential);
};

// ─── Email/Password sign-up ────────────────────────────────────────────────────
export const signUp = async (
    email: string,
    password: string,
    displayName?: string,
): Promise<UserCredential> => {
    const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
    );
    if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
    }
    return credential;
};

// ─── Email/Password sign-in ────────────────────────────────────────────────────
export const signIn = (
    email: string,
    password: string,
): Promise<UserCredential> =>
    signInWithEmailAndPassword(auth, email, password);

// ─── Link anonymous account to email/password ──────────────────────────────────
/** Upgrade an anonymous account to a permanent email/password account. */
export const linkAnonymousToEmail = async (
    email: string,
    password: string,
): Promise<UserCredential> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No current user to link.");
    const credential = EmailAuthProvider.credential(email, password);
    return linkWithCredential(user, credential);
};

// ─── Check if current user is anonymous ────────────────────────────────────────
export const isAnonymous = (): boolean => auth.currentUser?.isAnonymous ?? true;

// ─── Sign-out ──────────────────────────────────────────────────────────────────
export const signOut = (): Promise<void> => firebaseSignOut(auth);

// ─── Password Reset ────────────────────────────────────────────────────────────
export const resetPassword = (email: string): Promise<void> =>
    sendPasswordResetEmail(auth, email);

// ─── Auth state listener ───────────────────────────────────────────────────────
export const onAuthChanged = (
    callback: (user: User | null) => void,
): Unsubscribe => onAuthStateChanged(auth, callback);

// ─── Current user helper ───────────────────────────────────────────────────────
export const getCurrentUser = (): User | null => auth.currentUser;
