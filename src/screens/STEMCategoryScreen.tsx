import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import BackButton from "../components/BackButton";
import { useAppState } from "../context/AppStateContext";
import { defaultAgeBracket, getAgeBracketLabel } from "../data/ageBrackets";
import { backToStemHome } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { STEMStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<STEMStackParamList, "STEMCategory">;

export default function STEMCategoryScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { state } = useAppState();
  const { stemCategories: stemCategoryCatalog, stemTriviaQuestions } = state.catalogs;
  const category = stemCategoryCatalog.find((c) => c.id === categoryId);
  const rootNavigation = useRootNavigation();
  const progress = state.stemTriviaProgress[categoryId];
  const ageBracket = state.learner.ageBracket ?? defaultAgeBracket;
  const questionPoolSize = stemTriviaQuestions.filter(
    (q) => q.categoryId === categoryId && q.ageBracket === ageBracket
  ).length;
  const ageLabel = getAgeBracketLabel(ageBracket);
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      {/* Header */}
      <View style={responsiveContainerStyle}>
        <AppHeader
          title={category?.title ?? "Category"}
          subtitle="Trivia Adventure"
          showHomeAction
          onPressHome={() => backToStemHome(rootNavigation)}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={[styles.content, responsiveContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.card}
        >
          <Text style={styles.sectionLabel}>About this game</Text>
          <Text style={styles.bodyText}>{category?.summary ?? ""}</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.cardSoft}
        >
          <Text style={styles.sectionLabel}>How to play</Text>
          {category?.howToPlay.map((line, index) => (
            <Text key={line} style={styles.bulletText}>
              {index + 1}. {line}
            </Text>
          ))}
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 300 }}
          style={styles.statsRow}
        >
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Question Pool</Text>
            <Text style={styles.statValue}>{questionPoolSize}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Age Bracket</Text>
            <Text style={styles.statValue}>{ageLabel}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sessions Played</Text>
            <Text style={styles.statValue}>{progress.sessionsPlayed}</Text>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 400 }}
          style={styles.statCardWide}
        >
          <Text style={styles.statLabel}>Best Score</Text>
          <Text style={styles.statValue}>{progress.bestScore}</Text>
          <Text style={styles.smallHint}>
            Questions are tailored for ages {ageLabel} from registration profile.
          </Text>
        </MotiView>
      </ScrollView>

      {/* Fixed CTA at bottom */}
      <View style={[styles.fixedBottomBar, responsiveContainerStyle]}>
        <MotiPressable
          accessibilityRole="button"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate("STEMTriviaPlayer", { categoryId });
          }}
          animate={useMemo(
            () =>
              ({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.95 : 1 };
              },
            []
          )}
          style={styles.playButton}
        >
          <Text style={styles.playButtonText}>Start Trivia Mode</Text>
        </MotiPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPink,
  },
  fixedTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  topBarTitleWrap: {
    marginLeft: spacing.md,
  },
  topBarTitle: {
    fontSize: typography.subheading,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  topBarSub: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    marginBottom: spacing.md,
    padding: spacing.xl,
    ...shadow.card,
  },
  cardSoft: {
    backgroundColor: colors.bgSoft,
    borderRadius: 30,
    marginBottom: spacing.md,
    padding: spacing.xl,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
  },
  bulletText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    flex: 1,
    padding: spacing.md,
    ...shadow.card,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  statCardWide: {
    backgroundColor: colors.pastelBlue,
    borderRadius: 30,
    marginTop: spacing.sm,
    padding: spacing.xl,
  },
  smallHint: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  fixedBottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  playButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: 30,
    paddingVertical: spacing.lg,
    ...shadow.fab,
  },
  playButtonText: {
    color: colors.textInverse,
    fontSize: typography.heading,
    fontWeight: "800",
    textAlign: "center",
  },
});
