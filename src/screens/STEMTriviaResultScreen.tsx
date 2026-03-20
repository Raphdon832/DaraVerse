import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useCallback, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useAppState } from "../context/AppStateContext";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { STEMStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<STEMStackParamList, "STEMTriviaResult">;

export default function STEMTriviaResultScreen({ navigation, route }: Props) {
  const { categoryId, score, totalQuestions, correctAnswers } = route.params;
  const { state } = useAppState();
  const { stemCategories: stemCategoryCatalog } = state.catalogs;
  const category = stemCategoryCatalog.find((c) => c.id === categoryId);
  const rootNavigation = useRootNavigation();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };
  const progress = state.stemTriviaProgress[categoryId];
  const percent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const animatedScore = useAnimatedNumber(score, 1500);
  const animatedPercent = useAnimatedNumber(percent, 1500);

  useEffect(() => {
    if (percent >= 80) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [percent]);

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback();
  };

  const handleHeaderBack = useCallback(() => {
    navigation.navigate("STEMCategory", { categoryId });
  }, [categoryId, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]}>
        <AppHeader
          title={`${category?.title ?? "Category"} Result`}
          subtitle="Session completed"
          showHomeAction
          onPressHome={handleHeaderBack}
        />

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 100 }}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{animatedScore}</Text>
          <Text style={styles.scoreMeta}>
            {correctAnswers}/{totalQuestions} correct ({animatedPercent}%)
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryLabel}>Category Progress</Text>
          <Text style={styles.summaryLine}>Sessions played: {progress.sessionsPlayed}</Text>
          <Text style={styles.summaryLine}>Best score: {progress.bestScore}</Text>
          <Text style={styles.summaryLine}>Average score: {progress.averageScore.toFixed(2)}</Text>
          <Text style={styles.summaryLine}>
            High-score sessions (at least 80%): {progress.highScoreSessions}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 300 }}
        >
          <MotiPressable
            onPress={() => handlePress(() => navigation.replace("STEMTriviaPlayer", { categoryId }))}
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
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </MotiPressable>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 400 }}
        >
          <MotiPressable
            onPress={() => handlePress(() => navigation.navigate("STEMCategory", { categoryId }))}
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
            <Text style={styles.secondaryButtonText}>Back to Category</Text>
          </MotiPressable>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", delay: 500 }}
        >
          <MotiPressable
            onPress={() =>
              handlePress(() =>
                rootNavigation.navigate("MainTabs", {
                  screen: "Achievements",
                  initialTab: "Achievements",
                })
              )
            }
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
            <Text style={styles.secondaryButtonText}>View Achievements</Text>
          </MotiPressable>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPink,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  scoreCard: {
    alignItems: "center",
    backgroundColor: colors.pastelGreen,
    borderRadius: 30,
    padding: spacing.xl,
    ...shadow.card,
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: "700",
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 56,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  scoreMeta: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    marginTop: spacing.lg,
    padding: spacing.xl,
    ...shadow.card,
  },
  summaryLabel: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  summaryLine: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: 30,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.heading,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: 30,
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
});
