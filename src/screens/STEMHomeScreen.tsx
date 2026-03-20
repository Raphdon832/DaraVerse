import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useAppState } from "../context/AppStateContext";
import { backToHomeHub } from "../navigation/backNavigation";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { STEMStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<STEMStackParamList, "STEMHome">;

export default function STEMHomeScreen({ navigation }: Props) {
  const rootNavigation = useRootNavigation();
  const { state } = useAppState();
  const { stemCategories: stemCategoryCatalog } = state.catalogs;
  const { contentMaxWidth, horizontalPadding, isDesktop } = useResponsiveLayout();

  const iconByCategory: Record<
    (typeof stemCategoryCatalog)[number]["id"],
    React.ComponentProps<typeof Ionicons>["name"]
  > = {
    coding: "code-slash-outline",
    ai_literacy: "sparkles-outline",
    cybersecurity: "shield-checkmark-outline",
    data_skills: "bar-chart-outline",
    robotics_climate_tech: "leaf-outline",
  };

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

  const totalSessions = stemCategoryCatalog.reduce(
    (sum, category) => sum + state.stemTriviaProgress[category.id].sessionsPlayed,
    0,
  );
  const bestScore = stemCategoryCatalog.reduce(
    (best, category) => Math.max(best, state.stemTriviaProgress[category.id].bestScore),
    0,
  );
  const categoryCards = stemCategoryCatalog.map((category, idx) => {
    const progress = state.stemTriviaProgress[category.id];
    return (
      <MotiView
        key={category.id}
        from={{ opacity: 0, translateY: 25 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", delay: 100 + idx * 80 }}
      >
        <MotiPressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("STEMCategory", { categoryId: category.id });
          }}
          animate={useMemo(
            () =>
              ({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              },
            []
          )}
          transition={{ type: "spring", damping: 15, stiffness: 250 }}
          style={styles.categoryCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={iconByCategory[category.id]}
                size={22}
                color={colors.textPrimary}
              />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.cardTitle}>{category.title}</Text>
              <Text style={styles.cardMeta}>
                Sessions: {progress.sessionsPlayed} | Best: {progress.bestScore}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
          <Text style={styles.cardDescription}>{category.summary}</Text>
        </MotiPressable>
      </MotiView>
    );
  });

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View
        style={{
          alignSelf: "center",
          maxWidth: contentMaxWidth,
          paddingHorizontal: horizontalPadding,
          width: "100%",
        }}
      >
        <AppHeader
          title="STEM"
          subtitle="Play category trivia and build mastery"
          showHomeAction
          onPressHome={() => backToHomeHub(rootNavigation)}
        />
      </View>

      <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
        {isDesktop ? (
          <View style={styles.desktopShell}>
            <View style={styles.desktopSidebar}>
              <Text style={styles.desktopSidebarTitle}>STEM Panel</Text>
              <Text style={styles.desktopSidebarBody}>
                Pick a category, run short sessions, and build daily knowledge consistency.
              </Text>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Sessions Played</Text>
                <Text style={styles.desktopMetricValue}>{totalSessions}</Text>
              </View>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Best Score</Text>
                <Text style={styles.desktopMetricValue}>{bestScore}</Text>
              </View>
              <View style={styles.desktopMetricRow}>
                <Text style={styles.desktopMetricLabel}>Categories</Text>
                <Text style={styles.desktopMetricValue}>{stemCategoryCatalog.length}</Text>
              </View>
            </View>
            <View style={[styles.categoryList, styles.desktopCategoryList]}>{categoryCards}</View>
          </View>
        ) : (
          <View style={styles.categoryList}>{categoryCards}</View>
        )}
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
  categoryList: {
    gap: spacing.sm,
  },
  desktopCategoryList: {
    flex: 1,
    minWidth: 0,
  },
  desktopShell: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  desktopSidebar: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    padding: spacing.lg,
    width: 280,
    ...shadow.soft,
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
    marginTop: spacing.sm,
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
  categoryCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xxs,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
