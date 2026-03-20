import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useAppState } from "../context/AppStateContext";
import { backToMissionDetail } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MissionsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MissionsStackParamList, "MissionReflection">;

export default function MissionReflectionScreen({ navigation, route }: Props) {
  const { missionId, sessionScore, maxScore } = route.params;
  const { state, saveReflection } = useAppState();
  const { missions: missionCatalog } = state.catalogs;
  const mission = missionCatalog.find((m) => m.id === missionId);
  const rootNavigation = useRootNavigation();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };
  const existingReflection = state.missionProgress[missionId]?.latestReflection ?? "";
  const [reflection, setReflection] = useState(existingReflection);

  const scoreLabel = useMemo(() => {
    const recentScore = sessionScore ?? state.missionProgress[missionId]?.lastScore ?? 0;
    const sessionMax = maxScore ?? mission?.steps.reduce(
      (total, step) => total + Math.max(...step.choices.map((choice) => choice.scoreDelta), 0),
      0
    );
    if (!sessionMax) {
      return `${recentScore}`;
    }
    return `${recentScore}/${sessionMax}`;
  }, [maxScore, mission, missionId, sessionScore, state.missionProgress]);

  const handleHeaderBack = useCallback(() => {
    backToMissionDetail(rootNavigation, missionId);
  }, [missionId, rootNavigation]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
      <ScrollView
        contentContainerStyle={[styles.content, responsiveContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <AppHeader
          title="Mission Reflection"
          subtitle={mission ? mission.title : "Reflection prompt"}
          showHomeAction
          onPressHome={handleHeaderBack}
        />

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreLabel}>Session Score</Text>
          <Text style={styles.scoreValue}>{scoreLabel}</Text>
          <Text style={styles.scoreMeta}>Progress is saved to your achievements automatically.</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.formCard}
        >
          <Text style={styles.prompt}>
            {mission?.reflectionPrompt ??
              "What did you learn from this mission, and what would you do better next time?"}
          </Text>
          <TextInput
            multiline
            numberOfLines={5}
            onChangeText={setReflection}
            placeholder="Write your reflection..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            textAlignVertical="top"
            value={reflection}
          />
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
              saveReflection({ missionId, reflection: reflection.trim() });
              navigation.navigate("MissionsHome");
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
            <Text style={styles.primaryText}>Save Reflection</Text>
          </MotiPressable>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 400 }}
        >
          <MotiPressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              rootNavigation.navigate("MainTabs", {
                screen: "Achievements",
                initialTab: "Achievements",
              });
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
            <Text style={styles.secondaryText}>View Achievements</Text>
          </MotiPressable>
        </MotiView>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelBlue,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  scoreCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    marginBottom: spacing.md,
    padding: spacing.xl,
    ...shadow.card,
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  scoreMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    padding: spacing.xl,
    ...shadow.card,
  },
  prompt: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.bgSoft,
    borderRadius: 24,
    color: colors.textPrimary,
    fontSize: typography.body,
    marginTop: spacing.md,
    minHeight: 120,
    padding: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: 30,
    marginTop: spacing.xl,
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
    marginTop: spacing.sm,
    paddingVertical: spacing.lg,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
});
