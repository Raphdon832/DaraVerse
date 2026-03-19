import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { setGlobalSoundEnabled } from "../audio/audioPreferences";

import { getAgeBracketForAge } from "../data/ageBrackets";
import {
  badgeCatalog,
  certificateCatalog,
  missionCatalog,
  projectCatalog,
  stemTrackCatalog,
} from "../data/catalog";
import {
  stemAllCategoryBadgeId,
  stemCategoryCatalog,
  stemMasteryBadgeByCategory,
  stemStarterBadgeByCategory,
  stemQuestionPoolByCategoryAndAge,
} from "../data/stemTrivia";
import { missionGameCatalog } from "../data/missionGames";
import type {
  LearnerProfile,
  Mentor,
  MentorshipCall,
  MentorshipMessage,
  MentorshipRequest,
  MentorshipRequestStatus,
  MissionProgress,
  MissionResumeState,
  ProjectProgress,
  ProjectProgressStatus,
  SearchHistoryEntry,
  StemCategoryId,
  StemTriviaProgress,
  AppSettings,
  AppTheme,
} from "../types/models";
import { useAuth } from "./AuthContext";
import {
  loadUserData,
  saveFullUserData,
  updateUserProfile,
  updateMissionProgress,
  updateProjectProgress,
  updateStemTriviaProgress,
  subscribeUserProfile,
  type FullUserData,
  type UserDocument,
} from "../services/userService";
import { loadCatalogsFromFirestore, type FullCatalogData } from "../services/catalogService";
import { subscribeToAvailableMentors } from "../services/mentorshipService";

// ─── State shape ────────────────────────────────────────────────────────────────

type AppState = {
  learner: LearnerProfile;
  missionProgress: Record<string, MissionProgress>;
  projectProgress: Record<string, ProjectProgress>;
  stemTriviaProgress: Record<StemCategoryId, StemTriviaProgress>;
  mentorshipRequests: Partial<Record<string, MentorshipRequest>>;
  mentorshipMessages: Partial<Record<string, MentorshipMessage[]>>;
  mentorshipCalls: Partial<Record<string, MentorshipCall[]>>;
  searchHistory: SearchHistoryEntry[];
  unlockedBadgeIds: string[];
  unlockedCertificateIds: string[];
  theme: AppTheme;
  settings: AppSettings;
  /** True while loading data from Firestore */
  isLoadingData: boolean;
  /** True while catalogs are being fetched */
  isLoadingCatalogs: boolean;
  /** The static content catalogs */
  catalogs: FullCatalogData;
};

// ─── Action payloads ────────────────────────────────────────────────────────────

type CompleteMissionPayload = {
  missionId: string;
  score: number;
};

type SaveReflectionPayload = {
  missionId: string;
  reflection: string;
};

type SaveMissionResumeStatePayload = {
  missionId: string;
  resumeState: MissionResumeState | null;
};

type SetProjectStatusPayload = {
  projectId: string;
  status: ProjectProgressStatus;
};

type RegisterLearnerPayload = {
  firstName: string;
  avatarId: string;
  age: number;
};

type CompleteStemTriviaSessionPayload = {
  categoryId: StemCategoryId;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  questionIds: string[];
};

type MarkStemTriviaActivityPayload = {
  categoryId: StemCategoryId;
};

type RequestMentorshipPayload = {
  mentorId: string;
  goals: string;
  note: string;
};

type UpdateMentorshipRequestStatusPayload = {
  mentorId: string;
  status: Exclude<MentorshipRequestStatus, "none" | "pending">;
};

type SendMentorshipMessagePayload = {
  mentorId: string;
  text: string;
};

type ScheduleMentorCallPayload = {
  mentorId: string;
  slotLabel: string;
};

type AddSearchHistoryPayload = {
  query: string;
};

type AppAction =
  | { type: "REGISTER_LEARNER"; payload: RegisterLearnerPayload }
  | { type: "START_MISSION"; payload: { missionId: string } }
  | { type: "COMPLETE_MISSION"; payload: CompleteMissionPayload }
  | { type: "SAVE_REFLECTION"; payload: SaveReflectionPayload }
  | { type: "SAVE_MISSION_RESUME_STATE"; payload: SaveMissionResumeStatePayload }
  | { type: "SET_PROJECT_STATUS"; payload: SetProjectStatusPayload }
  | {
    type: "COMPLETE_STEM_TRIVIA_SESSION";
    payload: CompleteStemTriviaSessionPayload;
  }
  | { type: "MARK_STEM_TRIVIA_ACTIVITY"; payload: MarkStemTriviaActivityPayload }
  | { type: "REQUEST_MENTORSHIP"; payload: RequestMentorshipPayload }
  | {
    type: "UPDATE_MENTORSHIP_REQUEST_STATUS";
    payload: UpdateMentorshipRequestStatusPayload;
  }
  | { type: "SEND_MENTORSHIP_MESSAGE"; payload: SendMentorshipMessagePayload }
  | { type: "SCHEDULE_MENTOR_CALL"; payload: ScheduleMentorCallPayload }
  | { type: "ADD_SEARCH_HISTORY_QUERY"; payload: AddSearchHistoryPayload }
  | { type: "CLEAR_SEARCH_HISTORY" }
  | { type: "UPDATE_THEME"; payload: Partial<AppTheme> }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "MERGE_REMOTE_PROFILE"; payload: Partial<UserDocument> }
  | { type: "LOAD_FROM_FIRESTORE"; payload: AppState }
  | { type: "SET_CATALOGS"; payload: FullCatalogData }
  | { type: "SET_LIVE_MENTORS"; payload: Mentor[] }
  | { type: "REPLACE_STATE"; payload: AppState }
  | { type: "SET_LOADING"; payload: boolean };

