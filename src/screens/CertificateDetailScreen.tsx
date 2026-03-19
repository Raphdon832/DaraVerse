import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useAppState } from "../context/AppStateContext";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { AchievementsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<AchievementsStackParamList, "CertificateDetail">;

export default function CertificateDetailScreen({ route }: Props) {
  const { certificateId } = route.params;
  const { state } = useAppState();
  const { certificates: certificateCatalog } = state.catalogs;
  const certificate = certificateCatalog.find((item) => item.id === certificateId);
  const rootNavigation = useRootNavigation();
  const unlocked = state.unlockedCertificateIds.includes(certificateId);

  const completedMissions = Object.values(state.missionProgress).filter(
    (progress) => progress.status === "completed"
  ).length;
  const submittedProjects = Object.values(state.projectProgress).filter(
    (progress) => progress.status === "submitted"
  ).length;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          title="Certificate Detail"
          subtitle={certificate?.name ?? "Certificate"}
          showHomeAction
          onPressHome={() => rootNavigation.goBack()}
        />

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.card}
        >
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{certificate?.description ?? "No description available."}</Text>
          <Text style={styles.label}>Status</Text>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500, delay: 300 }}
            style={[styles.statusPill, unlocked ? styles.statusUnlocked : styles.statusLocked]}
          >
            <Text style={styles.statusText}>{unlocked ? "🎓 Unlocked" : "⏳ In progress"}</Text>
          </MotiView>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.progressCard}
        >
          <Text style={styles.progressTitle}>Requirement Progress</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Missions</Text>
            <Text style={styles.progressValue}>
              {completedMissions}/{certificate?.minCompletedMissions ?? 0}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Submitted projects</Text>
            <Text style={styles.progressValue}>
              {submittedProjects}/{certificate?.minSubmittedProjects ?? 0}
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelGreen,
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
    fontWeight: "700",
  },
  statusPill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  statusUnlocked: {
    backgroundColor: colors.pastelGreen,
  },
  statusLocked: {
    backgroundColor: colors.bgSoft,
  },
  statusText: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  progressCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    padding: spacing.xl,
    marginTop: spacing.md,
    ...shadow.card,
  },
  progressTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: "600",
  },
  progressValue: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
});
