import type { NavigatorScreenParams } from "@react-navigation/native";
import type { StemCategoryId } from "./models";

export type MainTabKey =
  | "STEM"
  | "Missions"
  | "Mentorship"
  | "Projects"
  | "Achievements";

export type RootStackParamList = {
  AuthWelcome: undefined;
  Registration: undefined;
  Login: undefined;
  SignUp: undefined;
  HomeHub: undefined;
  Profile: undefined;
  Notifications: undefined;
  MainTabs:
  | (NavigatorScreenParams<MainTabsParamList> & {
    initialTab?: MainTabKey;
  })
  | undefined;
};

export type STEMStackParamList = {
  STEMHome: undefined;
  STEMCategory: { categoryId: StemCategoryId };
  STEMTriviaPlayer: { categoryId: StemCategoryId };
  STEMTriviaResult: {
    categoryId: StemCategoryId;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  };
};

export type MissionsStackParamList = {
  MissionsHome: undefined;
  MissionDetail: { missionId: string; playAreYouReadyAudio?: boolean };
  MissionGame: { missionId: string };
  MissionPlayer: { missionId: string };
  CyberQuestSplash: { missionId: string };
  CyberQuestPlayer: { missionId: string };
  MissionReflection: { missionId: string; sessionScore?: number; maxScore?: number };
};

export type MentorshipStackParamList = {
  MentorshipHome: undefined;
  MentorshipStories: undefined;
  ManageMentorshipStories: undefined;
  MentorshipStoryEditor: { storyId?: string } | undefined;
  MentorshipStoryDetail: { storyId: string };
  MentorshipStoryTrivia: { storyId: string };
  MentorProfile: { mentorId: string };
  SessionBooking: { mentorId: string };
  MentorChat: { mentorId: string };
  MentorCall: { mentorId: string };
  AddMentor: undefined;
};

export type ProjectsStackParamList = {
  ProjectsHome: undefined;
  ProjectDetail: { projectId: string };
  ProjectSubmission: { projectId: string };
};

export type AchievementsStackParamList = {
  AchievementsHome: undefined;
  BadgeDetail: { badgeId: string };
  CertificateDetail: { certificateId: string };
};

export type MainTabsParamList = {
  STEM: NavigatorScreenParams<STEMStackParamList> | undefined;
  Missions: NavigatorScreenParams<MissionsStackParamList> | undefined;
  Mentorship: NavigatorScreenParams<MentorshipStackParamList> | undefined;
  Projects: NavigatorScreenParams<ProjectsStackParamList> | undefined;
  Achievements: NavigatorScreenParams<AchievementsStackParamList> | undefined;
};
