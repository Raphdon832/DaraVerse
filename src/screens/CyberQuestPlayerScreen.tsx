import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../components/BackButton";
import EmojiBurst from "../components/EmojiBurst";
import { trackSound, untrackAndUnloadSound } from "../audio/audioManager";
import { useAppState } from "../context/AppStateContext";
import {
    getCyberQuestMissionScript,
    getNextCyberQuestMissionId,
    getNode,
    getTotalNodeCount,
} from "../data/cyberquestMission";
import type {
    StoryNode,
    SortItem,
    MatchPair,
} from "../data/cyberquestMission";
import { getCyberQuestSceneVisual } from "../data/cyberquestVisuals";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MissionResumeState } from "../types/models";
import type { MissionsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MissionsStackParamList, "CyberQuestPlayer">;

const { width: SCREEN_W } = Dimensions.get("window");

/* ================================================================
   Character avatar config
   ================================================================ */
const CHARACTER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    dara: { bg: "#6C5CE7", text: "#fff", icon: "💜" },
    amina: { bg: "#00B894", text: "#fff", icon: "💚" },
    teacher: { bg: "#0984E3", text: "#fff", icon: "📘" },
    system: { bg: "#D63031", text: "#fff", icon: "⚠️" },
    narrator: { bg: "#636E72", text: "#fff", icon: "📖" },
    student: { bg: "#FDCB6E", text: "#2D3436", icon: "🗣️" },
};

const SCENE_TINTS: Record<string, string> = {
    alert: "#FFF0F0",
    investigation: "#F0F4FF",
    email: "#FFFDF0",
    logs: "#F0FFF4",
    tension: "#FFF5F0",
    secure: "#F0FFFC",
};
const GAMEPLAY_AUDIO = require("../../assets/Sounds/Dara and the CyberQuest Audio Assets/Dara_MainGameplay.mp3");

/* ================================================================
   Main Screen
   ================================================================ */
