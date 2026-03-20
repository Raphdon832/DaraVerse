import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../components/BackButton";
import Pressable from "../components/SoundPressable";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { backToHomeHub } from "../navigation/backNavigation";
import { useAppState } from "../context/AppStateContext";
import { isCyberQuestMissionId } from "../data/cyberquestMission";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MissionsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MissionsStackParamList, "MissionsHome">;
const CYBERQUEST_BANNER_ASPECT_RATIO = 1600 / 619;

const iconMap = [
  { imgColor: colors.pastelPink, icon: "shield-checkmark-outline" },
  { imgColor: colors.pastelBlue, icon: "construct-outline" },
  { imgColor: colors.pastelYellow, icon: "game-controller-outline" },
  { imgColor: colors.pastelGreen, icon: "grid-outline" },
  { imgColor: colors.pastelPurple, icon: "code-slash-outline" },
];

const missionStyleById: Record<string, { imgColor: string; icon: string }> = {
  "cyberquest-m1": { imgColor: colors.pastelPink, icon: "shield-checkmark-outline" },
  "cyberquest-m2": { imgColor: colors.pastelPink, icon: "wifi-outline" },
  "robot-relay-m1": { imgColor: colors.pastelBlue, icon: "construct-outline" },
  "chess-tactics-m1": { imgColor: colors.pastelYellow, icon: "game-controller-outline" },
  "sudoku-sprint-m1": { imgColor: colors.pastelGreen, icon: "grid-outline" },
  "code-debug-dash-m1": { imgColor: colors.pastelPurple, icon: "bug-outline" },
  "loop-lab-m1": { imgColor: colors.pastelPeach, icon: "code-slash-outline" },
  "binary-bridge-m1": { imgColor: colors.pastelBlue, icon: "hardware-chip-outline" },
};

