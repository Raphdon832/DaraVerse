import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useCallback, useEffect, useRef } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { trackSound, untrackAndUnloadSound } from "../audio/audioManager";
import { useAppState } from "../context/AppStateContext";
import { getNextCyberQuestMissionId, isCyberQuestMissionId } from "../data/cyberquestMission";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, shadow, spacing, typography } from "../theme/tokens";
import type { MissionsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MissionsStackParamList, "MissionDetail">;

const CYBERQUEST_CTA_BG = require("../../public/UI_Assets/New Assets/Dara and the CyberQuest landscape splash.png");
const ARE_YOU_READY_AUDIO = require("../../public/Sounds/Dara and the CyberQuest Audio Assets/AreYouReady.mp3");

const pressScale = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.95 : 1 };
};

export default function MissionDetailScreen({ navigation, route }: Props) {
  const { missionId, playAreYouReadyAudio } = route.params;
  const { state, startMission } = useAppState();
  const { missions: missionCatalog, missionGames } = state.catalogs;
  const rootNavigation = useRootNavigation();
  const areYouReadySoundRef = useRef<Audio.Sound | null>(null);
  const hasPlayedAreYouReadyRef = useRef(false);
  const mission = missionCatalog.find((m) => m.id === missionId);
  const progress = state.missionProgress[missionId];
  const isGameMission = missionGames.some((mg) => mg.missionId === missionId);
  const mission1Progress = state.missionProgress["cyberquest-m1"];
  const hasPlayedMission1 = (mission1Progress?.status ?? "new") !== "new";
  const nextCyberQuestMissionId = missionId === "cyberquest-m1" ? getNextCyberQuestMissionId(missionId) : null;
  const hasNextCyberQuestMission = !!nextCyberQuestMissionId
    && missionCatalog.some((m) => m.id === nextCyberQuestMissionId);

  const stopAreYouReadyAudio = useCallback(async () => {
    if (!areYouReadySoundRef.current) return;
    await untrackAndUnloadSound(areYouReadySoundRef.current);
    areYouReadySoundRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      void stopAreYouReadyAudio();
    };
  }, [stopAreYouReadyAudio]);

  useEffect(() => {
    let cancelled = false;

    const maybePlayAreYouReady = async () => {
      if (!isCyberQuestMissionId(missionId)) return;
      if (!playAreYouReadyAudio) return;
      if (!state.settings.soundEnabled) return;
      if (hasPlayedAreYouReadyRef.current) return;
      hasPlayedAreYouReadyRef.current = true;

      await stopAreYouReadyAudio();
      if (cancelled) return;

      try {
        const { sound } = await Audio.Sound.createAsync(ARE_YOU_READY_AUDIO, {
          shouldPlay: true,
          volume: 1,
        });
        if (cancelled) {
          await untrackAndUnloadSound(sound);
          return;
        }
        trackSound(sound);
        areYouReadySoundRef.current = sound;
      } catch {
        // Ignore playback errors so screen stays responsive.
      }
    };

    void maybePlayAreYouReady();
    return () => {
      cancelled = true;
    };
  }, [missionId, playAreYouReadyAudio, state.settings.soundEnabled, stopAreYouReadyAudio]);

  if (!mission) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.content}>
          <AppHeader
            title="Mission Module"
            subtitle="Experience module not tied to a mission script"
            showHomeAction
            onPressHome={() => {
              void stopAreYouReadyAudio();
              rootNavigation.goBack();
            }}
          />
          <View style={styles.card}>
            <Text style={styles.title}>{missionId}</Text>
            <Text style={styles.meta}>
              This module is scaffolded and can be implemented as mission-linked trivia or
              community interaction.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const ctaLabel = isGameMission
    ? progress?.status === "completed"
      ? "Replay Game"
      : progress?.status === "in_progress"
        ? "Resume Game"
        : "Start Game"
    : progress?.status === "completed"
      ? "Replay Mission"
    : progress?.status === "in_progress"
        ? "Resume Mission"
        : isCyberQuestMissionId(mission.id)
          ? "Play Mission"
          : "Start Mission";

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          title={mission.title}
          subtitle={mission.subtitle}
          showHomeAction
          onPressHome={() => {
            void stopAreYouReadyAudio();
            rootNavigation.goBack();
          }}
        />

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.card}
        >
          <Text style={styles.label}>Theme</Text>
          <Text style={styles.value}>{mission.theme}</Text>
          <Text style={styles.label}>Objective</Text>
          <Text style={styles.value}>{mission.objective}</Text>
          <Text style={styles.label}>Estimated Duration</Text>
          <Text style={styles.value}>{mission.durationMinutes} mins</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.row}
        >
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statValue}>{progress?.status ?? "new"}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Best Score</Text>
            <Text style={styles.statValue}>{progress?.bestScore ?? 0}</Text>
          </View>
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
              void stopAreYouReadyAudio();
              startMission(mission.id);
              if (isCyberQuestMissionId(mission.id)) {
                navigation.navigate("CyberQuestPlayer", { missionId: mission.id });
              } else if (isGameMission) {
                navigation.navigate("MissionGame", { missionId: mission.id });
              } else {
                navigation.navigate("MissionPlayer", { missionId: mission.id });
              }
            }}
            animate={pressScale}
            style={[styles.primaryButton, isCyberQuestMissionId(mission.id) && styles.primaryButtonImageButton]}
          >
            {isCyberQuestMissionId(mission.id) ? (
              <ImageBackground
                source={CYBERQUEST_CTA_BG}
                resizeMode="cover"
                style={styles.primaryButtonImage}
                imageStyle={styles.primaryButtonImageContent}
              >
                <View style={styles.primaryButtonImageOverlay}>
                  <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
                </View>
              </ImageBackground>
            ) : (
              <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
            )}
          </MotiPressable>
        </MotiView>

        {mission.id === "cyberquest-m1" && hasPlayedMission1 && hasNextCyberQuestMission && nextCyberQuestMissionId ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 400 }}
          >
            <MotiPressable
              accessibilityRole="button"
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                void stopAreYouReadyAudio();
                startMission(nextCyberQuestMissionId);
                navigation.navigate("CyberQuestSplash", { missionId: nextCyberQuestMissionId });
              }}
              animate={pressScale}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Play Mission 2: The Network Test</Text>
            </MotiPressable>
          </MotiView>
        ) : null}

        {isCyberQuestMissionId(mission.id) ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 430 }}
          >
            <MotiPressable
              accessibilityRole="button"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                void stopAreYouReadyAudio();
                navigation.navigate("MissionPlayer", { missionId: mission.id });
              }}
              animate={pressScale}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Read Story Summary</Text>
            </MotiPressable>
          </MotiView>
        ) : null}

        {progress?.status === "completed" ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 400 }}
          >
            <MotiPressable
              accessibilityRole="button"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("MissionReflection", {
                  missionId: mission.id,
                  sessionScore: progress.lastScore,
                });
              }}
              animate={pressScale}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Open Reflection</Text>
            </MotiPressable>
          </MotiView>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelBlue,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    marginBottom: spacing.md,
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
  title: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 24,
    flex: 1,
    padding: spacing.lg,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginTop: spacing.xs,
    textTransform: "capitalize",
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: 30,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  primaryButtonImageButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  primaryButtonImage: {
    minHeight: 112,
    width: "100%",
  },
  primaryButtonImageContent: {
    borderRadius: 30,
  },
  primaryButtonImageOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(22, 33, 55, 0.35)",
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: 30,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
});

