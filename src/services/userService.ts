// src/services/userService.ts
// Firestore service for user data – profile, progress subcollections.
// This is the bridge between AppStateContext and Firebase.

import {
    doc,
    collection,
    getDoc,
    getDocs,
    onSnapshot,
    setDoc,
    writeBatch,
    serverTimestamp,
    type FirestoreError,
    type Unsubscribe,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type {
    LearnerProfile,
    MentorshipCall,
    MentorshipMessage,
    MentorshipRequest,
    MissionProgress,
    ProjectProgress,
    SearchHistoryEntry,
    StemCategoryId,
    StemTriviaProgress,
    AppTheme,
    AppSettings,
} from "../types/models";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type UserDocument = {
    firstName: string;
    age: number | null;
    ageBracket: string | null;
    avatarId: string | null;
    totalScore: number;
    streakDays: number;
    lastActivityDate: string | null;
    lastSeenNotificationsAtIso: string | null;
    unlockedBadgeIds: string[];
    unlockedCertificateIds: string[];
    mentorshipRequests?: Partial<Record<string, MentorshipRequest>>;
    mentorshipMessages?: Partial<Record<string, MentorshipMessage[]>>;
    mentorshipCalls?: Partial<Record<string, MentorshipCall[]>>;
    searchHistory?: SearchHistoryEntry[];
    theme: AppTheme;
    settings?: AppSettings;
    isRegistered: boolean;
    role?: UserRole;
};

export type UserRole = "learner" | "mentor" | "admin";

export type FullUserData = {
    profile: UserDocument;
    missionProgress: Record<string, MissionProgress>;
    projectProgress: Record<string, ProjectProgress>;
    stemTriviaProgress: Record<StemCategoryId, StemTriviaProgress>;
};

export type AppUserSummary = {
    uid: string;
    firstName: string;
    role: UserRole;
    isRegistered: boolean;
};

// ─── Path helpers ───────────────────────────────────────────────────────────────

const userDocRef = (uid: string) => doc(db, "users", uid);
const missionProgressCol = (uid: string) =>
    collection(db, "users", uid, "missionProgress");
const projectProgressCol = (uid: string) =>
    collection(db, "users", uid, "projectProgress");
const stemTriviaProgressCol = (uid: string) =>
    collection(db, "users", uid, "stemTriviaProgress");

function getDefaultSettings(): AppSettings {
    return {
        soundEnabled: true,
        hapticEnabled: true,
        animationsEnabled: true,
        notifAchievements: true,
        notifReminders: true,
        notifUpdates: false,
    };
}

function parseUserRole(data: Partial<UserDocument> | undefined): UserRole {
    if (!data) return "learner";
    const topLevelRole = data.role;
    if (topLevelRole === "admin" || topLevelRole === "mentor" || topLevelRole === "learner") {
        return topLevelRole;
    }

    const nestedRole = (data as { profile?: { role?: unknown } }).profile?.role;
    if (nestedRole === "admin" || nestedRole === "mentor" || nestedRole === "learner") {
        return nestedRole;
    }

    return "learner";
}

// ─── READ: Load full user state ─────────────────────────────────────────────────

/** Load entire user state from Firestore. Returns null if user document doesn't exist. */
export async function loadUserData(uid: string): Promise<FullUserData | null> {
    const userSnap = await getDoc(userDocRef(uid));
    if (!userSnap.exists()) return null;

    const profile = userSnap.data() as UserDocument;

    // Load subcollections in parallel
    const [missionSnap, projectSnap, stemSnap] = await Promise.all([
        getDocs(missionProgressCol(uid)),
        getDocs(projectProgressCol(uid)),
        getDocs(stemTriviaProgressCol(uid)),
    ]);

    const missionProgress: Record<string, MissionProgress> = {};
    missionSnap.forEach((d) => {
        missionProgress[d.id] = d.data() as MissionProgress;
    });

    const projectProgress: Record<string, ProjectProgress> = {};
    projectSnap.forEach((d) => {
        projectProgress[d.id] = d.data() as ProjectProgress;
    });

    const stemTriviaProgress = {} as Record<StemCategoryId, StemTriviaProgress>;
    stemSnap.forEach((d) => {
        stemTriviaProgress[d.id as StemCategoryId] =
            d.data() as StemTriviaProgress;
    });

    return { profile, missionProgress, projectProgress, stemTriviaProgress };
}

// ─── WRITE: Save full user state (initial creation or full sync) ────────────────

/** Save the entire user state to Firestore using a batched write. */
export async function saveFullUserData(
    uid: string,
    data: FullUserData,
): Promise<void> {
    const batch = writeBatch(db);

    // User profile document
    batch.set(userDocRef(uid), {
        ...data.profile,
        updatedAt: serverTimestamp(),
    }, { merge: true });

    // Mission progress subcollection
    for (const [missionId, progress] of Object.entries(data.missionProgress)) {
        const ref = doc(db, "users", uid, "missionProgress", missionId);
        batch.set(ref, { ...progress, updatedAt: serverTimestamp() }, { merge: true });
    }

    // Project progress subcollection
    for (const [projectId, progress] of Object.entries(data.projectProgress)) {
        const ref = doc(db, "users", uid, "projectProgress", projectId);
        batch.set(ref, { ...progress, updatedAt: serverTimestamp() }, { merge: true });
    }

    // STEM trivia progress subcollection
    for (const [categoryId, progress] of Object.entries(data.stemTriviaProgress)) {
        const ref = doc(db, "users", uid, "stemTriviaProgress", categoryId);
        batch.set(ref, { ...progress, updatedAt: serverTimestamp() }, { merge: true });
    }

    await batch.commit();
}

// ─── WRITE: Partial updates ─────────────────────────────────────────────────────

/** Update the user profile document (partial). */
export async function updateUserProfile(
    uid: string,
    data: Partial<UserDocument>,
): Promise<void> {
    await setDoc(
        userDocRef(uid),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true },
    );
}

