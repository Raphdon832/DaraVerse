import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../components/BackButton";
import { trackSound, untrackAndUnloadSound } from "../audio/audioManager";
import { useAppState } from "../context/AppStateContext";
import { isCyberQuestMissionId } from "../data/cyberquestMission";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MissionsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MissionsStackParamList, "MissionPlayer">;

type StorySummary = {
  icon: string;
  iconColor: string;
  title: string;
  author: string;
  paragraphs: string[];
  paragraphAudio?: number[];
};

/* Story summaries keyed by mission id */
const STORY_SUMMARIES: Record<string, StorySummary> = {
  "cyberquest-m1": {
    icon: "shield-checkmark-outline",
    iconColor: "#D63031",
    title: "Dara and the CyberQuest: The Missing Files",
    author: "Daraverse Studios",
    paragraphs: [
      "It was a normal morning in the school computer lab — until every screen flashed red. Amina's science project had vanished. A system alert blared: 'UNAUTHORIZED ACCESS DETECTED. FILES COMPROMISED.' The Digital Innovation Showcase was tomorrow, and panic was spreading fast.",
      "But Dara stayed calm. \"Tech problems need smart thinking — not panic,\" she told her classmates. She noticed three suspicious clues: a strange email, a 2:47 AM login, and a mysterious file called 'Admin_Access_TEMP'. A shadowy username appeared in the logs: ShadowAdmin.",
      "Dara identified a phishing email designed to steal passwords, organized her classmates into a response team, and led them to secure every account with strong passwords and two-factor authentication. She discovered the breach wasn't magic — it was a stolen password.",
      "With the system secured and Amina's project recovered, the Showcase could go ahead. But as Dara celebrated, a new notification appeared from the Mentor Network… and deep in the system logs, ShadowAdmin's status still read: ACTIVE.",
    ],
    paragraphAudio: [
      require("../../assets/Sounds/Dara and the CyberQuest Audio Assets/DaC_1st.mp3"),
      require("../../assets/Sounds/Dara and the CyberQuest Audio Assets/DaC_2nd.mp3"),
      require("../../assets/Sounds/Dara and the CyberQuest Audio Assets/DaC_3rd.mp3"),
      require("../../assets/Sounds/Dara and the CyberQuest Audio Assets/DaC_4th.mp3"),
    ],
  },
  "cyberquest-m2": {
    icon: "wifi-outline",
    iconColor: "#6C5CE7",
    title: "Dara and the CyberQuest: The Network Test",
    author: "Daraverse Studios",
    paragraphs: [
      "After stopping the stolen-password attack, Dara expected a quiet day. Instead, the school network began glitching with random disconnects. A suspicious hotspot called 'CodeWorld_FreeFast' appeared near the hallway, and several devices nearly connected to it automatically.",
      "Dara led the team through a smarter response: isolate affected devices, preserve logs, and keep safe systems running. Instead of rushing into panic actions, the team focused on evidence and controlled containment.",
      "By matching traffic clues, they discovered unauthorized movement attempts across network segments. Dara coached the class to share clear verified updates without exposing sensitive log details, keeping everyone informed and calm.",
      "The final fix combined segmentation, credential rotation, and stronger admin protection. The school demo stayed online, the threat was contained, and Dara earned a new title: Network Guardian.",
    ],
  },
  "robot-relay-m1": {
    icon: "construct-outline",
    iconColor: "#0984E3",
    title: "Amina and the Robot Relay: Circuit Sprint Challenge",
    author: "Daraverse Studios",
    paragraphs: [
      "The robot stopped mid-relay during the final practice run. Amina's team froze — the competition was in two hours. Wires, code, and pressure all tangled together as everyone talked over each other.",
      "Amina took charge. Instead of panicking, she methodically checked power connections before touching any code. She found a loose wire on the motor controller — a simple fix that would have been missed if they'd jumped straight to rewriting software.",
      "With the hardware fixed, she organized the team: one person on sensor calibration, another on code review, and a third on backup battery prep. Clear roles and a 5-minute check-in kept everyone focused and productive.",
      "The robot roared back to life. The relay was back on track — and the team had learned that great engineering starts with good troubleshooting and even better teamwork.",
    ],
  },
};

