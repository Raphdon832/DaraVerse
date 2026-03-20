import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCyberQuestMissionScript } from "../data/cyberquestMission";
import { spacing, typography } from "../theme/tokens";
import type { MissionsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MissionsStackParamList, "CyberQuestSplash">;

const { width: SCREEN_W } = Dimensions.get("window");

// Keep splash responsive while minimizing heavy startup preload on web.
const CRITICAL_PRELOAD_ASSETS = [
  require("../../public/UI_Assets/New Assets/Dara and the CyberQuest Splashscreen.png"),
  require("../../public/UI_Assets/New Assets/Dara Folding Arms.png"),
  require("../../public/UI_Assets/New Assets/Dara and the CyberQuest landscape splash 2.png"),
  require("../../public/UI_Assets/New Assets/Computer Lab.png"),
  require("../../public/UI_Assets/CodeWorldSchool.png"),
];

const LOADING_TIPS = [
  "Always use strong, unique passwords.",
  "Think before you click. Phishing is real.",
  "Two-factor authentication adds protection.",
  "Check the sender before opening emails.",
  "Your digital footprint matters.",
  "Ready to outsmart ShadowAdmin?",
];

const MIN_SPLASH_DURATION_MS = 900;

export default function CyberQuestSplashScreen({ navigation, route }: Props) {
  const { missionId } = route.params;
  const missionScript = getCyberQuestMissionScript(missionId);
  const missionNumber = missionId.match(/-m(\d+)$/)?.[1];
  const missionLabel = missionNumber ? `MISSION ${missionNumber}` : "MISSION";
  const splashTitle =
    missionScript.title === "Dara and the CyberQuest"
      ? "Dara and the\nCyberQuest"
      : missionScript.title;
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((index) => (index + 1) % LOADING_TIPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();
    const totalAssets = CRITICAL_PRELOAD_ASSETS.length;

    const preloadAsset = async (source: number) => {
      const resolved = Image.resolveAssetSource(source);
      if (resolved?.uri) {
        await Image.prefetch(resolved.uri);
      }
    };

    const preloadCriticalAssets = async () => {
      for (let index = 0; index < totalAssets; index += 1) {
        try {
          await preloadAsset(CRITICAL_PRELOAD_ASSETS[index]);
        } catch {
          // Continue startup even if one asset cannot be prefetched.
        }
        if (!cancelled) {
          setProgress((index + 1) / totalAssets);
        }
      }

      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(0, MIN_SPLASH_DURATION_MS - elapsed);
      setTimeout(() => {
        if (!cancelled) {
          setProgress(1);
          setLoaded(true);
        }
      }, remainingDelay);
    };

    void preloadCriticalAssets();

    return () => {
      cancelled = true;
    };
  }, []);

  const navigateToStory = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.replace("MissionPlayer", { missionId });
  }, [missionId, navigation]);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(navigateToStory, 220);
    return () => clearTimeout(timer);
  }, [loaded, navigateToStory]);

  const barWidth = Math.round(progress * (SCREEN_W - spacing.xl * 4));

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../public/UI_Assets/New Assets/Dara and the CyberQuest Splashscreen.png")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.spacer} />

          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 200 }}
            style={styles.branding}
          >
            <Text style={styles.missionLabel}>{missionLabel}</Text>
            <Text style={styles.title}>{splashTitle}</Text>
            <Text style={styles.subtitle}>{missionScript.subtitle}</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 500 }}
            style={styles.loadingSection}
          >
            <MotiView
              key={tipIndex}
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 0.85, translateX: 0 }}
              transition={{ type: "timing", duration: 300 }}
            >
              <Text style={styles.tip}>{LOADING_TIPS[tipIndex]}</Text>
            </MotiView>

            <View style={styles.barTrack}>
              <MotiView
                animate={{ width: barWidth }}
                transition={{ type: "timing", duration: 180 }}
                style={styles.barFill}
              />
            </View>

            <Text style={styles.percent}>
              {loaded ? "Ready!" : `Preparing scene... ${Math.round(progress * 100)}%`}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateX: 60, scale: 0.85 }}
            animate={{ opacity: 1, translateX: 0, scale: 1 }}
            transition={{ type: "spring", delay: 400, damping: 14 }}
            style={styles.characterWrap}
            pointerEvents="none"
          >
            <Image
              source={require("../../public/UI_Assets/New Assets/Dara Folding Arms.png")}
              resizeMode="contain"
              style={styles.character}
            />
          </MotiView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E18" },
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover", opacity: 0.55 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 12, 26, 0.58)",
  },
  safeArea: { flex: 1 },
  spacer: { flex: 1.2 },

  branding: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  missionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FDCB6E",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 40,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },

  loadingSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  tip: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  barTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FDCB6E",
  },
  percent: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    marginTop: spacing.sm,
    textAlign: "right",
  },

  characterWrap: {
    position: "absolute",
    bottom: 0,
    right: -10,
  },
  character: {
    width: 220,
    height: 340,
  },
});
