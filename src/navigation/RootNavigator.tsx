import {
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";

import { stopAllTrackedAudio } from "../audio/audioManager";
import { useAuth } from "../context/AuthContext";
import { useAppState } from "../context/AppStateContext";
import AuthWelcomeScreen from "../screens/AuthWelcomeScreen";
import HomeHubScreen from "../screens/HomeHubScreen";
import LoginScreen from "../screens/LoginScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegistrationScreen from "../screens/RegistrationScreen";
import SignUpScreen from "../screens/SignUpScreen";
import { colors } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";
import { linking } from "./linking";
import MainTabsNavigator from "./MainTabsNavigator";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bgCanvas,
    card: colors.bgSurface,
    text: colors.textPrimary,
    border: colors.borderSoft,
    primary: colors.ctaPrimary,
  },
};

export default function RootNavigator() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { state } = useAppState();
  const handleNavigationStateChange = useCallback(() => {
    void stopAllTrackedAudio();
  }, []);

  // Show loading screen while auth or data is loading
  if (isAuthLoading || state.isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.ctaPrimary} />
        <Text style={styles.loadingText}>Loading Daraverse...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      theme={navigationTheme}
      onStateChange={handleNavigationStateChange}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 250,
        }}
      >
        {!user || !state.learner.isRegistered ? (
          <>
            {/* If logged in but not registered, show Registration as the top screen */}
            {user && !state.learner.isRegistered && (
              <RootStack.Screen
                name="Registration"
                component={RegistrationScreen}
                options={{ animation: "fade" }}
              />
            )}
            <RootStack.Screen
              name="AuthWelcome"
              component={AuthWelcomeScreen}
              options={{ animation: "fade" }}
            />
            <RootStack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <RootStack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ animation: "slide_from_bottom" }}
            />
          </>
        ) : (
          <>
            <RootStack.Screen
              name="HomeHub"
              component={HomeHubScreen}
              options={{ animation: "fade" }}
            />
            <RootStack.Screen
              name="MainTabs"
              component={MainTabsNavigator}
            />
            <RootStack.Screen
              name="Profile"
              component={ProfileScreen}
            />
            <RootStack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ animation: "slide_from_bottom" }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
