// src/services/storageService.ts
// Cloud Storage helpers for file uploads / downloads.

import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    type UploadResult,
    type UploadTask,
} from "firebase/storage";

import { storage } from "../config/firebase";

// ─── Upload (full) ─────────────────────────────────────────────────────────────

/** Upload a Blob / File to the given storage path and return its download URL. */
export const uploadFile = async (
    path: string,
    file: Blob | Uint8Array | ArrayBuffer,
    metadata?: Record<string, string>,
): Promise<{ uploadResult: UploadResult; downloadURL: string }> => {
    const storageRef = ref(storage, path);
    const uploadResult = await uploadBytes(storageRef, file, {
        customMetadata: metadata,
    });
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return { uploadResult, downloadURL };
};

// ─── Upload (resumable) ────────────────────────────────────────────────────────

/** Start a resumable upload – use the returned UploadTask to track progress. */
export const uploadFileResumable = (
    path: string,
    file: Blob | Uint8Array | ArrayBuffer,
): UploadTask => {
    const storageRef = ref(storage, path);
    return uploadBytesResumable(storageRef, file);
};

// ─── Download URL ──────────────────────────────────────────────────────────────

/** Get the download URL for a file at the given storage path. */
export const getFileURL = (path: string): Promise<string> =>
    getDownloadURL(ref(storage, path));

// ─── Delete ────────────────────────────────────────────────────────────────────

/** Delete a file from Cloud Storage. */
export const deleteFile = (path: string): Promise<void> =>
    deleteObject(ref(storage, path));

// ─── List files ────────────────────────────────────────────────────────────────

/** List all files under a given storage path prefix. */
export const listFiles = async (
    path: string,
): Promise<{ name: string; fullPath: string }[]> => {
    const listRef = ref(storage, path);
    const result = await listAll(listRef);
    return result.items.map((item) => ({
        name: item.name,
        fullPath: item.fullPath,
    }));
};
