import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AchievementsHomeScreen from "../screens/AchievementsHomeScreen";
import AddMentorScreen from "../screens/AddMentorScreen";
import BadgeDetailScreen from "../screens/BadgeDetailScreen";
import CertificateDetailScreen from "../screens/CertificateDetailScreen";
import ManageMentorshipStoriesScreen from "../screens/ManageMentorshipStoriesScreen";
import MentorCallScreen from "../screens/MentorCallScreen";
import MentorChatScreen from "../screens/MentorChatScreen";
import MentorProfileScreen from "../screens/MentorProfileScreen";
import MentorshipHomeScreen from "../screens/MentorshipHomeScreen";
import MentorshipRequestScreen from "../screens/MentorshipRequestScreen";
import MentorshipStoryEditorScreen from "../screens/MentorshipStoryEditorScreen";
import MentorshipStoriesScreen from "../screens/MentorshipStoriesScreen";
import MentorshipStoryDetailScreen from "../screens/MentorshipStoryDetailScreen";
import MentorshipStoryTriviaScreen from "../screens/MentorshipStoryTriviaScreen";
import MissionDetailScreen from "../screens/MissionDetailScreen";
import MissionGameScreen from "../screens/MissionGameScreen";
import CyberQuestPlayerScreen from "../screens/CyberQuestPlayerScreen";
import CyberQuestSplashScreen from "../screens/CyberQuestSplashScreen";
import MissionPlayerScreen from "../screens/MissionPlayerScreen";
import MissionReflectionScreen from "../screens/MissionReflectionScreen";
import MissionsHomeScreen from "../screens/MissionsHomeScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import ProjectSubmissionScreen from "../screens/ProjectSubmissionScreen";
import ProjectsHomeScreen from "../screens/ProjectsHomeScreen";
import STEMCategoryScreen from "../screens/STEMCategoryScreen";
import STEMHomeScreen from "../screens/STEMHomeScreen";
import STEMTriviaPlayerScreen from "../screens/STEMTriviaPlayerScreen";
import STEMTriviaResultScreen from "../screens/STEMTriviaResultScreen";
import type {
  AchievementsStackParamList,
  MentorshipStackParamList,
  MissionsStackParamList,
  ProjectsStackParamList,
  STEMStackParamList,
} from "../types/navigation";

const STEMStack = createNativeStackNavigator<STEMStackParamList>();
const MissionsStack = createNativeStackNavigator<MissionsStackParamList>();
const MentorshipStack = createNativeStackNavigator<MentorshipStackParamList>();
const ProjectsStack = createNativeStackNavigator<ProjectsStackParamList>();
const AchievementsStack = createNativeStackNavigator<AchievementsStackParamList>();

const screenOptions = {
  headerShown: false,
  animation: "slide_from_right" as const,
  animationDuration: 250,
};

export function STEMStackNavigator() {
  return (
    <STEMStack.Navigator screenOptions={screenOptions}>
      <STEMStack.Screen name="STEMHome" component={STEMHomeScreen} />
      <STEMStack.Screen name="STEMCategory" component={STEMCategoryScreen} />
      <STEMStack.Screen name="STEMTriviaPlayer" component={STEMTriviaPlayerScreen} />
      <STEMStack.Screen name="STEMTriviaResult" component={STEMTriviaResultScreen} />
    </STEMStack.Navigator>
  );
}

export function MissionsStackNavigator() {
  return (
    <MissionsStack.Navigator screenOptions={screenOptions}>
      <MissionsStack.Screen name="MissionsHome" component={MissionsHomeScreen} />
      <MissionsStack.Screen name="MissionDetail" component={MissionDetailScreen} />
      <MissionsStack.Screen name="MissionGame" component={MissionGameScreen} />
      <MissionsStack.Screen name="MissionPlayer" component={MissionPlayerScreen} />
      <MissionsStack.Screen name="CyberQuestSplash" component={CyberQuestSplashScreen} />
      <MissionsStack.Screen name="CyberQuestPlayer" component={CyberQuestPlayerScreen} />
      <MissionsStack.Screen name="MissionReflection" component={MissionReflectionScreen} />
    </MissionsStack.Navigator>
  );
}

export function MentorshipStackNavigator() {
  return (
    <MentorshipStack.Navigator screenOptions={screenOptions}>
      <MentorshipStack.Screen name="MentorshipHome" component={MentorshipHomeScreen} />
      <MentorshipStack.Screen name="MentorshipStories" component={MentorshipStoriesScreen} />
      <MentorshipStack.Screen name="ManageMentorshipStories" component={ManageMentorshipStoriesScreen} />
      <MentorshipStack.Screen name="MentorshipStoryEditor" component={MentorshipStoryEditorScreen} />
      <MentorshipStack.Screen name="MentorshipStoryDetail" component={MentorshipStoryDetailScreen} />
      <MentorshipStack.Screen name="MentorshipStoryTrivia" component={MentorshipStoryTriviaScreen} />
      <MentorshipStack.Screen name="MentorProfile" component={MentorProfileScreen} />
      <MentorshipStack.Screen name="SessionBooking" component={MentorshipRequestScreen} />
      <MentorshipStack.Screen name="MentorChat" component={MentorChatScreen} />
      <MentorshipStack.Screen name="MentorCall" component={MentorCallScreen} />
      <MentorshipStack.Screen name="AddMentor" component={AddMentorScreen} />
    </MentorshipStack.Navigator>
  );
}

export function ProjectsStackNavigator() {
  return (
    <ProjectsStack.Navigator screenOptions={screenOptions}>
      <ProjectsStack.Screen name="ProjectsHome" component={ProjectsHomeScreen} />
      <ProjectsStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <ProjectsStack.Screen name="ProjectSubmission" component={ProjectSubmissionScreen} />
    </ProjectsStack.Navigator>
  );
}

export function AchievementsStackNavigator() {
  return (
    <AchievementsStack.Navigator screenOptions={screenOptions}>
      <AchievementsStack.Screen name="AchievementsHome" component={AchievementsHomeScreen} />
      <AchievementsStack.Screen name="BadgeDetail" component={BadgeDetailScreen} />
      <AchievementsStack.Screen name="CertificateDetail" component={CertificateDetailScreen} />
    </AchievementsStack.Navigator>
  );
}
