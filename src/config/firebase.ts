// src/config/firebase.ts
// Firebase configuration and initialization for the Daraverse app.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import * as FirebaseAuth from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrWjnwpwJos30-SRq1OuGVNAHXoAuCDp0",
    authDomain: "dara-verse.firebaseapp.com",
    projectId: "dara-verse",
    storageBucket: "dara-verse.firebasestorage.app",
    messagingSenderId: "425792079222",
    appId: "1:425792079222:web:fab9d1f77e3dc0551e6657",
    measurementId: "G-ZMZ1V3ZY52",
};

// ---------------------------------------------------------------------------
// Initialize Firebase – only once, even if this module is imported multiple
// times (hot-reload safety).
// ---------------------------------------------------------------------------
const app: FirebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ---------------------------------------------------------------------------
// Core Firebase services – export ready-to-use instances.
// Add more services here as needed (e.g. Functions, Realtime Database, etc.)
// ---------------------------------------------------------------------------

/** Firebase Authentication (persisted on native via AsyncStorage) */
const authInstance = (() => {
    const getAuth = FirebaseAuth.getAuth;
    const initializeAuth = FirebaseAuth.initializeAuth;
    const getReactNativePersistence = (
        FirebaseAuth as {
            getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
        }
    ).getReactNativePersistence;

    if (Platform.OS === "web") {
        return getAuth(app);
    }

    if (typeof getReactNativePersistence !== "function") {
        console.warn("React Native auth persistence helper unavailable; using default auth initialization.");
        return getAuth(app);
    }

    try {
        // Use RN persistence so users stay signed in across app restarts.
        return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage) as never,
        });
    } catch (error) {
        // Fallback for hot reload or if auth was already initialized.
        console.warn("Falling back to getAuth(app):", error);
        return getAuth(app);
    }
})();

export const auth: Auth = authInstance;

/** Cloud Firestore */
export const db: Firestore = getFirestore(app);

/** Cloud Storage */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Firebase Analytics – only available on web; on native builds
 * `isSupported()` will return false and analytics will be undefined.
 */
let analytics: Analytics | undefined;
isSupported()
    .then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    })
    .catch(() => {
        /* analytics not available – not critical */
    });

export { analytics };

// Export the raw app instance in case it's needed.
export default app;
