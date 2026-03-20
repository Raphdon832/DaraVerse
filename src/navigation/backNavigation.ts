import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../types/navigation";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function backToHomeHub(rootNavigation: RootNavigation) {
  rootNavigation.navigate("HomeHub");
}

export function backToMissionsHome(rootNavigation: RootNavigation) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Missions",
    screen: "Missions",
    params: { screen: "MissionsHome" },
  });
}

export function backToMissionDetail(rootNavigation: RootNavigation, missionId: string) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Missions",
    screen: "Missions",
    params: { screen: "MissionDetail", params: { missionId } },
  });
}

export function backToStemHome(rootNavigation: RootNavigation) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "STEM",
    screen: "STEM",
    params: { screen: "STEMHome" },
  });
}

export function backToProjectsHome(rootNavigation: RootNavigation) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Projects",
    screen: "Projects",
    params: { screen: "ProjectsHome" },
  });
}

export function backToProjectDetail(rootNavigation: RootNavigation, projectId: string) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Projects",
    screen: "Projects",
    params: { screen: "ProjectDetail", params: { projectId } },
  });
}

export function backToMentorshipHome(rootNavigation: RootNavigation) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Mentorship",
    screen: "Mentorship",
    params: { screen: "MentorshipHome" },
  });
}

export function backToMentorshipStories(rootNavigation: RootNavigation) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Mentorship",
    screen: "Mentorship",
    params: { screen: "MentorshipStories" },
  });
}

export function backToMentorshipStoryDetail(rootNavigation: RootNavigation, storyId: string) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Mentorship",
    screen: "Mentorship",
    params: { screen: "MentorshipStoryDetail", params: { storyId } },
  });
}

export function backToAchievementsHome(rootNavigation: RootNavigation) {
  rootNavigation.navigate("MainTabs", {
    initialTab: "Achievements",
    screen: "Achievements",
    params: { screen: "AchievementsHome" },
  });
}