/** Update a single mission's progress. */
export async function updateMissionProgress(
    uid: string,
    missionId: string,
    data: MissionProgress,
): Promise<void> {
    const ref = doc(db, "users", uid, "missionProgress", missionId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Update a single project's progress. */
export async function updateProjectProgress(
    uid: string,
    projectId: string,
    data: ProjectProgress,
): Promise<void> {
    const ref = doc(db, "users", uid, "projectProgress", projectId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Update a single STEM trivia category's progress. */
export async function updateStemTriviaProgress(
    uid: string,
    categoryId: StemCategoryId,
    data: StemTriviaProgress,
): Promise<void> {
    const ref = doc(db, "users", uid, "stemTriviaProgress", categoryId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Load the role field from users/{uid}; defaults to learner when missing/invalid. */
export async function loadUserRole(uid: string): Promise<UserRole> {
    const snap = await getDoc(userDocRef(uid));
    if (!snap.exists()) {
        return "learner";
    }

    return parseUserRole(snap.data() as Partial<UserDocument>);
}

/** Ensure users/{uid}.role exists at auth time (defaulting to learner). */
export async function ensureUserRoleOnAuth(uid: string): Promise<void> {
    const snap = await getDoc(userDocRef(uid));
    if (!snap.exists()) {
        await setDoc(
            userDocRef(uid),
            {
                role: "learner",
                isRegistered: false,
                settings: getDefaultSettings(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
        return;
    }

    const data = snap.data() as Partial<UserDocument>;
    const topLevelRole = data.role;
    if (topLevelRole === "admin" || topLevelRole === "mentor" || topLevelRole === "learner") {
        if (!data.settings) {
            await setDoc(
                userDocRef(uid),
                {
                    settings: getDefaultSettings(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true },
            );
        }
        return;
    }

    const normalizedRole = parseUserRole(data);
    await setDoc(
        userDocRef(uid),
        {
            role: normalizedRole,
            ...(data.settings ? {} : { settings: getDefaultSettings() }),
            updatedAt: serverTimestamp(),
        },
        { merge: true },
    );
}

/** Real-time role subscription for users/{uid}. */
export function subscribeUserRole(
    uid: string,
    callback: (role: UserRole) => void,
    onError?: (error: FirestoreError) => void,
): Unsubscribe {
    return onSnapshot(
        userDocRef(uid),
        (snap) => {
            if (!snap.exists()) {
                callback("learner");
                return;
            }
            callback(parseUserRole(snap.data() as Partial<UserDocument>));
        },
        (error) => {
            console.error("subscribeUserRole error:", error);
            callback("learner");
            onError?.(error);
        },
    );
}

/** Real-time user profile subscription for users/{uid}. */
export function subscribeUserProfile(
    uid: string,
    callback: (profile: Partial<UserDocument> | null) => void,
    onError?: (error: FirestoreError) => void,
): Unsubscribe {
    return onSnapshot(
        userDocRef(uid),
        (snap) => {
            if (!snap.exists()) {
                callback(null);
                return;
            }
            callback(snap.data() as Partial<UserDocument>);
        },
        (error) => {
            console.error("subscribeUserProfile error:", error);
            onError?.(error);
        },
    );
}

/** Subscribe to app users for admin tools (e.g. mentor account linking). */
export function subscribeAppUsers(
    callback: (users: AppUserSummary[]) => void,
    onError?: (error: FirestoreError) => void,
): Unsubscribe {
    return onSnapshot(
        collection(db, "users"),
        (snapshot) => {
            const users = snapshot.docs
                .map((docSnap) => {
                    const data = docSnap.data() as Partial<UserDocument>;
                    return {
                        uid: docSnap.id,
                        firstName:
                            typeof data.firstName === "string" && data.firstName.trim().length > 0
                                ? data.firstName.trim()
                                : "Unnamed User",
                        role: parseUserRole(data),
                        isRegistered: Boolean(data.isRegistered),
                    } satisfies AppUserSummary;
                })
                .sort((a, b) => a.firstName.localeCompare(b.firstName));

            callback(users);
        },
        (error) => {
            console.error("subscribeAppUsers error:", error);
            callback([]);
            onError?.(error);
        },
    );
}