// ─── Context value ──────────────────────────────────────────────────────────────

type AppStateContextValue = {
  state: AppState;
  registerLearner: (payload: RegisterLearnerPayload) => void;
  startMission: (missionId: string) => void;
  completeMission: (payload: CompleteMissionPayload) => void;
  completeStemTriviaSession: (
    payload: CompleteStemTriviaSessionPayload,
  ) => void;
  markStemTriviaActivity: (categoryId: StemCategoryId) => void;
  saveReflection: (payload: SaveReflectionPayload) => void;
  saveMissionResumeState: (payload: SaveMissionResumeStatePayload) => void;
  setProjectStatus: (payload: SetProjectStatusPayload) => void;
  requestMentorship: (payload: RequestMentorshipPayload) => void;
  updateMentorshipRequestStatus: (
    payload: UpdateMentorshipRequestStatusPayload,
  ) => void;
  sendMentorshipMessage: (payload: SendMentorshipMessagePayload) => void;
  scheduleMentorCall: (payload: ScheduleMentorCallPayload) => void;
  addSearchHistoryQuery: (query: string) => void;
  clearSearchHistory: () => void;
  updateTheme: (payload: Partial<AppTheme>) => void;
  updateSettings: (payload: Partial<AppSettings>) => void;
  markNotificationsRead: () => void;
};

// ─── Initial-state builders ─────────────────────────────────────────────────────

function createInitialMissionProgress(): Record<string, MissionProgress> {
  return missionCatalog.reduce<Record<string, MissionProgress>>(
    (acc, mission) => {
      acc[mission.id] = {
        status: "new",
        attempts: 0,
        bestScore: 0,
        lastScore: 0,
        latestReflection: "",
        lastPlayedAtIso: undefined,
      };
      return acc;
    },
    {},
  );
}

function createInitialProjectProgress(): Record<string, ProjectProgress> {
  return projectCatalog.reduce<Record<string, ProjectProgress>>(
    (acc, project) => {
      acc[project.id] = { status: "not_started" };
      return acc;
    },
    {},
  );
}

function createInitialStemTriviaProgress(): Record<
  StemCategoryId,
  StemTriviaProgress
> {
  return stemCategoryCatalog.reduce<
    Record<StemCategoryId, StemTriviaProgress>
  >((acc, category) => {
    acc[category.id] = {
      sessionsPlayed: 0,
      bestScore: 0,
      averageScore: 0,
      highScoreSessions: 0,
      recentlySeenQuestionIds: [],
      lastPlayedAtIso: undefined,
    };
    return acc;
  }, {} as Record<StemCategoryId, StemTriviaProgress>);
}

function createInitialMentorshipRequests(): Partial<Record<string, MentorshipRequest>> {
  return {};
}

function createInitialMentorshipMessages(): Partial<Record<string, MentorshipMessage[]>> {
  return {};
}

function createInitialMentorshipCalls(): Partial<Record<string, MentorshipCall[]>> {
  return {};
}

function createDefaultSettings(): AppSettings {
  return {
    soundEnabled: true,
    hapticEnabled: true,
    animationsEnabled: true,
    notifAchievements: true,
    notifReminders: true,
    notifUpdates: false,
  };
}

const SEARCH_HISTORY_LIMIT = 12;
const SEARCH_HISTORY_MIN_QUERY_LENGTH = 2;
const MULTI_SPACE_REGEX = /\s+/g;

function normalizeSearchQuery(value: string): string {
  return value.trim().replace(MULTI_SPACE_REGEX, " ").toLowerCase();
}

function sanitizeSearchHistory(entries: unknown): SearchHistoryEntry[] {
  if (!Array.isArray(entries)) return [];

  const cleaned = entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const candidate = entry as Partial<SearchHistoryEntry>;
      const query =
        typeof candidate.query === "string"
          ? candidate.query.trim().replace(MULTI_SPACE_REGEX, " ")
          : "";
      const normalizedQuery = normalizeSearchQuery(query);
      if (normalizedQuery.length < SEARCH_HISTORY_MIN_QUERY_LENGTH) return null;

      const count =
        typeof candidate.count === "number" && Number.isFinite(candidate.count) && candidate.count > 0
          ? Math.round(candidate.count)
          : 1;

      const lastSearchedAtIso =
        typeof candidate.lastSearchedAtIso === "string" && !Number.isNaN(new Date(candidate.lastSearchedAtIso).getTime())
          ? candidate.lastSearchedAtIso
          : new Date(0).toISOString();

      return {
        query,
        count,
        lastSearchedAtIso,
      } satisfies SearchHistoryEntry;
    })
    .filter((entry): entry is SearchHistoryEntry => Boolean(entry))
    .sort((a, b) => {
      const aTs = new Date(a.lastSearchedAtIso).getTime();
      const bTs = new Date(b.lastSearchedAtIso).getTime();
      return bTs - aTs;
    });

  const deduped = new Map<string, SearchHistoryEntry>();
  cleaned.forEach((entry) => {
    const normalized = normalizeSearchQuery(entry.query);
    const existing = deduped.get(normalized);
    if (!existing) {
      deduped.set(normalized, entry);
      return;
    }

    const existingTs = new Date(existing.lastSearchedAtIso).getTime();
    const entryTs = new Date(entry.lastSearchedAtIso).getTime();
    if (entryTs >= existingTs) {
      deduped.set(normalized, {
        ...entry,
        count: Math.max(existing.count, entry.count),
      });
    }
  });

  return Array.from(deduped.values()).slice(0, SEARCH_HISTORY_LIMIT);
}

