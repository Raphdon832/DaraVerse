import {
    collection,
    doc,
    type FirestoreError,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    type Unsubscribe,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Mentor } from "../types/models";
import { loadUserRole } from "./userService";

export type CreateMentorInput = {
    id?: string;
    name: string;
    linkedUserId: string;
    linkedUserName: string;
    specialty: string;
    description: string;
    openSlotsLabel: string;
    bio?: string;
    expertiseTags?: string[];
    languages?: string[];
    yearsExperience?: number;
    responseTimeLabel?: string;
    rating?: number;
    totalReviews?: number;
    availabilitySlots?: string[];
};

function sanitizeMentor(input: CreateMentorInput): Mentor {
    const mentorId = input.id?.trim() || `mentor-${Date.now()}`;
    return {
        id: mentorId,
        name: input.name.trim(),
        role: "mentor",
        isAcceptingMentees: true,
        linkedUserId: input.linkedUserId.trim(),
        linkedUserName: input.linkedUserName.trim(),
        specialty: input.specialty.trim(),
        description: input.description.trim(),
        openSlotsLabel: input.openSlotsLabel.trim(),
        bio: input.bio?.trim(),
        expertiseTags: (input.expertiseTags ?? []).map((tag) => tag.trim()).filter(Boolean),
        languages: (input.languages ?? []).map((language) => language.trim()).filter(Boolean),
        yearsExperience: input.yearsExperience,
        responseTimeLabel: input.responseTimeLabel?.trim(),
        rating: input.rating,
        totalReviews: input.totalReviews,
        availabilitySlots: (input.availabilitySlots ?? []).map((slot) => slot.trim()).filter(Boolean),
    };
}

/** Subscribe to mentors currently accepting mentees; updates in real-time. */
export function subscribeToAvailableMentors(
    callback: (mentors: Mentor[]) => void,
    onError?: (error: FirestoreError) => void,
): Unsubscribe {
    const mentorsQuery = query(collection(db, "catalogs_mentors"));

    return onSnapshot(
        mentorsQuery,
        (snapshot) => {
            const mentors = snapshot.docs
                .map((docSnap) => docSnap.data() as Mentor)
                .filter(
                    (mentor) =>
                        (mentor.role ?? "mentor") === "mentor" &&
                        (mentor.isAcceptingMentees ?? true),
                )
                .sort((a, b) => a.name.localeCompare(b.name));

            callback(mentors);
        },
        (error) => {
            console.error("subscribeToAvailableMentors error:", error);
            callback([]);
            onError?.(error);
        },
    );
}

/** Create or update a mentor profile. Only users with role=admin can do this. */
export async function addMentorAsAdmin(
    adminUid: string,
    input: CreateMentorInput,
): Promise<string> {
    const role = await loadUserRole(adminUid);
    if (role !== "admin") {
        throw new Error("Only admin users can add mentors.");
    }

    const mentor = sanitizeMentor(input);
    if (!mentor.linkedUserId || !mentor.linkedUserName) {
        throw new Error("A linked app user is required for mentor creation.");
    }
    await Promise.all([
        setDoc(
            doc(db, "catalogs_mentors", mentor.id),
            {
                ...mentor,
                updatedAt: serverTimestamp(),
                createdBy: adminUid,
            },
            { merge: true },
        ),
        setDoc(
            doc(db, "users", mentor.linkedUserId),
            {
                role: "mentor",
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        ),
    ]);

    return mentor.id;
}
