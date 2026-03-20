import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useAppState } from "../context/AppStateContext";
import { backToProjectsHome } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { ProjectsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<ProjectsStackParamList, "ProjectDetail">;

export default function ProjectDetailScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const { state, setProjectStatus } = useAppState();
  const { projects: projectCatalog } = state.catalogs;
  const rootNavigation = useRootNavigation();
  const project = projectCatalog.find((item) => item.id === projectId);
  const projectProgress = state.projectProgress[projectId];
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  if (!project) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title="Project Detail"
            subtitle="Project not found"
            showHomeAction
            onPressHome={() => backToProjectsHome(rootNavigation)}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={responsiveContainerStyle}>
        <AppHeader
          title="Project Detail"
          subtitle={project.title}
          showHomeAction
          onPressHome={() => backToProjectsHome(rootNavigation)}
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]}>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.card}
        >
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{project.description}</Text>
          <Text style={styles.label}>Estimated Time</Text>
          <Text style={styles.value}>{project.estimatedMinutes} mins</Text>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{projectProgress?.status ?? "not_started"}</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
        >
          <MotiPressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setProjectStatus({ projectId, status: "in_progress" });
            }}
            animate={useMemo(
              () =>
                ({ pressed }) => {
                  "worklet";
                  return { scale: pressed ? 0.95 : 1 };
                },
              []
            )}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>Mark In Progress</Text>
          </MotiPressable>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 300 }}
        >
          <MotiPressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.navigate("ProjectSubmission", { projectId });
            }}
            animate={useMemo(
              () =>
                ({ pressed }) => {
                  "worklet";
                  return { scale: pressed ? 0.95 : 1 };
                },
              []
            )}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryText}>Submit Project</Text>
          </MotiPressable>
        </MotiView>
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
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    padding: spacing.xl,
    ...shadow.card,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.body,
    marginTop: spacing.xxs,
    textTransform: "capitalize",
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: 30,
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
  },
  primaryText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: 30,
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
});