export default function MissionPlayerScreen({ navigation, route }: Props) {
  const { missionId } = route.params;
  const { state } = useAppState();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const { missions: missionCatalog } = state.catalogs;
  const mission = missionCatalog.find(m => m.id === missionId);
  const story = STORY_SUMMARIES[missionId];
  const isCyberQuest = isCyberQuestMissionId(missionId);

  const displayTitle = story?.title ?? mission?.title ?? missionId;
  const displayAuthor = story?.author ?? "Daraverse Studios";
  const displayIcon = (story?.icon ?? "book-outline") as any;
  const displayIconColor = story?.iconColor ?? "#FFD1CA";
  const paragraphs = story?.paragraphs ?? ["This mission's story summary is coming soon."];
  const paragraphAudio = story?.paragraphAudio ?? [];
  const soundEnabled = state.settings.soundEnabled;

  const [pageIndex, setPageIndex] = useState(0);
  const [isNarrationMuted, setIsNarrationMuted] = useState(false);
  const narrationSoundRef = useRef<Audio.Sound | null>(null);
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };
  const totalPages = paragraphs.length;
  const progress = (pageIndex + 1) / totalPages;
  const isFirst = pageIndex === 0;
  const isLast = pageIndex === totalPages - 1;
  const effectiveNarrationMuted = isNarrationMuted || !soundEnabled;

  const pressScale = useMemo(() => ({ pressed }: { pressed: boolean }) => {
    "worklet";
    return { scale: pressed ? 0.9 : 1 };
  }, []);

  const stopNarration = useCallback(async () => {
    if (!narrationSoundRef.current) return;
    await untrackAndUnloadSound(narrationSoundRef.current);
    narrationSoundRef.current = null;
  }, []);

  const exitStorySummary = useCallback(() => {
    void stopNarration();
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("MissionDetail", { missionId });
  }, [missionId, navigation, stopNarration]);

  const goNext = useCallback(() => {
    if (!isLast) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void stopNarration();
      setPageIndex((p) => p + 1);
    }
  }, [isLast, stopNarration]);

  const goPrev = useCallback(() => {
    if (!isFirst) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void stopNarration();
      setPageIndex((p) => p - 1);
    }
  }, [isFirst, stopNarration]);

  useEffect(() => {
    return () => {
      void stopNarration();
    };
  }, [stopNarration]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      void stopNarration();
    });
    return unsubscribe;
  }, [navigation, stopNarration]);

  useEffect(() => {
    let cancelled = false;

    const loadNarration = async () => {
      await stopNarration();
      if (cancelled) return;

      if (effectiveNarrationMuted) {
        return;
      }

      const source = paragraphAudio[pageIndex];
      if (!source) {
        return;
      }

      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: true,
          volume: 1,
        });
        if (cancelled) {
          await untrackAndUnloadSound(sound);
          return;
        }
        trackSound(sound);
        narrationSoundRef.current = sound;
      } catch {
        // Avoid UI break if narration file fails to load.
      }
    };

    void loadNarration();
    return () => {
      cancelled = true;
    };
  }, [pageIndex, paragraphAudio, effectiveNarrationMuted, stopNarration]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={[styles.topNavRow, responsiveContainerStyle]}>
        <BackButton
          accessibilityLabel="Go to previous screen"
          onPress={exitStorySummary}
        />
        <Text style={styles.screenTitle}>Story Summary</Text>
        <View style={styles.pageChip}>
          <Ionicons name="book-outline" size={14} color={colors.ctaPrimary} />
          <Text style={styles.pageChipText}>{pageIndex + 1}/{totalPages}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]} showsVerticalScrollIndicator={false}>
        {/* Main Image Banner */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 100 }}
          style={[styles.imageBanner, isCyberQuest && { backgroundColor: "transparent" }]}
        >
          {isCyberQuest ? (
            <Image
              source={require("../../assets/UI_Assets/New Assets/Dara and the CyberQuest landscape splash 2.png")}
              style={{ width: "100%", height: "100%", borderRadius: 30 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name={displayIcon} size={80} color={displayIconColor} style={{ opacity: 0.6 }} />
          )}
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.headerInfo}
        >
          <Text style={styles.storyTitle}>{displayTitle}</Text>
          <Text style={styles.storyAuthor}>by {displayAuthor}</Text>
        </MotiView>

        {/* Progress bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <MotiView
              animate={{ width: `${Math.round(progress * 100)}%` as any }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.progressBarFill}
            />
          </View>
          <Text style={styles.partLabel}>Part {pageIndex + 1} of {totalPages}</Text>
        </View>

        <View style={styles.audioControlCard}>
          <View style={styles.audioControlTextWrap}>
            <Text style={styles.audioControlTitle}>Narration</Text>
            <Text style={styles.audioControlSubtitle}>
              {!soundEnabled
                ? "Narration disabled by Settings > Preferences > Sound Effects."
                : effectiveNarrationMuted
                  ? "Narration muted for this story."
                  : "Narration will read this part out loud."}
            </Text>
          </View>
          <Switch
            value={effectiveNarrationMuted}
            disabled={!soundEnabled}
            onValueChange={(nextValue) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsNarrationMuted(nextValue);
            }}
            trackColor={{ false: colors.bgSoft, true: colors.ctaPrimary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Reading area — one paragraph at a time */}
        <MotiView
          key={pageIndex}
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 200 }}
          style={styles.readingArea}
        >
          <Text style={styles.storyText}>{paragraphs[pageIndex]}</Text>
        </MotiView>

        {/* Navigation controls */}
        <View style={styles.controlsRow}>
          <MotiPressable
            onPress={goPrev}
            animate={pressScale}
            style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
          >
            <Ionicons name="chevron-back" size={20} color={isFirst ? colors.textMuted : colors.textPrimary} />
            <Text style={[styles.navBtnText, isFirst && styles.navBtnTextDisabled]}>Previous</Text>
          </MotiPressable>

          {/* Page dots */}
          <View style={styles.dotsRow}>
            {paragraphs.map((_, i) => (
              <View key={i} style={[styles.dot, i === pageIndex && styles.dotActive]} />
            ))}
          </View>

          {isLast ? (
            <MotiPressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                void stopNarration();
                if (isCyberQuest) {
                  navigation.navigate("MissionDetail", {
                    missionId,
                    playAreYouReadyAudio: true,
                  });
                } else {
                  exitStorySummary();
                }
              }}
              animate={pressScale}
              style={styles.finishBtn}
            >
              <Text style={styles.finishBtnText}>Done</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </MotiPressable>
          ) : (
            <MotiPressable
              onPress={goNext}
              animate={pressScale}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
            </MotiPressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelBlue,
  },
  topNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pageChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 5,
    ...shadow.soft,
  },
  pageChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ctaPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  imageBanner: {
    height: 220,
    backgroundColor: colors.pastelPink,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  headerInfo: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  storyAuthor: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 4,
  },

  /* Progress bar */
  progressBarWrapper: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderSoft,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.ctaPrimary,
  },
  partLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.xs,
  },
  audioControlCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  audioControlTextWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  audioControlTitle: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  audioControlSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    lineHeight: 17,
  },

  /* Reading area */
  readingArea: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xl,
    minHeight: 180,
    ...shadow.card,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.textPrimary,
    fontWeight: "500",
  },

  /* Controls */
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    gap: 4,
    ...shadow.soft,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  navBtnTextDisabled: {
    color: colors.textMuted,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderSoft,
  },
  dotActive: {
    backgroundColor: colors.ctaPrimary,
    width: 20,
    borderRadius: 4,
  },
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00B894",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    gap: 6,
    ...shadow.card,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});