function upsertSearchHistory(
  currentHistory: SearchHistoryEntry[],
  rawQuery: string,
): SearchHistoryEntry[] {
  const query = rawQuery.trim().replace(MULTI_SPACE_REGEX, " ");
  const normalizedQuery = normalizeSearchQuery(query);
  if (normalizedQuery.length < SEARCH_HISTORY_MIN_QUERY_LENGTH) {
    return currentHistory;
  }

  const nowIso = new Date().toISOString();
  const current = sanitizeSearchHistory(currentHistory);
  const existing = current.find((entry) => normalizeSearchQuery(entry.query) === normalizedQuery);
  const remaining = current.filter((entry) => normalizeSearchQuery(entry.query) !== normalizedQuery);

  const nextEntry: SearchHistoryEntry = {
    query,
    count: (existing?.count ?? 0) + 1,
    lastSearchedAtIso: nowIso,
  };

  return [nextEntry, ...remaining].slice(0, SEARCH_HISTORY_LIMIT);
}

function buildInitialState(): AppState {
  return {
    learner: {
      firstName: "",
      streakDays: 0,
      lastActivityDate: null,
      totalScore: 0,
      age: null,
      ageBracket: null,
      avatarId: null,
      lastSeenNotificationsAtIso: null,
      isRegistered: false,
    },
    missionProgress: createInitialMissionProgress(),
    projectProgress: createInitialProjectProgress(),
    stemTriviaProgress: createInitialStemTriviaProgress(),
    mentorshipRequests: createInitialMentorshipRequests(),
    mentorshipMessages: createInitialMentorshipMessages(),
    mentorshipCalls: createInitialMentorshipCalls(),
    searchHistory: [],
    unlockedBadgeIds: ['daily-goal-1', 'weekly-goal-1', 'daily-goal-3'],
    unlockedCertificateIds: [],
    theme: {
      avatarBgType: "color",
      avatarBgValue: "#E3F2FD",
      primaryColor: "#0284C7",
      appBgColor: "#F8FAFC",
      iconType: "outline",
    },
    settings: createDefaultSettings(),
    isLoadingData: true,
    isLoadingCatalogs: true,
    catalogs: {
      missions: missionCatalog,
      projects: projectCatalog,
      mentors: [],
      stemTracks: stemTrackCatalog,
      badges: badgeCatalog,
      certificates: certificateCatalog,
      stemCategories: stemCategoryCatalog,
      stemTriviaQuestions: Object.values(stemQuestionPoolByCategoryAndAge).flatMap(ageMap => Object.values(ageMap).flat()),
      missionGames: missionGameCatalog,
    },
  };
}

// ─── Business-logic helpers (unchanged) ─────────────────────────────────────────

function applyCertificateRules(state: AppState): string[] {
  const completedMissions = Object.values(state.missionProgress).filter(
    (progress) => progress.status === "completed",
  ).length;
  const submittedProjects = Object.values(state.projectProgress).filter(
    (progress) => progress.status === "submitted",
  ).length;

  return certificateCatalog
    .filter(
      (certificate) =>
        completedMissions >= certificate.minCompletedMissions &&
        submittedProjects >= certificate.minSubmittedProjects,
    )
    .map((certificate) => certificate.id);
}

function mergeUnique(ids: string[]) {
  return Array.from(new Set(ids));
}

