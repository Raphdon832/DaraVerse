import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import FeatureCard from "../components/FeatureCard";
import ProgressCard from "../components/ProgressCard";
import { useAppState } from "../context/AppStateContext";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { AchievementsStackParamList } from "../types/navigation";
import type { Badge } from "../types/models";
import { getBadgeBg } from "../utils/badgeImages";

type Props = NativeStackScreenProps<AchievementsStackParamList, "AchievementsHome">;

export default function AchievementsHomeScreen({ navigation }: Props) {
  const rootNavigation = useRootNavigation();
  const { state } = useAppState();
  const { contentMaxWidth, horizontalPadding, isDesktop, isLargeScreen } =
    useResponsiveLayout();
  const { badges: badgeCatalog, certificates: certificateCatalog } = state.catalogs;
  const isDarkBg = state.theme.appBgColor === "#1E293B";

  const completedMissions = Object.values(state.missionProgress).filter(
    (progress) => progress.status === "completed"
  ).length;
  const submittedProjects = Object.values(state.projectProgress).filter(
    (progress) => progress.status === "submitted"
  ).length;
  const totalStemTriviaSessions = Object.values(state.stemTriviaProgress).reduce(
    (total, progress) => total + progress.sessionsPlayed,
    0
  );

  const latestBadgeId = state.unlockedBadgeIds[state.unlockedBadgeIds.length - 1];
  const latestBadge = badgeCatalog.find((badge) => badge.id === latestBadgeId);
  const primaryCertificate = certificateCatalog[0];
  const certificateUnlocked = state.unlockedCertificateIds.includes(primaryCertificate.id);

  const pressAnimation = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return { scale: pressed ? 0.96 : 1 };
      },
    []
  );

  const dailyGoals = badgeCatalog.filter((b) => b.id.includes("daily-goal"));
  const weeklyGoals = badgeCatalog.filter((b) => b.id.includes("weekly-goal"));
  const missionBadges = badgeCatalog.filter(
    (b) => !b.id.includes("daily-goal") && !b.id.includes("weekly-goal")
  );

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

  const getBadgeIcon = (id: string) => {
    if (id.includes("daily-goal")) return state.theme.iconType === "filled" ? "flame" : "flame-outline";
    if (id.includes("weekly-goal")) return state.theme.iconType === "filled" ? "trophy" : "trophy-outline";
    return state.theme.iconType === "filled" ? "medal" : "medal-outline";
  };

  const renderBadgeList = (list: Badge[], startIndex: number, isHorizontal: boolean) => {
    return list.map((badge, idx) => {
      const unlocked = state.unlockedBadgeIds.includes(badge.id);
      return (
        <MotiView
          key={badge.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: Math.min(450 + (startIndex + idx) * 30, 1500) }}
        >
          <MotiPressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("BadgeDetail", { badgeId: badge.id });
            }}
            animate={pressAnimation}
            style={[
              styles.badgeCard,
              isHorizontal ? styles.horizontalBadgeCard : undefined,
              isHorizontal
                ? { width: isDesktop ? 240 : isLargeScreen ? 220 : 200 }
                : undefined,
              unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
              unlocked && { backgroundColor: "transparent" },
            ]}
          >
            {unlocked && (
              <Image
                source={getBadgeBg(badge.id)}
                style={[StyleSheet.absoluteFill, { borderRadius: 30, opacity: 0.6 }]}
                resizeMode="cover"
              />
            )}
            {isHorizontal ? (
              <View style={styles.badgeHeaderWrap}>
                <Ionicons name={getBadgeIcon(badge.id) as any} size={28} color={unlocked ? (isDarkBg ? "#FFFFFF" : state.theme.primaryColor) : colors.textSecondary} style={{ marginBottom: spacing.xs }} />
                <Text style={[styles.badgeTitle, unlocked && { color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]} numberOfLines={1}>
                  {badge.name}
                </Text>
                <Text style={[styles.badgeMeta, { marginTop: spacing.xs, opacity: 0.8 }, unlocked && { color: "rgba(255,255,255,0.9)", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]} numberOfLines={3}>
                  {badge.description}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Ionicons name={getBadgeIcon(badge.id) as any} size={24} color={unlocked ? (isDarkBg ? "#FFFFFF" : state.theme.primaryColor) : colors.textSecondary} />
                <Text style={[styles.badgeTitle, unlocked && { color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{badge.name}</Text>
              </View>
            )}
            <Text style={[styles.badgeMeta, unlocked && { color: "rgba(255,255,255,0.9)", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{unlocked ? "Unlocked" : "Locked"}</Text>
          </MotiPressable>
        </MotiView>
      );
    });
  };

  const achievementSections = (
    <>
      {dailyGoals.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 300 }}
        >
          <Text style={styles.sectionTitle}>Daily Goals</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {renderBadgeList(dailyGoals, 0, true)}
          </ScrollView>
        </MotiView>
      )}

      {weeklyGoals.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 350 }}
        >
          <Text style={styles.sectionTitle}>Weekly Goals</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {renderBadgeList(weeklyGoals, dailyGoals.length, true)}
          </ScrollView>
        </MotiView>
      )}

      {missionBadges.length > 0 && (
        <>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 400 }}
          >
            <Text style={styles.sectionTitle}>Badge Gallery</Text>
          </MotiView>

          <View style={styles.badgeWrap}>
            {renderBadgeList(missionBadges, dailyGoals.length + weeklyGoals.length, false)}
          </View>
        </>
      )}
    </>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Achievements"
          subtitle="Badges, goals, and milestone progress"
          showHomeAction
          onPressHome={() => rootNavigation.goBack()}
        />

        {isDesktop ? (
          <View style={styles.desktopShell}>
            <View style={styles.desktopSidebar}>
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", delay: 100 }}
                style={[styles.progressRow, styles.desktopProgressRow]}
              >
                <ProgressCard
                  label="Total Badges"
                  value={`${state.unlockedBadgeIds.length}`}
                  helperText={`${completedMissions} missions | ${totalStemTriviaSessions} STEM sessions`}
                />
                <ProgressCard
                  label="Certificates"
                  value={`${state.unlockedCertificateIds.length}`}
                  helperText={`${submittedProjects} submitted projects`}
                />
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", delay: 200 }}
              >
                <Text style={styles.sectionTitle}>Latest Achievement</Text>
                <FeatureCard
                  title={latestBadge?.name ?? "No badge unlocked yet"}
                  subtitle={latestBadge?.description ?? "Complete a mission to unlock your first badge."}
                  meta={latestBadge ? "Unlocked" : "Locked"}
                  accentColor={colors.pastelGreen}
                  backgroundImage={latestBadge ? getBadgeBg(latestBadge.id) : undefined}
                  onPress={() =>
                    navigation.navigate("BadgeDetail", {
                      badgeId: latestBadge?.id ?? badgeCatalog[0].id,
                    })
                  }
                />
              </MotiView>
            </View>
            <View style={styles.desktopMainColumn}>{achievementSections}</View>
          </View>
        ) : (
          <>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", delay: 100 }}
              style={styles.progressRow}
            >
              <ProgressCard
                label="Total Badges"
                value={`${state.unlockedBadgeIds.length}`}
                helperText={`${completedMissions} missions | ${totalStemTriviaSessions} STEM sessions`}
              />
              <ProgressCard
                label="Certificates"
                value={`${state.unlockedCertificateIds.length}`}
                helperText={`${submittedProjects} submitted projects`}
              />
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", delay: 200 }}
            >
              <Text style={styles.sectionTitle}>Latest Achievement</Text>
              <FeatureCard
                title={latestBadge?.name ?? "No badge unlocked yet"}
                subtitle={latestBadge?.description ?? "Complete a mission to unlock your first badge."}
                meta={latestBadge ? "Unlocked" : "Locked"}
                accentColor={colors.pastelGreen}
                backgroundImage={latestBadge ? getBadgeBg(latestBadge.id) : undefined}
                onPress={() =>
                  navigation.navigate("BadgeDetail", {
                    badgeId: latestBadge?.id ?? badgeCatalog[0].id,
                  })
                }
              />
            </MotiView>
            {achievementSections}
          </>
        )}
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
  progressRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  desktopShell: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  desktopSidebar: {
    width: 360,
  },
  desktopMainColumn: {
    flex: 1,
    minWidth: 0,
  },
  desktopProgressRow: {
    flexDirection: "column",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  horizontalScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  horizontalBadgeCard: {
    width: 200,
    height: 160,
    justifyContent: "space-between",
  },
  badgeHeaderWrap: {
    flex: 1,
  },
  badgeWrap: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  badgeCard: {
    borderRadius: 30,
    padding: spacing.lg,
    ...shadow.card,
    overflow: "hidden",
  },
  badgeCardUnlocked: {
    backgroundColor: colors.bgSurface,
  },
  badgeCardLocked: {
    backgroundColor: colors.bgSoft,
  },
  badgeTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  badgeMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
    fontWeight: "600",
  },
});
