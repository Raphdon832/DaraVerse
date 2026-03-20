import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { MotiView } from "moti";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import FeatureCard from "../components/FeatureCard";
import Pressable from "../components/SoundPressable";
import { useAppState } from "../context/AppStateContext";
import { useAuth } from "../context/AuthContext";
import { useMentorshipStoryCatalog } from "../hooks/useMentorshipStoryCatalog";
import { backToHomeHub } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { subscribeUserRole, type UserRole } from "../services/userService";
import { colors, radius, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorshipHome">;

export default function MentorshipHomeScreen({ navigation }: Props) {
  const rootNavigation = useRootNavigation();
  const { state } = useAppState();
  const { counts: storyCounts } = useMentorshipStoryCatalog();
  const { user } = useAuth();
  const { contentMaxWidth, horizontalPadding, isDesktop } = useResponsiveLayout();
  const [userRole, setUserRole] = useState<UserRole>("learner");
  const { mentors: mentorCatalog } = state.catalogs;
  const availableMentors = mentorCatalog.filter(
    (mentor) =>
      (mentor.role ?? "mentor") === "mentor" &&
      (mentor.isAcceptingMentees ?? true),
  );

  const statusLabelByValue = {
    none: "No request yet",
    pending: "Request pending",
    accepted: "Mentorship active",
    declined: "Request declined",
  } as const;

  useEffect(() => {
    if (!user) {
      setUserRole("learner");
      return;
    }

    const unsubscribe = subscribeUserRole(user.uid, (role) => {
      setUserRole(role);
    });

    return unsubscribe;
  }, [user]);

  const contentContainerStyle = useMemo(
    () => [
      styles.content,
      {
        alignSelf: "center" as const,
        maxWidth: contentMaxWidth,
        paddingHorizontal: horizontalPadding,
      },
    ],
    [contentMaxWidth, horizontalPadding],
  );
  const activeMentorshipCount = Object.values(state.mentorshipRequests).filter(
    (request) => request?.status === "accepted",
  ).length;
  const pendingMentorshipCount = Object.values(state.mentorshipRequests).filter(
    (request) => request?.status === "pending",
  ).length;
  const mentorCards = availableMentors.map((mentor, index) => {
    const requestStatus = state.mentorshipRequests[mentor.id]?.status ?? "none";
    const meta = `${mentor.openSlotsLabel} - ${statusLabelByValue[requestStatus]}`;

    return (
      <MotiView
        key={mentor.id}
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", delay: 100 + index * 100 }}
      >
        <FeatureCard
          title={`${mentor.name} - ${mentor.specialty}`}
          subtitle={mentor.description}
          meta={meta}
          accentColor={index % 2 === 0 ? colors.pastelPurple : colors.pastelGreen}
          onPress={() => navigation.navigate("MentorProfile", { mentorId: mentor.id })}
        />
      </MotiView>
    );
  });

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Mentorship"
          subtitle="Get guidance from STEM and leadership mentors"
          showHomeAction
          onPressHome={() => backToHomeHub(rootNavigation)}
        />

        {isDesktop ? (
          <View style={styles.desktopShell}>
            <View style={styles.desktopSidebar}>
              <Text style={styles.sectionTitle}>Mentorship Panel</Text>
              <Text style={styles.desktopSidebarBody}>
                Build ongoing mentor relationships and learn from story-based role models.
              </Text>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Available Mentors</Text>
                <Text style={styles.desktopMetricValue}>{availableMentors.length}</Text>
              </View>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Active Sessions</Text>
                <Text style={styles.desktopMetricValue}>{activeMentorshipCount}</Text>
              </View>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Pending Requests</Text>
                <Text style={styles.desktopMetricValue}>{pendingMentorshipCount}</Text>
              </View>
              <FeatureCard
                title="Stories and Story Trivia"
                subtitle="Women-led, African-centered influence library"
                meta={`${storyCounts.total} stories - 50 questions per story - random 10 each session`}
                accentColor={colors.pastelYellow}
                onPress={() => navigation.navigate("MentorshipStories")}
              />
            </View>
            <View style={styles.desktopMainColumn}>
              <Text style={styles.sectionTitle}>Available Mentors</Text>
              {userRole === "admin" ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open add mentor screen"
                  onPress={() => navigation.navigate("AddMentor")}
                  style={({ pressed }) => [
                    styles.addMentorButton,
                    pressed && styles.addMentorButtonPressed,
                  ]}
                >
                  <Text style={styles.addMentorButtonText}>Add Mentor (Admin)</Text>
                </Pressable>
              ) : null}
              {mentorCards}
              {availableMentors.length === 0 ? (
                <Text style={styles.emptyStateText}>
                  No mentors are currently available. Check again soon.
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <>
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 350 }}
            >
              <Text style={styles.sectionTitle}>Inspiration Stories</Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", delay: 120 }}
            >
              <FeatureCard
                title="Stories and Story Trivia"
                subtitle="Women-led, African-centered influence library"
                meta={`${storyCounts.total} stories - 50 questions per story - random 10 each session`}
                accentColor={colors.pastelYellow}
                onPress={() => navigation.navigate("MentorshipStories")}
              />
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 350 }}
            >
              <Text style={styles.sectionTitle}>Available Mentors</Text>
            </MotiView>

            {userRole === "admin" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open add mentor screen"
                onPress={() => navigation.navigate("AddMentor")}
                style={({ pressed }) => [
                  styles.addMentorButton,
                  pressed && styles.addMentorButtonPressed,
                ]}
              >
                <Text style={styles.addMentorButtonText}>Add Mentor (Admin)</Text>
              </Pressable>
            ) : null}

            {mentorCards}

            {availableMentors.length === 0 ? (
              <Text style={styles.emptyStateText}>
                No mentors are currently available. Check again soon.
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPurple,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  desktopShell: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  desktopSidebar: {
    width: 320,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    padding: spacing.lg,
  },
  desktopMainColumn: {
    flex: 1,
    minWidth: 0,
  },
  desktopSidebarBody: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  desktopMetricRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  desktopMetricLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  desktopMetricValue: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "900",
  },
  addMentorButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    justifyContent: "center",
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  addMentorButtonPressed: {
    backgroundColor: colors.ctaPrimaryPressed,
  },
  addMentorButtonText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
});