function createMentorshipMessage(
  mentorId: string,
  senderRole: MentorshipMessage["senderRole"],
  text: string,
): MentorshipMessage {
  return {
    id: `${senderRole}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    mentorId,
    senderRole,
    text,
    sentAtIso: new Date().toISOString(),
  };
}

function evaluateStemBadges(
  stemTriviaProgress: Record<StemCategoryId, StemTriviaProgress>,
  existingBadgeIds: string[],
  categoryId: StemCategoryId,
) {
  const unlocked = new Set(existingBadgeIds);
  const categoryProgress = stemTriviaProgress[categoryId];

  if (categoryProgress.sessionsPlayed >= 1) {
    unlocked.add(stemStarterBadgeByCategory[categoryId]);
  }

  if (categoryProgress.highScoreSessions >= 3) {
    unlocked.add(stemMasteryBadgeByCategory[categoryId]);
  }

  const completedAllCategories = stemCategoryCatalog.every(
    (category) => stemTriviaProgress[category.id].sessionsPlayed >= 1,
  );
  if (completedAllCategories) {
    unlocked.add(stemAllCategoryBadgeId);
  }

  return Array.from(unlocked);
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function updateStreak(
  learner: LearnerProfile,
): Pick<LearnerProfile, "streakDays" | "lastActivityDate"> {
  const today = getTodayDateString();
  const last = learner.lastActivityDate;

  if (!last) {
    return { streakDays: 1, lastActivityDate: today };
  }

  if (last === today) {
    return { streakDays: learner.streakDays, lastActivityDate: today };
  }

  const lastDate = new Date(last + "T00:00:00");
  const todayDate = new Date(today + "T00:00:00");
  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streakDays: learner.streakDays + 1, lastActivityDate: today };
  }

  return { streakDays: 1, lastActivityDate: today };
}

// ─── Reducer ────────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOAD_FROM_FIRESTORE":
    case "REPLACE_STATE":
      return action.payload;
    case "MERGE_REMOTE_PROFILE": {
      const remote = action.payload;
      return {
        ...state,
        learner: {
          ...state.learner,
          firstName: typeof remote.firstName === "string" ? remote.firstName : state.learner.firstName,
          age: typeof remote.age === "number" || remote.age === null ? remote.age : state.learner.age,
          ageBracket:
            typeof remote.ageBracket === "string" || remote.ageBracket === null
              ? (remote.ageBracket as LearnerProfile["ageBracket"])
              : state.learner.ageBracket,
          avatarId:
            typeof remote.avatarId === "string" || remote.avatarId === null
              ? remote.avatarId
              : state.learner.avatarId,
          totalScore: typeof remote.totalScore === "number" ? remote.totalScore : state.learner.totalScore,
          streakDays: typeof remote.streakDays === "number" ? remote.streakDays : state.learner.streakDays,
          lastActivityDate:
            typeof remote.lastActivityDate === "string" || remote.lastActivityDate === null
              ? remote.lastActivityDate
              : state.learner.lastActivityDate,
          lastSeenNotificationsAtIso:
            (typeof remote.lastSeenNotificationsAtIso === "string" || remote.lastSeenNotificationsAtIso === null)
              ? remote.lastSeenNotificationsAtIso
              : (state.learner.lastSeenNotificationsAtIso ?? null),
          isRegistered:
            typeof remote.isRegistered === "boolean" ? remote.isRegistered : state.learner.isRegistered,
        },
        mentorshipRequests: remote.mentorshipRequests ?? state.mentorshipRequests,
        mentorshipMessages: remote.mentorshipMessages ?? state.mentorshipMessages,
        mentorshipCalls: remote.mentorshipCalls ?? state.mentorshipCalls,
        searchHistory:
          remote.searchHistory !== undefined
            ? sanitizeSearchHistory(remote.searchHistory)
            : state.searchHistory,
        unlockedBadgeIds: remote.unlockedBadgeIds ?? state.unlockedBadgeIds,
        unlockedCertificateIds:
          remote.unlockedCertificateIds ?? state.unlockedCertificateIds,
        theme: remote.theme ?? state.theme,
        settings: {
          ...state.settings,
          ...(remote.settings ?? {}),
        },
      };
    }

    case "SET_LOADING":
      return { ...state, isLoadingData: action.payload };

    case "SET_CATALOGS":
      return {
        ...state,
        catalogs: action.payload,
        isLoadingCatalogs: false,
      };
    case "SET_LIVE_MENTORS":
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          mentors: action.payload,
        },
      };

    case "REGISTER_LEARNER": {
      return {
        ...state,
        learner: {
          ...state.learner,
          firstName: action.payload.firstName.trim(),
          age: action.payload.age,
          ageBracket: getAgeBracketForAge(action.payload.age),
          avatarId: action.payload.avatarId,
          isRegistered: true,
        },
      };
    }
    case "UPDATE_THEME": {
      return {
        ...state,
        theme: {
          ...state.theme,
          ...action.payload,
        },
      };
    }
    case "MARK_NOTIFICATIONS_READ": {
      return {
        ...state,
        learner: {
          ...state.learner,
          lastSeenNotificationsAtIso: new Date().toISOString(),
        },
      };
    }
    case "UPDATE_SETTINGS": {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    }
    case "REQUEST_MENTORSHIP": {
      const goals = action.payload.goals.trim();
      const note = action.payload.note.trim();
      if (goals.length === 0 || note.length === 0) {
        return state;
      }

      const existingRequest = state.mentorshipRequests[action.payload.mentorId];
      if (existingRequest?.status === "pending" || existingRequest?.status === "accepted") {
        return state;
      }

      return {
        ...state,
        mentorshipRequests: {
          ...state.mentorshipRequests,
          [action.payload.mentorId]: {
            mentorId: action.payload.mentorId,
            status: "pending",
            goals,
            note,
            requestedAtIso: new Date().toISOString(),
          },
        },
      };
    }
    case "UPDATE_MENTORSHIP_REQUEST_STATUS": {
      const currentRequest = state.mentorshipRequests[action.payload.mentorId];
      if (!currentRequest) {
        return state;
      }

      const nextRequests = {
        ...state.mentorshipRequests,
        [action.payload.mentorId]: {
          ...currentRequest,
          status: action.payload.status,
          respondedAtIso: new Date().toISOString(),
        },
      };

      if (action.payload.status !== "accepted") {
        return {
          ...state,
          mentorshipRequests: nextRequests,
        };
      }

      const existingThread = state.mentorshipMessages[action.payload.mentorId] ?? [];
      const nextThread =
        existingThread.length > 0
          ? existingThread
          : [
            createMentorshipMessage(
              action.payload.mentorId,
              "mentor",
              "Hi! I accepted your request. Share what you want to work on first.",
            ),
          ];

      return {
        ...state,
        mentorshipRequests: nextRequests,
        mentorshipMessages: {
          ...state.mentorshipMessages,
          [action.payload.mentorId]: nextThread,
        },
      };
    }
    case "SEND_MENTORSHIP_MESSAGE": {
      const request = state.mentorshipRequests[action.payload.mentorId];
      if (request?.status !== "accepted") {
        return state;
      }

      const text = action.payload.text.trim();
      if (text.length === 0) {
        return state;
      }

      const existingThread = state.mentorshipMessages[action.payload.mentorId] ?? [];
      const menteeMessage = createMentorshipMessage(action.payload.mentorId, "mentee", text);
      const mentorReply = createMentorshipMessage(
        action.payload.mentorId,
        "mentor",
        "Great question. I will review and reply with a step-by-step plan.",
      );

      return {
        ...state,
        mentorshipMessages: {
          ...state.mentorshipMessages,
          [action.payload.mentorId]: [...existingThread, menteeMessage, mentorReply],
        },
      };
    }
    case "SCHEDULE_MENTOR_CALL": {
      const request = state.mentorshipRequests[action.payload.mentorId];
      if (request?.status !== "accepted") {
        return state;
      }

      const slotLabel = action.payload.slotLabel.trim();
      if (slotLabel.length === 0) {
        return state;
      }

      const nextCall: MentorshipCall = {
        id: `call-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        mentorId: action.payload.mentorId,
        slotLabel,
        scheduledAtIso: new Date().toISOString(),
        status: "scheduled",
      };
      const existingCalls = state.mentorshipCalls[action.payload.mentorId] ?? [];

      return {
        ...state,
        mentorshipCalls: {
          ...state.mentorshipCalls,
          [action.payload.mentorId]: [nextCall, ...existingCalls],
        },
      };
    }
    case "ADD_SEARCH_HISTORY_QUERY": {
      const nextSearchHistory = upsertSearchHistory(
        state.searchHistory,
        action.payload.query,
      );
      if (nextSearchHistory === state.searchHistory) {
        return state;
      }
      return {
        ...state,
        searchHistory: nextSearchHistory,
      };
    }
    case "CLEAR_SEARCH_HISTORY": {
      if (state.searchHistory.length === 0) {
        return state;
      }
      return {
        ...state,
        searchHistory: [],
      };
    }
    case "START_MISSION": {
      const currentProgress =
        state.missionProgress[action.payload.missionId];
      if (!currentProgress) {
        return state;
      }

      const nowIso = new Date().toISOString();

      if (currentProgress.status !== "new") {
        return {
          ...state,
          missionProgress: {
            ...state.missionProgress,
            [action.payload.missionId]: {
              ...currentProgress,
              lastPlayedAtIso: nowIso,
            },
          },
        };
      }

      return {
        ...state,
        missionProgress: {
          ...state.missionProgress,
          [action.payload.missionId]: {
            ...currentProgress,
            status: "in_progress",
            resumeState: null,
            lastPlayedAtIso: nowIso,
          },
        },
      };
    }
    case "SAVE_MISSION_RESUME_STATE": {
      const currentProgress =
        state.missionProgress[action.payload.missionId];
      if (!currentProgress) {
        return state;
      }

      return {
        ...state,
        missionProgress: {
          ...state.missionProgress,
          [action.payload.missionId]: {
            ...currentProgress,
            status: currentProgress.status === "new" ? "in_progress" : currentProgress.status,
            resumeState: action.payload.resumeState,
            lastPlayedAtIso: new Date().toISOString(),
          },
        },
      };
    }
    case "COMPLETE_MISSION": {
      const currentProgress =
        state.missionProgress[action.payload.missionId];
      if (!currentProgress) {
        return state;
      }

      const nextProgress: MissionProgress = {
        ...currentProgress,
        status: "completed",
        attempts: currentProgress.attempts + 1,
        bestScore: Math.max(currentProgress.bestScore, action.payload.score),
        lastScore: action.payload.score,
        completedAtIso: new Date().toISOString(),
        lastPlayedAtIso: new Date().toISOString(),
        resumeState: null,
      };

      const mission = missionCatalog.find(
        (item) => item.id === action.payload.missionId,
      );
      const unlockedBadgeIds = mission
        ? Array.from(
          new Set([...state.unlockedBadgeIds, mission.badgeRewardId]),
        )
        : state.unlockedBadgeIds;

      const nextState: AppState = {
        ...state,
        learner: {
          ...state.learner,
          totalScore: state.learner.totalScore + action.payload.score,
          ...updateStreak(state.learner),
        },
        missionProgress: {
          ...state.missionProgress,
          [action.payload.missionId]: nextProgress,
        },
        unlockedBadgeIds,
      };

      return {
        ...nextState,
        unlockedCertificateIds: applyCertificateRules(nextState),
      };
    }
    case "SAVE_REFLECTION": {
      const currentProgress =
        state.missionProgress[action.payload.missionId];
      if (!currentProgress) {
        return state;
      }

      return {
        ...state,
        missionProgress: {
          ...state.missionProgress,
          [action.payload.missionId]: {
            ...currentProgress,
            latestReflection: action.payload.reflection,
          },
        },
      };
    }
    case "SET_PROJECT_STATUS": {
      if (!state.projectProgress[action.payload.projectId]) {
        return state;
      }

      const nextState: AppState = {
        ...state,
        projectProgress: {
          ...state.projectProgress,
          [action.payload.projectId]: {
            status: action.payload.status,
            submittedAtIso:
              action.payload.status === "submitted"
                ? new Date().toISOString()
                : undefined,
          },
        },
      };

      return {
        ...nextState,
        unlockedCertificateIds: applyCertificateRules(nextState),
      };
    }
    case "COMPLETE_STEM_TRIVIA_SESSION": {
      const currentProgress =
        state.stemTriviaProgress[action.payload.categoryId];
      if (!currentProgress) {
        return state;
      }

      const scorePercent =
        action.payload.totalQuestions > 0
          ? (action.payload.correctAnswers / action.payload.totalQuestions) *
          100
          : 0;
      const sessionsPlayed = currentProgress.sessionsPlayed + 1;
      const averageScore =
        (currentProgress.averageScore * currentProgress.sessionsPlayed +
          action.payload.score) /
        sessionsPlayed;
      const highScoreSessions =
        currentProgress.highScoreSessions + (scorePercent >= 80 ? 1 : 0);

      const recentlySeenQuestionIds = mergeUnique([
        ...currentProgress.recentlySeenQuestionIds,
        ...action.payload.questionIds,
      ]).slice(-80);

      const updatedCategoryProgress: StemTriviaProgress = {
        sessionsPlayed,
        bestScore: Math.max(currentProgress.bestScore, action.payload.score),
        averageScore: Number(averageScore.toFixed(2)),
        highScoreSessions,
        recentlySeenQuestionIds,
        lastPlayedAtIso: new Date().toISOString(),
      };

      const updatedStemTriviaProgress = {
        ...state.stemTriviaProgress,
        [action.payload.categoryId]: updatedCategoryProgress,
      };

      return {
        ...state,
        learner: {
          ...state.learner,
          totalScore: state.learner.totalScore + action.payload.score,
          ...updateStreak(state.learner),
        },
        stemTriviaProgress: updatedStemTriviaProgress,
        unlockedBadgeIds: evaluateStemBadges(
          updatedStemTriviaProgress,
          state.unlockedBadgeIds,
          action.payload.categoryId,
        ),
      };
    }
    case "MARK_STEM_TRIVIA_ACTIVITY": {
      const currentProgress = state.stemTriviaProgress[action.payload.categoryId];
      if (!currentProgress) {
        return state;
      }
      return {
        ...state,
        stemTriviaProgress: {
          ...state.stemTriviaProgress,
          [action.payload.categoryId]: {
            ...currentProgress,
            lastPlayedAtIso: new Date().toISOString(),
          },
        },
      };
    }
    default:
      return state;
  }
}

