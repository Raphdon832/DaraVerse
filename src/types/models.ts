export type MissionStatus = "new" | "in_progress" | "completed";

export type AgeBracketId = "0_7" | "8_10" | "11_13" | "14_16" | "17_plus";

export type IconType = "outline" | "filled";

export type AppTheme = {
  avatarBgType: "color" | "image";
  avatarBgValue: string;
  primaryColor: string;
  appBgColor: string;
  iconType: IconType;
};

export type AppSettings = {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  animationsEnabled: boolean;
  notifAchievements: boolean;
  notifReminders: boolean;
  notifUpdates: boolean;
};

export type SearchHistoryEntry = {
  query: string;
  lastSearchedAtIso: string;
  count: number;
};

export type StemCategoryId =
  | "coding"
  | "ai_literacy"
  | "cybersecurity"
  | "data_skills"
  | "robotics_climate_tech";

export type MissionChoice = {
  id: string;
  text: string;
  scoreDelta: number;
  consequence: string;
};

export type MissionStep = {
  id: string;
  prompt: string;
  choices: MissionChoice[];
};

export type Mission = {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  durationMinutes: number;
  objective: string;
  reflectionPrompt: string;
  badgeRewardId: string;
  steps: MissionStep[];
};

export type STEMTrack = {
  id: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export type Mentor = {
  id: string;
  name: string;
  role: "mentor";
  isAcceptingMentees: boolean;
  linkedUserId?: string;
  linkedUserName?: string;
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

export type MentorshipRequestStatus =
  | "none"
  | "pending"
  | "accepted"
  | "declined";

export type MentorshipRequest = {
  mentorId: string;
  status: Exclude<MentorshipRequestStatus, "none">;
  goals: string;
  note: string;
  requestedAtIso: string;
  respondedAtIso?: string;
};

export type MentorshipMessage = {
  id: string;
  mentorId: string;
  senderRole: "mentor" | "mentee";
  text: string;
  sentAtIso: string;
};

export type MentorshipCall = {
  id: string;
  mentorId: string;
  slotLabel: string;
  scheduledAtIso: string;
  status: "scheduled" | "completed" | "cancelled";
};

export type ProjectTemplate = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  sourceMissionId?: string;
  sourceStemCategoryId?: StemCategoryId;
  unlockCriteria?: string;
};

export type Certificate = {
  id: string;
  name: string;
  description: string;
  minCompletedMissions: number;
  minSubmittedProjects: number;
};

export type MissionProgress = {
  status: MissionStatus;
  attempts: number;
  bestScore: number;
  lastScore: number;
  latestReflection: string;
  lastPlayedAtIso?: string;
  completedAtIso?: string;
  resumeState?: MissionResumeState | null;
};

export type MissionResumeState = {
  nodeId: string;
  history: string[];
  totalScore: number;
  visitedCount: number;
  reflectionText: string;
  sortedItems: Record<string, "safe" | "risky">;
  sortSubmitted: boolean;
  matchedPairIds: string[];
  selectedLeft: string | null;
  matchSubmitted: boolean;
  updatedAtIso: string;
};

export type ProjectProgressStatus = "not_started" | "in_progress" | "submitted";

export type ProjectProgress = {
  status: ProjectProgressStatus;
  submittedAtIso?: string;
};

export type LearnerProfile = {
  firstName: string;
  streakDays: number;
  lastActivityDate: string | null;
  totalScore: number;
  age: number | null;
  ageBracket: AgeBracketId | null;
  avatarId: string | null;
  lastSeenNotificationsAtIso: string | null;
  isRegistered: boolean;
};

export type StemCategoryMeta = {
  id: StemCategoryId;
  title: string;
  summary: string;
  howToPlay: string[];
};

export type StemTriviaQuestion = {
  id: string;
  categoryId: StemCategoryId;
  ageBracket: AgeBracketId;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
};

export type StemTriviaProgress = {
  sessionsPlayed: number;
  bestScore: number;
  averageScore: number;
  highScoreSessions: number;
  recentlySeenQuestionIds: string[];
  lastPlayedAtIso?: string;
};

export type MissionGameQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

export type MissionGameConfig = {
  missionId: string;
  gameTitle: string;
  gameSubtitle: string;
  summary: string;
  howToPlay: string[];
  questions: MissionGameQuestion[];
};
