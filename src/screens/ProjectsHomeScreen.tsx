import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import FeatureCard from "../components/FeatureCard";
import { useAppState } from "../context/AppStateContext";
import { backToHomeHub } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, spacing, typography } from "../theme/tokens";
import type { ProjectsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<ProjectsStackParamList, "ProjectsHome">;

export default function ProjectsHomeScreen({ navigation }: Props) {
  const rootNavigation = useRootNavigation();
  const { state, setProjectStatus } = useAppState();
  const { projects: projectCatalog } = state.catalogs;
  const { contentMaxWidth, horizontalPadding, isDesktop } = useResponsiveLayout();

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
  const submittedCount = Object.values(state.projectProgress).filter(
    (progress) => progress.status === "submitted",
  ).length;
  const inProgressCount = Object.values(state.projectProgress).filter(
    (progress) => progress.status === "in_progress",
  ).length;
  const projectCards = projectCatalog.map((project, index) => {
    const progress = state.projectProgress[project.id];
    return (
      <MotiView
        key={project.id}
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", delay: 100 + index * 100 }}
      >
        <FeatureCard
          title={project.title}
          subtitle={project.description}
          meta={`${progress?.status ?? "not_started"} - ${project.estimatedMinutes} mins`}
          accentColor={index % 2 === 0 ? colors.pastelBlue : colors.pastelPeach}
          onPress={() => navigation.navigate("ProjectDetail", { projectId: project.id })}
          onPressCTA={() => {
            setProjectStatus({ projectId: project.id, status: "in_progress" });
            navigation.navigate("ProjectSubmission", { projectId: project.id });
          }}
        />
      </MotiView>
    );
  });

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Projects"
          subtitle="Turn missions and STEM into portfolio-ready work"
          showHomeAction
          onPressHome={() => backToHomeHub(rootNavigation)}
        />

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
        >
          <Text style={styles.sectionTitle}>Active Board</Text>
        </MotiView>

        {isDesktop ? (
          <View style={styles.desktopShell}>
            <View style={styles.desktopSidebar}>
              <Text style={styles.desktopSidebarTitle}>Project Board</Text>
              <Text style={styles.desktopSidebarBody}>
                Move from mission output to portfolio-ready submissions with clear next steps.
              </Text>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>In Progress</Text>
                <Text style={styles.desktopMetricValue}>{inProgressCount}</Text>
              </View>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Submitted</Text>
                <Text style={styles.desktopMetricValue}>{submittedCount}</Text>
              </View>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Total Projects</Text>
                <Text style={styles.desktopMetricValue}>{projectCatalog.length}</Text>
              </View>
            </View>
            <View style={styles.desktopMainColumn}>{projectCards}</View>
          </View>
        ) : (
          projectCards
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPeach,
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
  },
  desktopSidebar: {
    width: 280,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
    padding: spacing.lg,
  },
  desktopMainColumn: {
    flex: 1,
    minWidth: 0,
  },
  desktopSidebarTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
  },
  desktopSidebarBody: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
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
});
