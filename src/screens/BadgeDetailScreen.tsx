import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useAppState } from "../context/AppStateContext";
import { backToAchievementsHome } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { AchievementsStackParamList } from "../types/navigation";
import { getBadgeBg } from "../utils/badgeImages";

type Props = NativeStackScreenProps<AchievementsStackParamList, "BadgeDetail">;

export default function BadgeDetailScreen({ route }: Props) {
  const { badgeId } = route.params;
  const { state } = useAppState();
  const { badges: badgeCatalog } = state.catalogs;
  const badge = badgeCatalog.find((item) => item.id === badgeId);
  const rootNavigation = useRootNavigation();
  const unlocked = state.unlockedBadgeIds.includes(badgeId);
  const isDarkBg = state.theme.appBgColor === "#1E293B";
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  const getBadgeIcon = (id: string) => {
    if (id.includes("daily-goal")) return state.theme.iconType === "filled" ? "flame" : "flame-outline";
    if (id.includes("weekly-goal")) return state.theme.iconType === "filled" ? "trophy" : "trophy-outline";
    return state.theme.iconType === "filled" ? "medal" : "medal-outline";
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={responsiveContainerStyle}>
        <AppHeader
          title="Badge Detail"
          subtitle={badge?.name ?? "Badge"}
          showHomeAction
          onPressHome={() => backToAchievementsHome(rootNavigation)}
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]}>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 100 }}
          style={[styles.card, unlocked && { backgroundColor: "transparent" }]}
        >
          {unlocked && (
            <Image
              source={getBadgeBg(badgeId)}
              style={[StyleSheet.absoluteFill, { borderRadius: 30, opacity: 0.4 }]}
              resizeMode="cover"
            />
          )}
          <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
            <Ionicons name={getBadgeIcon(badgeId) as any} size={64} color={unlocked ? (isDarkBg ? "#FFFFFF" : state.theme.primaryColor) : colors.textSecondary} />
          </View>
          <Text style={[styles.label, unlocked && { color: "rgba(255,255,255,0.7)", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>Name</Text>
          <Text style={[styles.value, unlocked && { color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{badge?.name ?? badgeId}</Text>
          <Text style={[styles.label, unlocked && { color: "rgba(255,255,255,0.7)", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>Description</Text>
          <Text style={[styles.value, unlocked && { color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{badge?.description ?? "No description available."}</Text>
          {badge?.unlockCriteria ? (
            <>
              <Text style={[styles.label, unlocked && { color: "rgba(255,255,255,0.7)", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>Unlock Criteria</Text>
              <Text style={[styles.value, unlocked && { color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{badge.unlockCriteria}</Text>
            </>
          ) : null}
          <Text style={[styles.label, unlocked && { color: "rgba(255,255,255,0.7)", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>Status</Text>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500, delay: 300 }}
            style={[styles.statusPill, unlocked ? styles.statusUnlocked : styles.statusLocked]}
          >
            <Text style={styles.statusText}>{unlocked ? "Unlocked" : "Locked"}</Text>
          </MotiView>
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
    overflow: "hidden",
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
});
