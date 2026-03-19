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
import { colors, spacing, typography } from "../theme/tokens";
import type { MissionsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MissionsStackParamList, "CyberQuestSplash">;

const { width: SCREEN_W } = Dimensions.get("window");

/* ================================================================
   All CyberQuest image assets to preload
   ================================================================ */
const PRELOAD_ASSETS = [
    require("../../public/UI_Assets/New Assets/Computer Lab.png"),
    require("../../public/UI_Assets/New Assets/Computer lab Dark.png"),
    require("../../public/UI_Assets/CodeWorldSchool.png"),
    require("../../public/UI_Assets/Science Hallway.png"),
    require("../../public/UI_Assets/New Assets/Dara Folding Arms.png"),
    require("../../public/UI_Assets/New Assets/Dara Oh Well.png"),
    require("../../public/UI_Assets/New Assets/Dara Surprised.png"),
    require("../../public/UI_Assets/New Assets/Dara Thinking.png"),
    require("../../public/UI_Assets/New Assets/Dara Thumbs Up.png"),
    require("../../public/UI_Assets/New Assets/Dara Worried.png"),
    require("../../public/UI_Assets/New Assets/Amina Folding Arms.png"),
    require("../../public/UI_Assets/New Assets/Amina Hands On Waist.png"),
    require("../../public/UI_Assets/New Assets/Amina Oh Well.png"),
    require("../../public/UI_Assets/New Assets/Amina Surprised.png"),
    require("../../public/UI_Assets/New Assets/Amina Thinking.png"),
    require("../../public/UI_Assets/New Assets/Amina Thumbs Up.png"),
    require("../../public/UI_Assets/New Assets/Amina Worried.png"),
    require("../../public/UI_Assets/New Assets/Mr Okafor Hmmm_You Sure.png"),
    require("../../public/UI_Assets/New Assets/Mr Okafor Oh Well.png"),
    require("../../public/UI_Assets/New Assets/Mr Okafor Okay.png"),
    require("../../public/UI_Assets/New Assets/Mr Okafor Surprised_You Seeee.png"),
    require("../../public/UI_Assets/New Assets/Mr Okafor Thinking.png"),
    require("../../public/UI_Assets/New Assets/Mr Okafor Worried.png"),
    require("../../public/UI_Assets/New Assets/Mr Okafor You Think_.png"),
];

const LOADING_TIPS = [
    "🔐  Always use strong, unique passwords...",
    "🛡️  Think before you click — phishing is real!",
    "🧑‍💻  Dara never backs down from a challenge.",
    "⚡  Two-factor authentication = double the safety.",
    "🔍  Check the sender before opening emails.",
    "🌐  Your digital footprint matters.",
    "🎮  Ready to outsmart ShadowAdmin?",
];

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

    /* Rotate tips while loading */
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    /* Preload all assets */
    useEffect(() => {
        let cancelled = false;
        const total = PRELOAD_ASSETS.length;
        let done = 0;

        const preloadOne = async (source: any) => {
            try {
                // For local require() assets, Image.resolveAssetSource is cheap;
                // we simulate a "load" by resolving + a tiny delay so the bar
                // progresses visibly even on fast devices.
                Image.resolveAssetSource(source);
                await new Promise((r) => setTimeout(r, 60 + Math.random() * 80));
            } catch {
                // swallow — asset is bundled, won't really fail
            }
            if (!cancelled) {
                done += 1;
                setProgress(done / total);
                if (done === total) {
                    // Small pause after 100% so the user sees the full bar
                    setTimeout(() => {
                        if (!cancelled) setLoaded(true);
                    }, 500);
                }
            }
        };

        // Fire all preloads in parallel (staggered slightly for visual effect)
        PRELOAD_ASSETS.forEach((src, idx) => {
            setTimeout(() => preloadOne(src), idx * 50);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    /* Auto-navigate once loaded */
    const navigateToStory = useCallback(() => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace("MissionPlayer", { missionId });
    }, [navigation, missionId]);

    useEffect(() => {
        if (loaded) {
            const t = setTimeout(navigateToStory, 600);
            return () => clearTimeout(t);
        }
    }, [loaded, navigateToStory]);

    const barWidth = Math.round(progress * (SCREEN_W - spacing.xl * 4));

    return (
        <View style={s.container}>
            <ImageBackground
                source={require("../../public/UI_Assets/New Assets/Dara and the CyberQuest Splashscreen.png")}
                style={s.bg}
                imageStyle={s.bgImage}
            >
                {/* Lighter overlay since the splash is already good */}
                <View style={s.overlay} />

                <SafeAreaView style={s.safe}>
                    {/* Spacer to push content to center-bottom */}
                    <View style={s.spacer} />

                    {/* Mission branding */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "spring", delay: 200 }}
                        style={s.branding}
                    >
                        <Text style={s.missionLabel}>{missionLabel}</Text>
                        <Text style={s.title}>{splashTitle}</Text>
                        <Text style={s.subtitle}>{missionScript.subtitle}</Text>
                    </MotiView>

                    {/* Loading section */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "timing", duration: 400, delay: 500 }}
                        style={s.loadingSection}
                    >
                        {/* Tip */}
                        <MotiView
                            key={tipIndex}
                            from={{ opacity: 0, translateX: 20 }}
                            animate={{ opacity: 0.85, translateX: 0 }}
                            transition={{ type: "timing", duration: 300 }}
                        >
                            <Text style={s.tip}>{LOADING_TIPS[tipIndex]}</Text>
                        </MotiView>

                        {/* Progress bar */}
                        <View style={s.barTrack}>
                            <MotiView
                                animate={{ width: barWidth }}
                                transition={{ type: "timing", duration: 200 }}
                                style={s.barFill}
                            />
                        </View>

                        <Text style={s.percent}>
                            {loaded ? "Ready!" : `Loading assets… ${Math.round(progress * 100)}%`}
                        </Text>
                    </MotiView>

                    {/* Character art at bottom-right */}
                    <MotiView
                        from={{ opacity: 0, translateX: 60, scale: 0.85 }}
                        animate={{ opacity: 1, translateX: 0, scale: 1 }}
                        transition={{ type: "spring", delay: 400, damping: 14 }}
                        style={s.characterWrap}
                        pointerEvents="none"
                    >
                        <Image
                            source={require("../../public/UI_Assets/New Assets/Dara Folding Arms.png")}
                            resizeMode="contain"
                            style={s.character}
                        />
                    </MotiView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

/* ================================================================
   Styles
   ================================================================ */
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0E18" },
    bg: { flex: 1 },
    bgImage: { resizeMode: "cover", opacity: 0.55 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(8, 12, 26, 0.58)",
    },
    safe: { flex: 1 },
    spacer: { flex: 1.2 },

    /* Branding */
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

    /* Loading */
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

    /* Character */
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