// ─── Helper: convert AppState ↔ Firestore document shape ────────────────────────

function stateToFirestore(state: AppState): FullUserData {
  const profile: UserDocument = {
    firstName: state.learner.firstName,
    age: state.learner.age,
    ageBracket: state.learner.ageBracket,
    avatarId: state.learner.avatarId,
    totalScore: state.learner.totalScore,
    streakDays: state.learner.streakDays,
    lastActivityDate: state.learner.lastActivityDate,
    unlockedBadgeIds: state.unlockedBadgeIds,
    unlockedCertificateIds: state.unlockedCertificateIds,
    mentorshipRequests: state.mentorshipRequests,
    mentorshipMessages: state.mentorshipMessages,
    mentorshipCalls: state.mentorshipCalls,
    searchHistory: state.searchHistory,
    theme: state.theme,
    settings: state.settings,
    lastSeenNotificationsAtIso: state.learner.lastSeenNotificationsAtIso ?? null,
    isRegistered: state.learner.isRegistered,
  };
  return {
    profile,
    missionProgress: state.missionProgress,
    projectProgress: state.projectProgress,
    stemTriviaProgress: state.stemTriviaProgress,
  };
}

function firestoreToState(data: FullUserData): AppState {
  const defaultState = buildInitialState();
  return {
    learner: {
      firstName: data.profile.firstName ?? "",
      streakDays: data.profile.streakDays ?? 0,
      lastActivityDate: data.profile.lastActivityDate ?? null,
      totalScore: data.profile.totalScore ?? 0,
      age: data.profile.age ?? null,
      ageBracket: data.profile.ageBracket as AppState["learner"]["ageBracket"],
      avatarId: data.profile.avatarId ?? null,
      lastSeenNotificationsAtIso: data.profile.lastSeenNotificationsAtIso ?? null,
      isRegistered: data.profile.isRegistered ?? false,
    },
    // Merge loaded progress with defaults so new missions/projects added
    // after a user registered still appear.
    missionProgress: {
      ...defaultState.missionProgress,
      ...data.missionProgress,
    },
    projectProgress: {
      ...defaultState.projectProgress,
      ...data.projectProgress,
    },
    stemTriviaProgress: {
      ...defaultState.stemTriviaProgress,
      ...data.stemTriviaProgress,
    },
    mentorshipRequests: data.profile.mentorshipRequests ?? defaultState.mentorshipRequests,
    mentorshipMessages: data.profile.mentorshipMessages ?? defaultState.mentorshipMessages,
    mentorshipCalls: data.profile.mentorshipCalls ?? defaultState.mentorshipCalls,
    searchHistory: sanitizeSearchHistory(data.profile.searchHistory),
    unlockedBadgeIds: data.profile.unlockedBadgeIds ?? [],
    unlockedCertificateIds: data.profile.unlockedCertificateIds ?? [],
    theme: data.profile.theme ?? defaultState.theme,
    settings: {
      ...defaultState.settings,
      ...(data.profile.settings ?? {}),
    },
    isLoadingData: false,
    isLoadingCatalogs: defaultState.isLoadingCatalogs,
    catalogs: defaultState.catalogs,
  };
}

