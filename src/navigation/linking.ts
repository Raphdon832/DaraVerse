import type { LinkingOptions } from "@react-navigation/native";

import type { RootStackParamList } from "../types/navigation";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Registration: "register",
      HomeHub: "home",
      Profile: "profile",
      MainTabs: {
        path: "",
        screens: {
          Missions: {
            path: "missions",
            screens: {
              MissionsHome: "",
              MissionDetail: ":missionId",
              MissionGame: ":missionId/game",
              MissionPlayer: ":missionId/player",
              CyberQuestSplash: ":missionId/cyberquest-splash",
              CyberQuestPlayer: ":missionId/cyberquest-player",
              MissionReflection: {
                path: ":missionId/reflection/:sessionScore?/:maxScore?",
                parse: {
                  sessionScore: Number,
                  maxScore: Number,
                },
              },
            },
          },
          STEM: {
            path: "stem",
            screens: {
              STEMHome: "",
              STEMCategory: ":categoryId",
              STEMTriviaPlayer: ":categoryId/play",
              STEMTriviaResult: {
                path: ":categoryId/result/:score/:totalQuestions/:correctAnswers",
                parse: {
                  score: Number,
                  totalQuestions: Number,
                  correctAnswers: Number,
                },
              },
            },
          },
          Mentorship: {
            path: "mentorship",
            screens: {
              MentorshipHome: "",
              MentorshipStories: "stories",
              ManageMentorshipStories: "admin/stories",
              MentorshipStoryEditor: "admin/stories/editor/:storyId?",
              MentorshipStoryDetail: "stories/:storyId",
              MentorshipStoryTrivia: "stories/:storyId/trivia",
              AddMentor: "admin/add-mentor",
              MentorProfile: "mentor/:mentorId",
              SessionBooking: "mentor/:mentorId/booking",
              MentorChat: "mentor/:mentorId/chat",
              MentorCall: "mentor/:mentorId/call",
            },
          },
          Projects: {
            path: "projects",
            screens: {
              ProjectsHome: "",
              ProjectDetail: ":projectId",
              ProjectSubmission: ":projectId/submission",
            },
          },
          Achievements: {
            path: "achievements",
            screens: {
              AchievementsHome: "",
              BadgeDetail: "badge/:badgeId",
              CertificateDetail: "certificate/:certificateId",
            },
          },
        },
      },
    },
  },
};