export default function MissionsHomeScreen({ navigation }: Props) {
  const rootNavigation = useRootNavigation();
  const { state } = useAppState();
  const { contentMaxWidth, horizontalPadding, isDesktop } = useResponsiveLayout();
  const { missions: missionCatalog, missionGames } = state.catalogs;

  const getMissionStyle = (id: string, idx: number) => {
    return (
      missionStyleById[id] ?? iconMap[idx % iconMap.length]
    );
  };

  const isMissionGameMission = (id: string) => missionGames.some((mg) => mg.missionId === id);

  const completedCount = Object.values(state.missionProgress).filter(
    (p) => p.status === "completed"
  ).length;
  const inProgressCount = Object.values(state.missionProgress).filter(
    (p) => p.status === "in_progress",
  ).length;
  const averageDurationMinutes = missionCatalog.length
    ? Math.round(
        missionCatalog.reduce((sum, mission) => sum + mission.durationMinutes, 0) /
          missionCatalog.length,
      )
    : 0;

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      {
        alignSelf: "center" as const,
        maxWidth: contentMaxWidth,
        paddingHorizontal: horizontalPadding,
        width: "100%" as const,
      },
    ],
    [contentMaxWidth, horizontalPadding],
  );

  const missionCards = missionCatalog.map((mission, idx) => {
    const styleAsset = missionStyleById[mission.id] ?? iconMap[idx % iconMap.length];
    const isCyberQuest = isCyberQuestMissionId(mission.id);
    const isGameMission = isMissionGameMission(mission.id);
    const missionTypeLabel = isCyberQuest
      ? "Story Mission"
      : isGameMission
        ? "Game Mission"
        : "Interactive Mission";
    const missionTypeIcon = isCyberQuest ? "book-outline" : "game-controller-outline";

    return (
      <MotiView
        key={mission.id}
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", delay: 150 + idx * 100 }}
      >
        <MotiPressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isCyberQuest) {
              navigation.navigate("CyberQuestSplash", { missionId: mission.id });
            } else {
              navigation.navigate("MissionDetail", { missionId: mission.id });
            }
          }}
          animate={useMemo(
            () =>
              ({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              },
            []
          )}
          style={[styles.card, isDesktop && styles.desktopCard]}
        >
          {isCyberQuest ? (
            <View style={styles.cyberQuestCardImg}>
              <Image
                source={require("../../assets/UI_Assets/New Assets/Dara and the CyberQuest landscape splash.png")}
                style={styles.cyberQuestCardImageAsset}
                resizeMode="contain"
              />
              <View style={styles.interactiveBadge}>
                <Ionicons name={missionTypeIcon as any} size={12} color="#fff" />
                <Text style={styles.interactiveBadgeText}>{missionTypeLabel}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.cardImgPlaceholder, { backgroundColor: styleAsset.imgColor }]}>
              <Ionicons name={styleAsset.icon as any} size={64} color="#FFF" style={{ opacity: 0.8 }} />
              <View style={styles.interactiveBadge}>
                <Ionicons name={missionTypeIcon as any} size={12} color="#fff" />
                <Text style={styles.interactiveBadgeText}>{missionTypeLabel}</Text>
              </View>
            </View>
          )}
          <View style={styles.cardTextRow}>
            <View style={styles.textStack}>
              <Text style={styles.cardTitle}>{mission.title}</Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.cardDuration}>{mission.durationMinutes} mins</Text>
              </View>
            </View>

            <View style={styles.playBtnAbs}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={20} color={colors.textInverse} style={{ marginLeft: 3 }} />
              </View>
            </View>
          </View>
        </MotiPressable>
      </MotiView>
    );
  });

  return (
    <View style={styles.container}>
      {/* Curved Header */}
      <View style={styles.curvedHeaderWrapper}>
        <View style={styles.curvedHeaderBg} />
        <View style={styles.headerContent}>
          <SafeAreaView edges={["top"]} style={styles.safeAreaRow}>
            <View
              style={[
                styles.topNavRow,
                {
                  alignSelf: "center",
                  maxWidth: contentMaxWidth,
                  paddingHorizontal: horizontalPadding,
                  width: "100%",
                },
              ]}
            >
              <BackButton
                accessibilityLabel="Go to previous screen"
                onPress={() => backToHomeHub(rootNavigation)}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search across the app"
                onPress={() => rootNavigation.navigate("HomeHub")}
              >
                <Ionicons name="search" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 100 }}
              style={[
                styles.titleArea,
                {
                  alignSelf: "center",
                  maxWidth: contentMaxWidth,
                  width: "100%",
                },
              ]}
            >
              <View style={styles.categoryIconWrap}>
                <Ionicons name="rocket" size={32} color={colors.ctaPrimary} />
              </View>
              <Text style={styles.mainTitle}>Missions</Text>
              <Text style={styles.subtitle}>{missionCatalog.length - completedCount} New Episodes</Text>
            </MotiView>
          </SafeAreaView>
        </View>
      </View>

      <ScrollView contentContainerStyle={listContentStyle} showsVerticalScrollIndicator={false}>
        {isDesktop ? (
          <View style={styles.desktopShell}>
            <View style={styles.desktopSidebar}>
              <View style={styles.desktopSidebarCard}>
                <Text style={styles.desktopSidebarTitle}>Mission Desk</Text>
                <Text style={styles.desktopSidebarBody}>
                  Track active episodes and jump into your next mission from one place.
                </Text>
                <View style={styles.desktopMetricRow}>
                  <Text style={styles.desktopMetricLabel}>Completed</Text>
                  <Text style={styles.desktopMetricValue}>{completedCount}</Text>
                </View>
                <View style={styles.desktopMetricRow}>
                  <Text style={styles.desktopMetricLabel}>In Progress</Text>
                  <Text style={styles.desktopMetricValue}>{inProgressCount}</Text>
                </View>
                <View style={styles.desktopMetricRow}>
                  <Text style={styles.desktopMetricLabel}>Avg Duration</Text>
                  <Text style={styles.desktopMetricValue}>{averageDurationMinutes}m</Text>
                </View>
              </View>
            </View>
            <View style={styles.desktopMissionList}>{missionCards}</View>
          </View>
        ) : (
          missionCards
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pastelBlue,
  },
  curvedHeaderWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 1,
  },
  curvedHeaderBg: {
    position: "absolute",
    top: -150,
    left: -100,
    right: -100,
    height: 450,
    backgroundColor: colors.pastelYellow,
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeAreaRow: {
    flex: 1,
  },
  topNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  titleArea: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  categoryIconWrap: {
    marginBottom: spacing.sm,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  listContent: {
    paddingTop: 280,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  desktopShell: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
    width: "100%",
  },
  desktopSidebar: {
    width: 280,
  },
  desktopSidebarCard: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    padding: spacing.lg,
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
  desktopMissionList: {
    flex: 1,
    gap: spacing.xl,
    minWidth: 0,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    ...shadow.card,
    position: "relative",
    overflow: "hidden",
  },
  desktopCard: {
    alignSelf: "stretch",
    width: "100%",
  },
  cardImgPlaceholder: {
    height: 140,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cyberQuestCardImg: {
    margin: 8,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    aspectRatio: CYBERQUEST_BANNER_ASPECT_RATIO,
    alignSelf: "stretch",
  },
  cyberQuestCardImageAsset: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  cardTextRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
    flexDirection: "row",
    alignItems: "flex-end",
    position: "relative",
  },
  textStack: {
    flex: 1,
    paddingRight: 60,
  },
  cardTitle: {
    fontSize: typography.subheading,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: 4,
  },
  cardDuration: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  playBtnAbs: {
    position: "absolute",
    right: 24,
    bottom: 16,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.ctaPrimary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.fab,
  },
  interactiveBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interactiveBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