// ─── Context + Provider ─────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
);

const LOCAL_STORAGE_KEY = `daraverse_state_v1`;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const { user } = useAuth();
  const hasLoadedRef = useRef<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  // Keep a global audio gate in sync with user preference.
  useEffect(() => {
    setGlobalSoundEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  // ─── Network Status Listener ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((status) => {
      setIsOnline(status.isConnected && (status.isInternetReachable ?? true));
    });
    return () => unsubscribe();
  }, []);

  // ─── Local Storage: Initial Load ──────────────────────────────────────
  useEffect(() => {
    const loadLocal = async () => {
      try {
        const json = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
        if (json) {
          const localState = JSON.parse(json);
          // Merge with initial state to ensure all keys exist
          const initialState = buildInitialState();
          const merged: AppState = {
            ...initialState,
            ...localState,
            learner: {
              ...initialState.learner,
              ...(localState as Partial<AppState>).learner,
            },
            searchHistory: sanitizeSearchHistory(
              (localState as Partial<AppState>).searchHistory,
            ),
            isLoadingData: false, // Local load done
            isLoadingCatalogs: initialState.isLoadingCatalogs,
            catalogs: initialState.catalogs,
          };
          dispatch({ type: "REPLACE_STATE", payload: merged });
        }
      } catch (err) {
        console.error("Failed to load local state:", err);
      }
    };
    loadLocal();
  }, []);

  // ─── Local Storage: Save on every change ─────────────────────────────
  useEffect(() => {
    const saveLocal = async () => {
      // Don't save transient loading states or catalogs
      const {
        isLoadingData,
        isLoadingCatalogs,
        catalogs,
        ...persistentPart
      } = state;
      try {
        await AsyncStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(persistentPart),
        );
      } catch (err) {
        console.error("Failed to save local state:", err);
      }
    };
    saveLocal();
  }, [state]);

  // ─── Full Sync to Firestore when coming online ───────────────────────
  useEffect(() => {
    if (isOnline && user && state.learner.isRegistered) {
      const fullData = stateToFirestore(state);
      void saveFullUserData(user.uid, fullData);
    }
  }, [isOnline, user]); // Only sync when connection or user changes

  // ─── Load from Firestore when user signs in (Initial Handshake) ─────────
  useEffect(() => {
    if (!user) {
      // No user → reset to initial (keep local state for guests though)
      // Actually, if they sign out, we should probably clear local storage 
      // if it was specific to that user. But since we use one key, 
      // let's just reset the state if they Logout.
      if (hasLoadedRef.current !== null) {
        dispatch({ type: "LOAD_FROM_FIRESTORE", payload: buildInitialState() });
        hasLoadedRef.current = null;
        AsyncStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    // Already loaded for this uid
    if (hasLoadedRef.current === user.uid) return;

    let cancelled = false;

    (async () => {
      // If offline, don't try to load from Firestore, we already have local state
      if (!isOnline) {
        hasLoadedRef.current = user.uid;
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const data = await loadUserData(user.uid);
        if (cancelled) return;

        if (data) {
          dispatch({
            type: "LOAD_FROM_FIRESTORE",
            payload: firestoreToState(data),
          });
        } else {
          // First time user – keep defaults/local, mark loading done
          dispatch({ type: "SET_LOADING", payload: false });
        }
        hasLoadedRef.current = user.uid;
      } catch (err) {
        console.error("Failed to load user data from Firestore:", err);
        if (!cancelled) {
          dispatch({ type: "SET_LOADING", payload: false });
          hasLoadedRef.current = user.uid;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isOnline]);

  // Keep profile-level fields in sync across devices in real time.
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeUserProfile(
      user.uid,
      (profile) => {
        if (!profile) return;
        dispatch({ type: "MERGE_REMOTE_PROFILE", payload: profile });
      },
      (error) => {
        console.error("Realtime profile sync error:", error);
      },
    );

    return unsubscribe;
  }, [user]);


  // ─── Load Catalogs from Firestore on Mount ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const catalogs = await loadCatalogsFromFirestore();
        if (catalogs.missions.length > 0) {
          dispatch({ type: "SET_CATALOGS", payload: catalogs });
        } else {
          // If Firestore is empty (not seeded), we still mark as done
          // so the app uses the hardcoded defaults.
          dispatch({ type: "SET_CATALOGS", payload: buildInitialState().catalogs });
        }
      } catch (err) {
        console.error("Failed to load catalogs from Firestore:", err);
        // Fallback to local
        dispatch({ type: "SET_CATALOGS", payload: buildInitialState().catalogs });
      }
    })();
  }, []);

  // Keep mentors live from Firestore so availability changes update immediately.
  useEffect(() => {
    const unsubscribe = subscribeToAvailableMentors((mentors) => {
      dispatch({ type: "SET_LIVE_MENTORS", payload: mentors });
    });

    return unsubscribe;
  }, []);

  // ─── Sync helpers (fire-and-forget to Firestore) ────────────────────────
  const syncToFirestore = (
    actionType: string,
    newState: AppState,
    action: AppAction,
  ) => {
    if (!user || !isOnline) return;
    const uid = user.uid;

    // Fire-and-forget – we don't await these
    switch (actionType) {
      case "REGISTER_LEARNER": {
        const fullData = stateToFirestore(newState);
        void saveFullUserData(uid, fullData);
        break;
      }
      case "SAVE_MISSION_RESUME_STATE": {
        const missionId =
          "payload" in action &&
            action.payload &&
            typeof action.payload === "object" &&
            "missionId" in action.payload
            ? (action.payload as { missionId: string }).missionId
            : null;
        if (missionId && newState.missionProgress[missionId]) {
          void updateMissionProgress(
            uid,
            missionId,
            newState.missionProgress[missionId],
          );
        }
        break;
      }
      case "START_MISSION":
      case "COMPLETE_MISSION":
      case "SAVE_REFLECTION": {
        const missionId =
          "payload" in action &&
            action.payload &&
            typeof action.payload === "object" &&
            "missionId" in action.payload
            ? (action.payload as { missionId: string }).missionId
            : null;
        if (missionId && newState.missionProgress[missionId]) {
          void updateMissionProgress(
            uid,
            missionId,
            newState.missionProgress[missionId],
          );
        }
        // Also update profile for score/streak/badges/certificates changes
        void updateUserProfile(uid, {
          totalScore: newState.learner.totalScore,
          streakDays: newState.learner.streakDays,
          lastActivityDate: newState.learner.lastActivityDate,
          unlockedBadgeIds: newState.unlockedBadgeIds,
          unlockedCertificateIds: newState.unlockedCertificateIds,
        });
        break;
      }
      case "SET_PROJECT_STATUS": {
        const projectId =
          "payload" in action &&
            action.payload &&
            typeof action.payload === "object" &&
            "projectId" in action.payload
            ? (action.payload as { projectId: string }).projectId
            : null;
        if (projectId && newState.projectProgress[projectId]) {
          void updateProjectProgress(
            uid,
            projectId,
            newState.projectProgress[projectId],
          );
        }
        void updateUserProfile(uid, {
          unlockedCertificateIds: newState.unlockedCertificateIds,
        });
        break;
      }
      case "COMPLETE_STEM_TRIVIA_SESSION": {
        const categoryId =
          "payload" in action &&
            action.payload &&
            typeof action.payload === "object" &&
            "categoryId" in action.payload
            ? (action.payload as { categoryId: StemCategoryId }).categoryId
            : null;
        if (categoryId && newState.stemTriviaProgress[categoryId]) {
          void updateStemTriviaProgress(
            uid,
            categoryId,
            newState.stemTriviaProgress[categoryId],
          );
        }
        void updateUserProfile(uid, {
          totalScore: newState.learner.totalScore,
          streakDays: newState.learner.streakDays,
          lastActivityDate: newState.learner.lastActivityDate,
          unlockedBadgeIds: newState.unlockedBadgeIds,
        });
        break;
      }
      case "MARK_STEM_TRIVIA_ACTIVITY": {
        const categoryId =
          "payload" in action &&
            action.payload &&
            typeof action.payload === "object" &&
            "categoryId" in action.payload
            ? (action.payload as { categoryId: StemCategoryId }).categoryId
            : null;
        if (categoryId && newState.stemTriviaProgress[categoryId]) {
          void updateStemTriviaProgress(
            uid,
            categoryId,
            newState.stemTriviaProgress[categoryId],
          );
        }
        break;
      }
      case "UPDATE_THEME": {
        void updateUserProfile(uid, { theme: newState.theme });
        break;
      }
      case "UPDATE_SETTINGS": {
        void updateUserProfile(uid, { settings: newState.settings });
        break;
      }
      case "MARK_NOTIFICATIONS_READ": {
        void updateUserProfile(uid, { lastSeenNotificationsAtIso: newState.learner.lastSeenNotificationsAtIso });
        break;
      }
      case "ADD_SEARCH_HISTORY_QUERY":
      case "CLEAR_SEARCH_HISTORY": {
        void updateUserProfile(uid, { searchHistory: newState.searchHistory });
        break;
      }
      case "REQUEST_MENTORSHIP":
      case "UPDATE_MENTORSHIP_REQUEST_STATUS":
      case "SEND_MENTORSHIP_MESSAGE":
      case "SCHEDULE_MENTOR_CALL": {
        void updateUserProfile(uid, {
          mentorshipRequests: newState.mentorshipRequests,
          mentorshipMessages: newState.mentorshipMessages,
          mentorshipCalls: newState.mentorshipCalls,
        });
        break;
      }
    }
  };

  // ─── Wrapped dispatch that also syncs to Firestore ──────────────────────
  const dispatchAndSync = (action: AppAction) => {
    dispatch(action);
    // We need the NEW state after the reducer runs.
    // Since useReducer is synchronous in React, we can compute it inline.
    const newState = reducer(state, action);
    syncToFirestore(action.type, newState, action);
  };

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      registerLearner: (payload) =>
        dispatchAndSync({ type: "REGISTER_LEARNER", payload }),
      startMission: (missionId) =>
        dispatchAndSync({
          type: "START_MISSION",
          payload: { missionId },
        }),
      completeMission: (payload) =>
        dispatchAndSync({ type: "COMPLETE_MISSION", payload }),
      completeStemTriviaSession: (p) =>
        dispatchAndSync({
          type: "COMPLETE_STEM_TRIVIA_SESSION",
          payload: p,
        }),
      markStemTriviaActivity: (categoryId) =>
        dispatchAndSync({
          type: "MARK_STEM_TRIVIA_ACTIVITY",
          payload: { categoryId },
        }),
      saveReflection: (p) =>
        dispatchAndSync({ type: "SAVE_REFLECTION", payload: p }),
      saveMissionResumeState: (p) =>
        dispatchAndSync({ type: "SAVE_MISSION_RESUME_STATE", payload: p }),
      setProjectStatus: (p) =>
        dispatchAndSync({ type: "SET_PROJECT_STATUS", payload: p }),
      requestMentorship: (p) =>
        dispatchAndSync({ type: "REQUEST_MENTORSHIP", payload: p }),
      updateMentorshipRequestStatus: (p) =>
        dispatchAndSync({
          type: "UPDATE_MENTORSHIP_REQUEST_STATUS",
          payload: p,
        }),
      sendMentorshipMessage: (p) =>
        dispatchAndSync({ type: "SEND_MENTORSHIP_MESSAGE", payload: p }),
      scheduleMentorCall: (p) =>
        dispatchAndSync({ type: "SCHEDULE_MENTOR_CALL", payload: p }),
      addSearchHistoryQuery: (query) =>
        dispatchAndSync({
          type: "ADD_SEARCH_HISTORY_QUERY",
          payload: { query },
        }),
      clearSearchHistory: () =>
        dispatchAndSync({ type: "CLEAR_SEARCH_HISTORY" }),
      updateTheme: (p) =>
        dispatchAndSync({ type: "UPDATE_THEME", payload: p }),
      updateSettings: (p) =>
        dispatchAndSync({ type: "UPDATE_SETTINGS", payload: p }),
      markNotificationsRead: () =>
        dispatchAndSync({ type: "MARK_NOTIFICATIONS_READ" }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, user],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider.");
  }
  return context;
}
