// src/services/catalogService.ts
// Service for reading the static catalogs from Firebase.

import { collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../config/firebase";
import type {
    Badge,
    Certificate,
    Mentor,
    Mission,
    ProjectTemplate,
    STEMTrack,
    StemCategoryMeta,
    StemTriviaQuestion,
    MissionGameConfig,
} from "../types/models";
import {
    badgeCatalog,
    certificateCatalog,
    mentorCatalog,
    missionCatalog,
    projectCatalog,
    stemTrackCatalog,
} from "../data/catalog";
import {
    stemCategoryCatalog,
    stemQuestionPoolByCategoryAndAge,
} from "../data/stemTrivia";
import { missionGameCatalog } from "../data/missionGames";

export type FullCatalogData = {
    missions: Mission[];
    projects: ProjectTemplate[];
    mentors: Mentor[];
    stemTracks: STEMTrack[];
    badges: Badge[];
    certificates: Certificate[];
    stemCategories: StemCategoryMeta[];
    stemTriviaQuestions: StemTriviaQuestion[];
    missionGames: MissionGameConfig[];
};

/** Load all catalogs from Firestore */
export async function loadCatalogsFromFirestore(): Promise<FullCatalogData> {
    const [
        missionsSnap,
        projectsSnap,
        mentorsSnap,
        stemTracksSnap,
        badgesSnap,
        certsSnap,
        catsSnap,
        triviaSnap,
        gamesSnap,
    ] = await Promise.all([
        getDocs(collection(db, "catalogs_missions")),
        getDocs(collection(db, "catalogs_projects")),
        getDocs(collection(db, "catalogs_mentors")),
        getDocs(collection(db, "catalogs_stemTracks")),
        getDocs(collection(db, "catalogs_badges")),
        getDocs(collection(db, "catalogs_certificates")),
        getDocs(collection(db, "catalogs_stemCategories")),
        getDocs(collection(db, "catalogs_stemTrivia")),
        getDocs(collection(db, "catalogs_missionGames")),
    ]);

    const missions = missionsSnap.docs.map((d) => d.data() as Mission);
    const getCyberquestOrder = (missionId: string) => {
        const match = missionId.match(/^cyberquest-m(\d+)$/);
        return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    };
    // Keep CyberQuest episodes first, in numeric order.
    missions.sort((a, b) => {
        const aOrder = getCyberquestOrder(a.id);
        const bOrder = getCyberquestOrder(b.id);
        const aIsCyberquest = Number.isFinite(aOrder);
        const bIsCyberquest = Number.isFinite(bOrder);

        if (aIsCyberquest && bIsCyberquest) {
            return aOrder - bOrder;
        }
        if (aIsCyberquest) return -1;
        if (bIsCyberquest) return 1;
        return 0;
    });

    return {
        missions,
        projects: projectsSnap.docs.map((d) => d.data() as ProjectTemplate),
        mentors: mentorsSnap.docs
            .map((d) => d.data() as Mentor)
            .filter(
                (mentor) =>
                    (mentor.role ?? "mentor") === "mentor" &&
                    (mentor.isAcceptingMentees ?? true),
            ),
        stemTracks: stemTracksSnap.docs.map((d) => d.data() as STEMTrack),
        badges: badgesSnap.docs.map((d) => d.data() as Badge),
        certificates: certsSnap.docs.map((d) => d.data() as Certificate),
        stemCategories: catsSnap.docs.map((d) => d.data() as StemCategoryMeta),
        stemTriviaQuestions: triviaSnap.docs.map((d) => d.data() as StemTriviaQuestion),
        missionGames: gamesSnap.docs.map((d) => d.data() as MissionGameConfig),
    };
}

/** 
 * TEMPORARY HELPER: Seed the Firestore database with local hardcoded catalogs. 
 * This should only be run once by an admin to populate the backend empty collections.
 */
export async function seedCatalogsToFirestore(): Promise<void> {
    const batch1 = writeBatch(db);

    // 1. Missions
    missionCatalog.forEach((m) => {
        batch1.set(doc(db, "catalogs_missions", m.id), m);
    });
    // 2. Projects
    projectCatalog.forEach((p) => {
        batch1.set(doc(db, "catalogs_projects", p.id), p);
    });
    // 3. Mentors
    mentorCatalog.forEach((m) => {
        batch1.set(doc(db, "catalogs_mentors", m.id), m);
    });
    // 4. STEM Tracks
    stemTrackCatalog.forEach((s) => {
        batch1.set(doc(db, "catalogs_stemTracks", s.id), s);
    });
    // 5. Badges
    badgeCatalog.forEach((b) => {
        batch1.set(doc(db, "catalogs_badges", b.id), b);
    });
    // 6. Certificates
    certificateCatalog.forEach((c) => {
        batch1.set(doc(db, "catalogs_certificates", c.id), c);
    });

    await batch1.commit();

    const batch2 = writeBatch(db);
    // 7. STEM Categories
    stemCategoryCatalog.forEach((c) => {
        batch2.set(doc(db, "catalogs_stemCategories", c.id), c);
    });
    // 8. STEM Trivia
    Object.values(stemQuestionPoolByCategoryAndAge).forEach((ageBracketMap) => {
        Object.values(ageBracketMap).forEach((questions) => {
            questions.forEach((q) => {
                batch2.set(doc(db, "catalogs_stemTrivia", q.id), q);
            });
        });
    });

    await batch2.commit();

    const batch3 = writeBatch(db);
    // 9. Mission Games
    missionGameCatalog.forEach((mg) => {
        batch3.set(doc(db, "catalogs_missionGames", mg.missionId), mg);
    });
    await batch3.commit();
}