export default function CyberQuestPlayerScreen({ navigation, route }: Props) {
    const { missionId } = route.params;
    const missionScript = getCyberQuestMissionScript(missionId);
    const { completeMission, saveReflection, saveMissionResumeState, startMission, state } = useAppState();
    const scrollRef = useRef<ScrollView>(null);
    const gameplaySoundRef = useRef<Audio.Sound | null>(null);
    const alertPulseTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
    const checkpointEnabledRef = useRef(true);
    const lastCheckpointSignatureRef = useRef("");
    const initialResumeRef = useRef<MissionResumeState | null>(
        state.missionProgress[missionId]?.status === "in_progress"
            ? state.missionProgress[missionId]?.resumeState ?? null
            : null,
    );
    const [nodeId, setNodeId] = useState(
        initialResumeRef.current?.nodeId ?? missionScript.startNodeId,
    );
    const [history, setHistory] = useState<string[]>(
        initialResumeRef.current?.history ?? [],
    );
    const [totalScore, setTotalScore] = useState(
        initialResumeRef.current?.totalScore ?? 0,
    );
    const [visitedCount, setVisitedCount] = useState(
        initialResumeRef.current?.visitedCount ?? 1,
    );
    const [reflectionText, setReflectionText] = useState(
        initialResumeRef.current?.reflectionText ?? "",
    );

    // Mini-game sort state
    const [sortedItems, setSortedItems] = useState<Record<string, "safe" | "risky">>(
        initialResumeRef.current?.sortedItems ?? {},
    );
    const [sortSubmitted, setSortSubmitted] = useState(
        initialResumeRef.current?.sortSubmitted ?? false,
    );

    // Mini-game match state
    const [matchedPairs, setMatchedPairs] = useState<Set<string>>(
        new Set(initialResumeRef.current?.matchedPairIds ?? []),
    );
    const [selectedLeft, setSelectedLeft] = useState<string | null>(
        initialResumeRef.current?.selectedLeft ?? null,
    );
    const [matchSubmitted, setMatchSubmitted] = useState(
        initialResumeRef.current?.matchSubmitted ?? false,
    );

    const node = getNode(nodeId, missionId);
    const totalNodes = getTotalNodeCount(missionId);
    const progress = Math.min(visitedCount / totalNodes, 1);
    const missionStatus = state.missionProgress[missionId]?.status ?? "new";
    const nextCyberQuestMissionId = useMemo(
        () => getNextCyberQuestMissionId(missionId),
        [missionId],
    );

    // Stable press animation — hoisted to top level so hook count is constant
    const pressScale = useMemo(() => ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return { scale: pressed ? 0.96 : 1 };
    }, []);

    const pressScaleChoice = useMemo(() => ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return { scale: pressed ? 0.97 : 1, opacity: pressed ? 0.8 : 1 };
    }, []);

    // Shuffled right column for match mini-game — always called (stable hook order)
    const matchPairs = node?.type === "minigame_match" ? (node as any).pairs : [];
    const shuffledRight = useMemo(() => {
        const arr = matchPairs.map((p: MatchPair) => ({ id: p.id, right: p.right }));
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [matchPairs]);

    const stopGameplayAudio = useCallback(async () => {
        if (!gameplaySoundRef.current) return;
        await untrackAndUnloadSound(gameplaySoundRef.current);
        gameplaySoundRef.current = null;
    }, []);

    const exitMissionScreen = useCallback(() => {
        void stopGameplayAudio();
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }
        navigation.navigate("MissionDetail", { missionId });
    }, [missionId, navigation, stopGameplayAudio]);

    const clearAlertPulseTimeouts = useCallback(() => {
        alertPulseTimeoutsRef.current.forEach((timerId) => clearTimeout(timerId));
        alertPulseTimeoutsRef.current = [];
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadGameplayLoop = async () => {
            await stopGameplayAudio();
            if (cancelled || !state.settings.soundEnabled) return;

            try {
                const { sound } = await Audio.Sound.createAsync(GAMEPLAY_AUDIO, {
                    shouldPlay: true,
                    isLooping: true,
                    volume: 0.6,
                });
                if (cancelled) {
                    await untrackAndUnloadSound(sound);
                    return;
                }
                trackSound(sound);
                gameplaySoundRef.current = sound;
            } catch {
                // Keep mission playable if audio fails to load.
            }
        };

        void loadGameplayLoop();
        return () => {
            cancelled = true;
            void stopGameplayAudio();
        };
    }, [state.settings.soundEnabled, stopGameplayAudio]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("blur", () => {
            void stopGameplayAudio();
            clearAlertPulseTimeouts();
        });
        return unsubscribe;
    }, [navigation, clearAlertPulseTimeouts, stopGameplayAudio]);

    const checkpointSnapshot = useMemo<Omit<MissionResumeState, "updatedAtIso">>(
        () => ({
            nodeId,
            history,
            totalScore,
            visitedCount,
            reflectionText,
            sortedItems,
            sortSubmitted,
            matchedPairIds: Array.from(matchedPairs).sort(),
            selectedLeft,
            matchSubmitted,
        }),
        [
            nodeId,
            history,
            totalScore,
            visitedCount,
            reflectionText,
            sortedItems,
            sortSubmitted,
            matchedPairs,
            selectedLeft,
            matchSubmitted,
        ],
    );

    const checkpointSignature = useMemo(
        () => JSON.stringify(checkpointSnapshot),
        [checkpointSnapshot],
    );

    useEffect(() => {
        if (lastCheckpointSignatureRef.current.length > 0) return;
        lastCheckpointSignatureRef.current = checkpointSignature;
    }, [checkpointSignature]);

    useEffect(() => {
        checkpointEnabledRef.current = missionStatus !== "completed";
    }, [missionStatus]);

    useEffect(() => {
        if (!checkpointEnabledRef.current) return;
        if (checkpointSignature === lastCheckpointSignatureRef.current) return;

        const timerId = setTimeout(() => {
            if (!checkpointEnabledRef.current) return;
            saveMissionResumeState({
                missionId,
                resumeState: {
                    ...checkpointSnapshot,
                    updatedAtIso: new Date().toISOString(),
                },
            });
            lastCheckpointSignatureRef.current = checkpointSignature;
        }, 450);

        return () => clearTimeout(timerId);
    }, [checkpointSignature, checkpointSnapshot, missionId, saveMissionResumeState]);

    const goToNode = useCallback(
        (nextId: string, pointsEarned = 0) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setHistory((h) => [...h, nodeId]);
            setNodeId(nextId);
            setTotalScore((s) => s + pointsEarned);
            setVisitedCount((c) => c + 1);
            // reset mini-game state for next potential game
            setSortedItems({});
            setSortSubmitted(false);
            setMatchedPairs(new Set());
            setSelectedLeft(null);
            setMatchSubmitted(false);
            setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
        },
        [nodeId]
    );

    /* ================================================================
       Haptic feedback per node type — fires on every node change
       ================================================================ */
    useEffect(() => {
        if (!node) return;
        switch (node.type) {
            case "dialogue":
                if (node.character === "system") {
                    if (node.id !== "system-alert") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 120);
                    }
                } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                break;
            case "narration":
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case "choice":
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case "feedback":
                if (node.isCorrect) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
                break;
            case "badge":
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
                break;
            case "cliffhanger":
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case "minigame_sort":
            case "minigame_match":
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            default:
                break;
        }
    }, [nodeId]);

    useEffect(() => {
        clearAlertPulseTimeouts();
        if (nodeId !== "system-alert" || !state.settings.hapticEnabled) return;

        const pulseScheduleMs = [0, 180, 360, 540, 720];
        pulseScheduleMs.forEach((delayMs, index) => {
            const timerId = setTimeout(() => {
                const style =
                    index % 2 === 0
                        ? Haptics.ImpactFeedbackStyle.Heavy
                        : Haptics.ImpactFeedbackStyle.Medium;
                void Haptics.impactAsync(style);
            }, delayMs);
            alertPulseTimeoutsRef.current.push(timerId);
        });

        return clearAlertPulseTimeouts;
    }, [nodeId, state.settings.hapticEnabled, clearAlertPulseTimeouts]);

    if (!node) {
        return (
            <SafeAreaView style={s.safeArea}>
                <Text style={s.errorText}>Node not found: {nodeId}</Text>
            </SafeAreaView>
        );
    }
    const sceneVisual = getCyberQuestSceneVisual(node);
    const isSystemAlert = node.type === "dialogue" && node.character === "system";

    /* Emoji burst config — only for dialogue nodes with expressive moods */
    const burstConfig = useMemo(() => {
        if (!node || node.type !== "dialogue" || !node.mood || node.mood === "neutral") return null;
        const MOOD_MAP: Record<string, { emoji: string; direction: "up" | "down" }> = {
            worried: { emoji: "😟", direction: "up" },
            excited: { emoji: "😄", direction: "up" },
            confident: { emoji: "😊", direction: "up" },
            scared: { emoji: "😨", direction: "up" },
            thinking: { emoji: "🤔", direction: "down" },
        };
        return MOOD_MAP[node.mood] ?? null;
    }, [nodeId]);

    /* ================================================================
       Render helpers for each node type
       ================================================================ */

    function renderDialogue(n: Extract<StoryNode, { type: "dialogue" }>) {
        const charConfig = CHARACTER_COLORS[n.character] ?? CHARACTER_COLORS.narrator;
        const isSystem = n.character === "system";
        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 200 }}
            >
                {/* Character tag — staggered fade */}
                <MotiView
                    from={{ opacity: 0, translateX: -16 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 180, delay: 80 }}
                >
                    <View style={[s.charTag, { backgroundColor: charConfig.bg }]}>
                        <Text style={s.charIcon}>{charConfig.icon}</Text>
                        <Text style={[s.charName, { color: charConfig.text }]}>{n.characterName}</Text>
                        {n.mood && n.mood !== "neutral" && (
                            <Text style={s.moodBadge}>
                                {n.mood === "worried" ? "😟" : n.mood === "excited" ? "😄" : n.mood === "thinking" ? "🤔" : n.mood === "confident" ? "😊" : n.mood === "scared" ? "😨" : ""}
                            </Text>
                        )}
                    </View>
                </MotiView>

                {/* Ambient glow behind bubble */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ type: "timing", duration: 600, delay: 200 }}
                    style={[s.bubbleGlow, isSystem && s.bubbleGlowAlert]}
                />

                {/* Speech bubble — staggered reveal */}
                <MotiView
                    from={{ opacity: 0, translateY: 18, scale: 0.96 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 18, stiffness: 160, delay: 200 }}
                >
                    <View style={s.bubbleWrap}>
                        <View style={[s.bubble, isSystem && s.systemBubble]}>
                            <Text style={[s.bubbleText, isSystem && s.systemText]}>{n.text}</Text>
                        </View>
                        <View style={[s.bubbleTail, isSystem && s.systemBubbleTail]} />
                    </View>
                </MotiView>

                {/* Continue button — slides in last */}
                <MotiView
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", damping: 20, delay: 500 }}
                >
                    <MotiPressable
                        onPress={() => goToNode(n.next)}
                        animate={pressScale}
                        style={s.continueBtn}
                    >
                        <Text style={s.continueBtnText}>Continue</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </MotiPressable>
                </MotiView>
            </MotiView>
        );
    }

    function renderNarration(n: Extract<StoryNode, { type: "narration" }>) {
        const tint = n.sceneHint ? SCENE_TINTS[n.sceneHint] ?? colors.bgSurface : colors.bgSurface;
        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 500 }}
            >
                {/* Narration card — cinematic slow fade */}
                <MotiView
                    from={{ opacity: 0, scale: 0.94, translateY: 12 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: "spring", damping: 22, stiffness: 140, delay: 150 }}
                >
                    <View style={[s.narrationCard, { backgroundColor: tint }]}>
                        <Ionicons name="book-outline" size={22} color={colors.textSecondary} style={{ marginBottom: spacing.xs }} />
                        <Text style={s.narrationText}>{n.text}</Text>
                    </View>
                </MotiView>
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", damping: 20, delay: 450 }}
                >
                    <MotiPressable
                        onPress={() => goToNode(n.next)}
                        animate={pressScale}
                        style={s.continueBtn}
                    >
                        <Text style={s.continueBtnText}>Continue</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </MotiPressable>
                </MotiView>
            </MotiView>
        );
    }

    function renderChoice(n: Extract<StoryNode, { type: "choice" }>) {
        const charConfig = CHARACTER_COLORS[n.character] ?? CHARACTER_COLORS.narrator;
        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 200 }}
            >
                {/* Character tag */}
                <MotiView
                    from={{ opacity: 0, translateX: -16 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 180, delay: 80 }}
                >
                    <View style={[s.charTag, { backgroundColor: charConfig.bg }]}>
                        <Text style={s.charIcon}>{charConfig.icon}</Text>
                        <Text style={[s.charName, { color: charConfig.text }]}>{n.characterName}</Text>
                    </View>
                </MotiView>

                {/* Prompt bubble */}
                <MotiView
                    from={{ opacity: 0, translateY: 14, scale: 0.96 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 18, stiffness: 160, delay: 200 }}
                >
                    <View style={s.bubbleWrap}>
                        <View style={s.choicePromptCard}>
                            <Text style={s.choicePrompt}>{n.prompt}</Text>
                        </View>
                        <View style={s.choicePromptTail} />
                    </View>
                </MotiView>

                {/* Pulsing glow behind choices */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    transition={{ type: "timing", duration: 600, delay: 350 }}
                    style={s.choiceGlow}
                />

                <MotiView
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 380 }}
                >
                    <Text style={s.choiceLabel}>Choose your response:</Text>
                </MotiView>
                {n.options.map((opt, idx) => (
                    <MotiPressable
                        key={opt.id}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            goToNode(opt.next, opt.points);
                        }}
                        animate={pressScaleChoice}
                        style={s.choiceOption}
                    >
                        <MotiView
                            from={{ opacity: 0, translateX: -24 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: "spring", damping: 16, stiffness: 140, delay: 420 + idx * 140 }}
                            style={s.choiceOptionInner}
                        >
                            <View style={s.choiceLetter}>
                                <Text style={s.choiceLetterText}>
                                    {String.fromCharCode(65 + idx)}
                                </Text>
                            </View>
                            <Text style={s.choiceOptionText}>{opt.text}</Text>
                        </MotiView>
                    </MotiPressable>
                ))}
            </MotiView>
        );
    }

    function renderFeedback(n: Extract<StoryNode, { type: "feedback" }>) {
        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 200 }}
            >
                {/* Result glow */}
                <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.45, scale: 1 }}
                    transition={{ type: "timing", duration: 500 }}
                    style={[s.feedbackGlow, n.isCorrect ? s.feedbackGlowCorrect : s.feedbackGlowWrong]}
                />

                <MotiView
                    from={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 16, stiffness: 140, delay: 120 }}
                >
                    <View style={[s.feedbackCard, n.isCorrect ? s.feedbackCorrect : s.feedbackWrong]}>
                        <MotiView
                            from={{ scale: 0, rotate: "-30deg" }}
                            animate={{ scale: 1, rotate: "0deg" }}
                            transition={{ type: "spring", damping: 10, delay: 300 }}
                        >
                            <Text style={s.feedbackIcon}>{n.isCorrect ? "✅" : "⚡"}</Text>
                        </MotiView>
                        <Text style={s.feedbackTitle}>{n.title}</Text>
                        <Text style={s.feedbackText}>{n.text}</Text>
                        {n.learningSummary ? (
                            <MotiView
                                from={{ opacity: 0, translateY: 8 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: "spring", delay: 500 }}
                            >
                                <View style={s.learningBox}>
                                    <Ionicons name="bulb-outline" size={16} color="#FDCB6E" />
                                    <Text style={s.learningText}>{n.learningSummary}</Text>
                                </View>
                            </MotiView>
                        ) : null}
                    </View>
                </MotiView>
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", damping: 20, delay: 500 }}
                >
                    <MotiPressable
                        onPress={() => goToNode(n.next)}
                        animate={pressScale}
                        style={s.continueBtn}
                    >
                        <Text style={s.continueBtnText}>Continue</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </MotiPressable>
                </MotiView>
            </MotiView>
        );
    }

    function renderMinigameSort(n: Extract<StoryNode, { type: "minigame_sort" }>) {
        const allSorted = n.items.every((item) => sortedItems[item.id] != null);
        const scoreSort = () => {
            let correct = 0;
            n.items.forEach((item) => {
                if (sortedItems[item.id] === item.category) correct++;
            });
            setSortSubmitted(true);
            const pts = Math.round((correct / n.items.length) * 60);
            setTotalScore((s) => s + pts);
        };

        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 18 }}
            >
                <View style={s.gameCard}>
                    <Text style={s.gameTitle}>🎮 {n.title}</Text>
                    <Text style={s.gameInstruction}>{n.instruction}</Text>

                    {n.items.map((item: SortItem) => {
                        const picked = sortedItems[item.id];
                        const isCorrectPick = sortSubmitted && picked === item.category;
                        const isWrongPick = sortSubmitted && picked != null && picked !== item.category;
                        return (
                            <View key={item.id} style={s.sortRow}>
                                <Text style={[s.sortLabel, isCorrectPick && s.sortCorrect, isWrongPick && s.sortWrong]}>
                                    {item.label}
                                </Text>
                                <View style={s.sortBtns}>
                                    <MotiPressable
                                        onPress={() => !sortSubmitted && setSortedItems((p) => ({ ...p, [item.id]: "safe" }))}
                                        style={[s.sortCat, picked === "safe" && s.sortCatActive, picked === "safe" && { backgroundColor: "#00B894" }]}
                                    >
                                        <Text style={[s.sortCatText, picked === "safe" && { color: "#fff" }]}>Safe</Text>
                                    </MotiPressable>
                                    <MotiPressable
                                        onPress={() => !sortSubmitted && setSortedItems((p) => ({ ...p, [item.id]: "risky" }))}
                                        style={[s.sortCat, picked === "risky" && s.sortCatActive, picked === "risky" && { backgroundColor: "#D63031" }]}
                                    >
                                        <Text style={[s.sortCatText, picked === "risky" && { color: "#fff" }]}>Risky</Text>
                                    </MotiPressable>
                                </View>
                            </View>
                        );
                    })}

                    {!sortSubmitted ? (
                        <MotiPressable
                            onPress={allSorted ? scoreSort : undefined}
                            style={[s.gameSubmitBtn, !allSorted && s.gameSubmitDisabled]}
                        >
                            <Text style={s.gameSubmitText}>Check Answers</Text>
                        </MotiPressable>
                    ) : (
                        <MotiPressable onPress={() => goToNode(n.next)} style={s.continueBtn}>
                            <Text style={s.continueBtnText}>Continue</Text>
                            <Ionicons name="chevron-forward" size={18} color="#fff" />
                        </MotiPressable>
                    )}
                </View>
            </MotiView>
        );
    }

    function renderMinigameMatch(n: Extract<StoryNode, { type: "minigame_match" }>) {
        const allMatched = matchedPairs.size === n.pairs.length;

        function handleLeftTap(pairId: string) {
            if (matchSubmitted) return;
            setSelectedLeft(pairId);
        }

        function handleRightTap(pairId: string) {
            if (matchSubmitted || !selectedLeft) return;
            if (selectedLeft === pairId) {
                setMatchedPairs((prev) => new Set(prev).add(pairId));
                setSelectedLeft(null);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                setSelectedLeft(null);
            }
        }

        const finishMatch = () => {
            setMatchSubmitted(true);
            setTotalScore((s) => s + 50);
        };

        // shuffledRight is hoisted to the component top level

        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 18 }}
            >
                <View style={s.gameCard}>
                    <Text style={s.gameTitle}>🧩 {n.title}</Text>
                    <Text style={s.gameInstruction}>{n.instruction}</Text>

                    <View style={s.matchColumns}>
                        <View style={s.matchCol}>
                            {n.pairs.map((p: MatchPair) => (
                                <MotiPressable
                                    key={p.id}
                                    onPress={() => handleLeftTap(p.id)}
                                    style={[
                                        s.matchItem,
                                        selectedLeft === p.id && s.matchSelected,
                                        matchedPairs.has(p.id) && s.matchDone,
                                    ]}
                                >
                                    <Text style={s.matchText}>{p.left}</Text>
                                </MotiPressable>
                            ))}
                        </View>
                        <View style={s.matchCol}>
                            {shuffledRight.map((r: { id: string; right: string }) => (
                                <MotiPressable
                                    key={r.id}
                                    onPress={() => handleRightTap(r.id)}
                                    style={[
                                        s.matchItem,
                                        s.matchRight,
                                        matchedPairs.has(r.id) && s.matchDone,
                                    ]}
                                >
                                    <Text style={s.matchText}>{r.right}</Text>
                                </MotiPressable>
                            ))}
                        </View>
                    </View>

                    {!matchSubmitted ? (
                        <MotiPressable
                            onPress={allMatched ? finishMatch : undefined}
                            style={[s.gameSubmitBtn, !allMatched && s.gameSubmitDisabled]}
                        >
                            <Text style={s.gameSubmitText}>{allMatched ? "Submit" : "Match all pairs"}</Text>
                        </MotiPressable>
                    ) : (
                        <MotiPressable onPress={() => goToNode(n.next)} style={s.continueBtn}>
                            <Text style={s.continueBtnText}>Continue</Text>
                            <Ionicons name="chevron-forward" size={18} color="#fff" />
                        </MotiPressable>
                    )}
                </View>
            </MotiView>
        );
    }

    function renderReflection(n: Extract<StoryNode, { type: "reflection" }>) {
        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 18 }}
            >
                <View style={s.reflectionCard}>
                    <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.ctaPrimary} />
                    <Text style={s.reflectionTitle}>Reflection Time</Text>
                    <Text style={s.reflectionPrompt}>{n.prompt}</Text>
                    <TextInput
                        style={s.reflectionInput}
                        placeholder="Type your thoughts here…"
                        placeholderTextColor={colors.textSecondary}
                        value={reflectionText}
                        onChangeText={setReflectionText}
                        multiline
                        textAlignVertical="top"
                    />
                    <MotiPressable
                        onPress={() => {
                            if (reflectionText.trim().length > 0) {
                                saveReflection({ missionId, reflection: reflectionText.trim() });
                            }
                            goToNode(n.next);
                        }}
                        style={[s.continueBtn, reflectionText.trim().length === 0 && { opacity: 0.7 }]}
                    >
                        <Text style={s.continueBtnText}>
                            {reflectionText.trim().length > 0 ? "Submit & Continue" : "Skip"}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </MotiPressable>
                </View>
            </MotiView>
        );
    }

    function renderBadge(n: Extract<StoryNode, { type: "badge" }>) {
        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 100 }}
            >
                <View style={s.badgeCard}>
                    <MotiView
                        from={{ scale: 0, rotate: "-45deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        transition={{ type: "spring", delay: 300, damping: 12 }}
                    >
                        <Text style={s.badgeEmoji}>†</Text>
                    </MotiView>
                    <Text style={s.badgeTitle}>Badge Unlocked!</Text>
                    <Text style={s.badgeName}>{n.badgeName}</Text>
                    <Text style={s.badgeMessage}>{n.message}</Text>
                    <View style={s.xpBadge}>
                        <Text style={s.xpText}>+{n.xp} XP</Text>
                    </View>
                </View>
                <MotiPressable
                    onPress={() => {
                        checkpointEnabledRef.current = false;
                        saveMissionResumeState({ missionId, resumeState: null });
                        completeMission({ missionId, score: totalScore });
                        goToNode(n.next);
                    }}
                    style={s.continueBtn}
                >
                    <Text style={s.continueBtnText}>Continue</Text>
                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                </MotiPressable>
            </MotiView>
        );
    }

    function renderCliffhanger(n: Extract<StoryNode, { type: "cliffhanger" }>) {
        return (
            <MotiView
                key={n.id}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 800 }}
            >
                <View style={s.cliffCard}>
                    <Text style={s.cliffText}>{n.text}</Text>
                    {n.teaserTitle ? (
                        <MotiView
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: "spring", delay: 600 }}
                        >
                            <Text style={s.cliffTeaser}>🔓 {n.teaserTitle}</Text>
                        </MotiView>
                    ) : null}
                </View>

                <MotiPressable
                    onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        exitMissionScreen();
                    }}
                    animate={pressScale}
                    style={s.finishBtn}
                >
                    <Text style={s.finishBtnText}>Finish Mission</Text>
                    <Ionicons name="trophy" size={20} color="#fff" />
                </MotiPressable>

                {nextCyberQuestMissionId ? (
                    <MotiPressable
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            startMission(nextCyberQuestMissionId);
                            navigation.navigate("CyberQuestSplash", {
                                missionId: nextCyberQuestMissionId,
                            });
                        }}
                        animate={pressScale}
                        style={s.nextMissionBtn}
                    >
                        <Text style={s.nextMissionBtnText}>Start Next Mission</Text>
                        <Ionicons name="rocket" size={18} color="#fff" />
                    </MotiPressable>
                ) : null}

                <View style={s.scoreRow}>
                    <Text style={s.scoreLabel}>Your Score</Text>
                    <Text style={s.scoreValue}>{totalScore} pts</Text>
                </View>
            </MotiView>
        );
    }

    function renderNode() {
        if (!node) return null;
        switch (node.type) {
            case "dialogue":
                return renderDialogue(node);
            case "narration":
                return renderNarration(node);
            case "choice":
                return renderChoice(node);
            case "feedback":
                return renderFeedback(node);
            case "minigame_sort":
                return renderMinigameSort(node);
            case "minigame_match":
                return renderMinigameMatch(node);
            case "reflection":
                return renderReflection(node);
            case "badge":
                return renderBadge(node);
            case "cliffhanger":
                return renderCliffhanger(node);
            default:
                return <Text style={s.errorText}>Unknown node type</Text>;
        }
    }

    /* ================================================================
       Main Render
       ================================================================ */
    return (
        <SafeAreaView edges={["top"]} style={s.safeArea}>
            <ImageBackground
                source={sceneVisual.background}
                style={s.sceneScreenBackground}
                imageStyle={s.sceneScreenImage}
            >
                <View style={[s.sceneScreenOverlay, { backgroundColor: sceneVisual.overlayTint ?? "rgba(8, 14, 24, 0.28)" }]} />

                {/* System alert screen-edge flash */}
                {isSystemAlert && (
                    <MotiView
                        from={{ opacity: 0.6 }}
                        animate={{ opacity: 0 }}
                        transition={{ type: "timing", duration: 700 }}
                        style={s.alertFlash}
                    />
                )}

                {/* iMessage-style emoji burst */}
                {burstConfig && (
                    <EmojiBurst
                        key={nodeId + "-burst"}
                        emoji={burstConfig.emoji}
                        direction={burstConfig.direction}
                    />
                )}

                {/* Character with entrance animation */}
                <MotiView
                    key={nodeId + "-char"}
                    from={{ opacity: 0, translateX: 40, scale: 0.92 }}
                    animate={{ opacity: 1, translateX: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 16, stiffness: 120, delay: 60 }}
                    pointerEvents="none"
                    style={s.stageCharacterWrap}
                >
                    <Image
                        source={sceneVisual.foreground}
                        resizeMode="contain"
                        style={s.stageCharacter}
                    />
                </MotiView>

                {/* Top bar */}
                <View style={s.topBar}>
                    <BackButton
                        accessibilityLabel="Leave mission"
                        onPress={exitMissionScreen}
                    />
                    <View style={s.topBarCenter}>
                        <Text style={s.topBarTitle} numberOfLines={1}>
                            {missionScript.subtitle}
                        </Text>
                        <View style={s.progressTrack}>
                            <MotiView
                                animate={{ width: Math.round(progress * (SCREEN_W - spacing.md * 2 - 100)) }}
                                transition={{ type: "timing", duration: 400 }}
                                style={s.progressFill}
                            />
                        </View>
                    </View>
                    <View style={s.scoreChip}>
                        <Ionicons name="star" size={14} color="#FDCB6E" />
                        <Text style={s.scoreChipText}>{totalScore}</Text>
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={s.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <MotiView
                        key={nodeId + "-cap"}
                        from={{ opacity: 0, translateY: 14 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "timing", duration: 250 }}
                        style={s.sceneHeaderChip}
                    >
                        <Text style={s.sceneCaptionText}>{sceneVisual.caption}</Text>
                    </MotiView>
                    {renderNode()}
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
}

/* ================================================================
   Styles
   ================================================================ */
const s = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0E1728",
    },
    sceneScreenBackground: {
        flex: 1,
    },
    sceneScreenImage: {
        resizeMode: "cover",
    },
    sceneScreenOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    stageCharacterWrap: {
        bottom: 0,
        position: "absolute",
        right: -18,
        zIndex: 1,
    },
    stageCharacter: {
        height: 360,
        width: 250,
    },
    errorText: {
        color: "#D63031",
        fontSize: 16,
        textAlign: "center",
        padding: spacing.xl,
    },

    /* Immersion: screen-edge alert flash */
    alertFlash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(214, 48, 49, 0.35)",
        zIndex: 10,
        pointerEvents: "none" as const,
    },

    /* Immersion: ambient glow behind speech bubbles */
    bubbleGlow: {
        position: "absolute" as const,
        top: 30,
        left: -8,
        width: 200,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(108, 92, 231, 0.18)",
    },
    bubbleGlowAlert: {
        backgroundColor: "rgba(214, 48, 49, 0.22)",
    },

    /* Immersion: glow behind choice buttons */
    choiceGlow: {
        alignSelf: "center" as const,
        width: "90%" as any,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(108, 92, 231, 0.3)",
        marginBottom: spacing.xs,
    },

    /* Immersion: glow behind feedback cards */
    feedbackGlow: {
        position: "absolute" as const,
        top: -6,
        left: -6,
        right: -6,
        bottom: -6,
        borderRadius: radius.lg + 6,
    },
    feedbackGlowCorrect: {
        backgroundColor: "rgba(0, 184, 148, 0.20)",
    },
    feedbackGlowWrong: {
        backgroundColor: "rgba(214, 48, 49, 0.18)",
    },

    /* Top bar */
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        zIndex: 5,
    },
    topBarCenter: { flex: 1 },
    topBarTitle: {
        fontSize: typography.body,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
        textShadowColor: "rgba(0,0,0,0.45)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    progressTrack: {
        height: 5,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.3)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
        backgroundColor: colors.ctaPrimary,
    },
    scoreChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 248, 225, 0.94)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        gap: 4,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.65)",
    },
    scoreChipText: {
        fontWeight: "800",
        fontSize: 13,
        color: "#F57F17",
    },

    /* Content */
    content: {
        padding: spacing.md,
        paddingBottom: 280,
        zIndex: 3,
    },
    sceneHeaderChip: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        borderRadius: radius.pill,
        borderWidth: 2,
        borderColor: "#1E1E1E",
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    sceneCaptionText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "capitalize",
        letterSpacing: 0.4,
    },

    /* Character tag */
    charTag: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.pill,
        marginBottom: spacing.xs,
        gap: 6,
    },
    charIcon: { fontSize: 16 },
    charName: {
        fontWeight: "700",
        fontSize: 13,
        letterSpacing: 0.3,
    },
    moodBadge: { fontSize: 14 },

    /* Speech bubble */
    bubbleWrap: {
        alignSelf: "flex-start",
        marginBottom: spacing.sm,
        maxWidth: "78%",
    },
    bubble: {
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 2.5,
        borderColor: "#1D1D1D",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        minHeight: 72,
        ...shadow.card,
    },
    bubbleTail: {
        backgroundColor: "#fff",
        borderBottomWidth: 2.5,
        borderColor: "#1D1D1D",
        borderRightWidth: 2.5,
        bottom: -8,
        height: 18,
        left: 28,
        position: "absolute",
        transform: [{ rotate: "45deg" }],
        width: 18,
    },
    systemBubble: {
        backgroundColor: "#2D3436",
        borderColor: "#121212",
    },
    systemBubbleTail: {
        backgroundColor: "#2D3436",
        borderColor: "#121212",
    },
    bubbleText: {
        fontSize: typography.body,
        color: colors.textPrimary,
        lineHeight: 22,
        fontWeight: "600",
    },
    systemText: {
        color: "#FF7675",
        fontWeight: "700",
        fontFamily: "monospace",
        letterSpacing: 0.5,
    },

    /* Narration */
    narrationCard: {
        borderRadius: 22,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.85)",
        backgroundColor: "rgba(255,255,255,0.88)",
    },
    narrationText: {
        fontSize: typography.body,
        color: colors.textSecondary,
        fontStyle: "italic",
        lineHeight: 22,
    },

    /* Continue button */
    continueBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.ctaPrimary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: radius.pill,
        alignSelf: "flex-end",
        gap: 6,
        marginTop: spacing.sm,
        ...shadow.card,
    },
    continueBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },

    /* Choices */
    choicePromptCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 2.5,
        borderColor: "#1D1D1D",
        padding: spacing.md,
        minHeight: 72,
        ...shadow.card,
    },
    choicePromptTail: {
        backgroundColor: "#fff",
        borderBottomWidth: 2.5,
        borderColor: "#1D1D1D",
        borderRightWidth: 2.5,
        bottom: -8,
        height: 18,
        left: 24,
        position: "absolute",
        transform: [{ rotate: "45deg" }],
        width: 18,
    },
    choicePrompt: {
        fontSize: typography.body,
        color: colors.textPrimary,
        fontWeight: "600",
        lineHeight: 22,
    },
    choiceLabel: {
        fontSize: typography.caption,
        color: colors.textSecondary,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    choiceOption: {
        marginBottom: spacing.sm,
    },
    choiceOptionInner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1.5,
        borderColor: "#E0E5EC",
        gap: 12,
    },
    choiceLetter: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.ctaPrimary,
        justifyContent: "center",
        alignItems: "center",
    },
    choiceLetterText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 14,
    },
    choiceOptionText: {
        fontSize: typography.body,
        color: colors.textPrimary,
        flex: 1,
        lineHeight: 20,
    },

    /* Feedback */
    feedbackCard: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        ...shadow.card,
    },
    feedbackCorrect: {
        backgroundColor: "#E8F8F0",
        borderLeftWidth: 4,
        borderLeftColor: "#00B894",
    },
    feedbackWrong: {
        backgroundColor: "#FFF3E0",
        borderLeftWidth: 4,
        borderLeftColor: "#FDCB6E",
    },
    feedbackIcon: { fontSize: 28, marginBottom: spacing.xs },
    feedbackTitle: {
        fontWeight: "800",
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    feedbackText: {
        fontSize: typography.body,
        color: colors.textPrimary,
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    learningBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "rgba(0,0,0,0.04)",
        borderRadius: radius.sm,
        padding: spacing.sm,
        gap: 8,
    },
    learningText: {
        fontSize: typography.caption,
        flex: 1,
        color: colors.textPrimary,
        fontWeight: "600",
        lineHeight: 18,
    },

    /* Mini-games shared */
    gameCard: {
        backgroundColor: "#fff",
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadow.card,
    },
    gameTitle: {
        fontWeight: "800",
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    gameInstruction: {
        fontSize: typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    gameSubmitBtn: {
        backgroundColor: colors.ctaPrimary,
        paddingVertical: 14,
        borderRadius: radius.pill,
        alignItems: "center",
        marginTop: spacing.md,
    },
    gameSubmitDisabled: { opacity: 0.4 },
    gameSubmitText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },

    /* Sort game */
    sortRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E0E5EC",
    },
    sortLabel: {
        flex: 1,
        fontSize: 13,
        color: colors.textPrimary,
        lineHeight: 18,
        paddingRight: 8,
    },
    sortCorrect: { color: "#00B894", fontWeight: "700" },
    sortWrong: { color: "#D63031", fontWeight: "700" },
    sortBtns: { flexDirection: "row", gap: 6 },
    sortCat: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: "#E0E5EC",
    },
    sortCatActive: { borderColor: "transparent" },
    sortCatText: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.textSecondary,
    },

    /* Match game */
    matchColumns: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    matchCol: { flex: 1, gap: spacing.xs },
    matchItem: {
        backgroundColor: "#F0F4FF",
        borderRadius: radius.sm,
        padding: 10,
        borderWidth: 2,
        borderColor: "transparent",
    },
    matchRight: { backgroundColor: "#FFF8E1" },
    matchSelected: { borderColor: colors.ctaPrimary },
    matchDone: { borderColor: "#00B894", opacity: 0.6 },
    matchText: {
        fontSize: 12,
        color: colors.textPrimary,
        fontWeight: "600",
        lineHeight: 16,
    },

    /* Reflection */
    reflectionCard: {
        backgroundColor: "#fff",
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadow.card,
        alignItems: "center",
    },
    reflectionTitle: {
        fontWeight: "800",
        fontSize: 18,
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    reflectionPrompt: {
        fontSize: typography.body,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        marginVertical: spacing.md,
    },
    reflectionInput: {
        width: "100%",
        minHeight: 100,
        backgroundColor: "#F8F9FD",
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: typography.body,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: "#E0E5EC",
    },

    /* Badge unlock */
    badgeCard: {
        backgroundColor: "#fff",
        borderRadius: radius.lg,
        padding: spacing.xl,
        alignItems: "center",
        ...shadow.card,
    },
    badgeEmoji: { fontSize: 64, marginBottom: spacing.sm },
    badgeTitle: {
        fontWeight: "800",
        fontSize: 22,
        color: colors.textPrimary,
    },
    badgeName: {
        fontWeight: "700",
        fontSize: 16,
        color: colors.ctaPrimary,
        marginTop: 4,
        marginBottom: spacing.sm,
    },
    badgeMessage: {
        fontSize: typography.body,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    xpBadge: {
        backgroundColor: "#FFF3E0",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: radius.pill,
    },
    xpText: {
        fontWeight: "800",
        fontSize: 16,
        color: "#F57F17",
    },

    /* Cliffhanger */
    cliffCard: {
        backgroundColor: "#2D3436",
        borderRadius: radius.lg,
        padding: spacing.xl,
        alignItems: "center",
        ...shadow.card,
    },
    cliffText: {
        fontWeight: "800",
        fontSize: 24,
        color: "#fff",
        textAlign: "center",
    },
    cliffTeaser: {
        fontWeight: "700",
        fontSize: 16,
        color: "#FDCB6E",
        marginTop: spacing.md,
        textAlign: "center",
    },
    finishBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00B894",
        paddingVertical: 16,
        paddingHorizontal: 28,
        borderRadius: radius.pill,
        marginTop: spacing.lg,
        gap: 8,
        ...shadow.card,
    },
    finishBtnText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 17,
    },
    nextMissionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#6C5CE7",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: radius.pill,
        marginTop: spacing.sm,
        gap: 8,
        ...shadow.card,
    },
    nextMissionBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
    scoreRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    scoreLabel: {
        fontSize: typography.body,
        color: colors.textSecondary,
        fontWeight: "600",
    },
    scoreValue: {
        fontWeight: "800",
        fontSize: 20,
        color: colors.ctaPrimary,
    },
});
