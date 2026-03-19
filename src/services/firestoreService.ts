// src/services/firestoreService.ts
// Firestore helpers – generic CRUD operations.
// Import and use these helpers throughout the app instead of
// calling Firestore directly.

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    type DocumentData,
    type QueryConstraint,
    type DocumentReference,
    type Unsubscribe,
    type WhereFilterOp,
} from "firebase/firestore";

import { db } from "../config/firebase";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Get a reference to a Firestore collection. */
export const getCollectionRef = (path: string) => collection(db, path);

/** Get a reference to a Firestore document. */
export const getDocRef = (collectionPath: string, docId: string) =>
    doc(db, collectionPath, docId);

// ─── READ ──────────────────────────────────────────────────────────────────────

/** Fetch a single document by its path and ID. */
export const getDocument = async <T = DocumentData>(
    collectionPath: string,
    docId: string,
): Promise<(T & { id: string }) | null> => {
    const snap = await getDoc(doc(db, collectionPath, docId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as T) };
};

/** Fetch all documents in a collection (with optional query constraints). */
export const getDocuments = async <T = DocumentData>(
    collectionPath: string,
    ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> => {
    const q = query(collection(db, collectionPath), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
};

// ─── WRITE ─────────────────────────────────────────────────────────────────────

/** Create a new document with an auto-generated ID. */
export const createDocument = async <T extends DocumentData>(
    collectionPath: string,
    data: T,
): Promise<DocumentReference> =>
    addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

/** Create or overwrite a document with a specific ID. */
export const setDocument = async <T extends DocumentData>(
    collectionPath: string,
    docId: string,
    data: T,
    merge = true,
): Promise<void> =>
    setDoc(
        doc(db, collectionPath, docId),
        {
            ...data,
            updatedAt: serverTimestamp(),
        },
        { merge },
    );

/** Partially update an existing document. */
export const updateDocument = async (
    collectionPath: string,
    docId: string,
    data: Partial<DocumentData>,
): Promise<void> =>
    updateDoc(doc(db, collectionPath, docId), {
        ...data,
        updatedAt: serverTimestamp(),
    });

// ─── DELETE ────────────────────────────────────────────────────────────────────

/** Delete a document by path and ID. */
export const removeDocument = async (
    collectionPath: string,
    docId: string,
): Promise<void> => deleteDoc(doc(db, collectionPath, docId));

// ─── REAL-TIME ─────────────────────────────────────────────────────────────────

/** Subscribe to real-time updates on a collection. */
export const subscribeToCollection = <T = DocumentData>(
    collectionPath: string,
    callback: (docs: (T & { id: string })[]) => void,
    ...constraints: QueryConstraint[]
): Unsubscribe => {
    const q = query(collection(db, collectionPath), ...constraints);
    return onSnapshot(q, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
        callback(data);
    });
};

/** Subscribe to real-time updates on a single document. */
export const subscribeToDocument = <T = DocumentData>(
    collectionPath: string,
    docId: string,
    callback: (doc: (T & { id: string }) | null) => void,
): Unsubscribe =>
    onSnapshot(doc(db, collectionPath, docId), (snap) => {
        if (!snap.exists()) {
            callback(null);
            return;
        }
        callback({ id: snap.id, ...(snap.data() as T) });
    });

// ─── Re-exports for convenience ────────────────────────────────────────────────
export {
    where,
    orderBy,
    limit,
    serverTimestamp,
    type QueryConstraint,
    type WhereFilterOp,
};
