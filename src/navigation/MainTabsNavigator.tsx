import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainTabsParamList, RootStackParamList } from "../types/navigation";
import {
  AchievementsStackNavigator,
  MentorshipStackNavigator,
  MissionsStackNavigator,
  ProjectsStackNavigator,
  STEMStackNavigator,
} from "./TabStacks";

const Tab = createBottomTabNavigator<MainTabsParamList>();

type Props = NativeStackScreenProps<RootStackParamList, "MainTabs">;

export default function MainTabsNavigator({ route }: Props) {
  const initialRouteName = route.params?.initialTab ?? "Missions";

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      backBehavior="none"
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Missions" component={MissionsStackNavigator} />
      <Tab.Screen name="STEM" component={STEMStackNavigator} />
      <Tab.Screen name="Mentorship" component={MentorshipStackNavigator} />
      <Tab.Screen name="Projects" component={ProjectsStackNavigator} />
      <Tab.Screen name="Achievements" component={AchievementsStackNavigator} />
    </Tab.Navigator>
  );
}
