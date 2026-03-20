import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    Easing,
    cancelAnimation,
    runOnJS,
} from "react-native-reanimated";

import AppHeader from "../components/AppHeader";
import BackButton from "../components/BackButton";
import Pressable from "../components/SoundPressable";
import { useAppState } from "../context/AppStateContext";
import { useAuth } from "../context/AuthContext";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { linkAnonymousToEmail, isAnonymous, signOut } from "../services/authService";
import { seedCatalogsToFirestore } from "../services/catalogService";
import { avatarOptions, getAvatarById } from "../data/avatars";
import { getAgeBracketLabel, defaultAgeBracket } from "../data/ageBrackets";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

type SettingsModalKey =
    | "editProfile"
    | "notifications"
    | "preferences"
    | "linkEmail"
    | "seed"
    | "help"
    | "about"
    | null;

export default function ProfileScreen({ navigation }: Props) {
    const { state, registerLearner, updateSettings } = useAppState();
    const { contentMaxWidth, horizontalPadding, isDesktop, isTablet } = useResponsiveLayout();
    const { stemCategories: stemCategoryCatalog, missions: missionCatalog } = state.catalogs;
    const { user } = useAuth();
    const selectedAvatar = getAvatarById(state.learner.avatarId) ?? avatarOptions[0];
    const selectedAvatarDisplaySource = selectedAvatar.full;
    const ageLabel = getAgeBracketLabel(state.learner.ageBracket ?? defaultAgeBracket);
    const userIsAnonymous = isAnonymous();

    // Link email state
    const [linkEmail, setLinkEmail] = useState("");
    const [linkPassword, setLinkPassword] = useState("");
    const [showLinkPassword, setShowLinkPassword] = useState(false);
    const [isLinking, setIsLinking] = useState(false);

    // Avatar modal
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);

    // Settings modals
    const [activeSettingsModal, setActiveSettingsModal] = useState<SettingsModalKey>(null);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const isClosingSettingsModalRef = useRef(false);

    // Edit Profile state
    const [editName, setEditName] = useState(state.learner.firstName);
    const [editAvatarId, setEditAvatarId] = useState(state.learner.avatarId ?? avatarOptions[0].id);

    // ”—€ 3D spin + elegant scale/fade animation ”—€
    const spinValue = useSharedValue(0);
    const modalScale = useSharedValue(0.5);
    const modalOpacity = useSharedValue(0);
    const modalTranslateY = useSharedValue(50);
    const settingsBackdropOpacity = useSharedValue(0);
    const settingsSheetTranslateY = useSharedValue(isDesktop || isTablet ? 28 : 300);
    const settingsSheetScale = useSharedValue(isDesktop || isTablet ? 0.96 : 1);

    const startSpin = useCallback(() => {
        spinValue.value = 0;
        modalScale.value = 0.5;
        modalOpacity.value = 0;
        modalTranslateY.value = 50;

        modalScale.value = withSpring(1, { damping: 14, stiffness: 120 });
        modalTranslateY.value = withSpring(0, { damping: 14, stiffness: 120 });
        modalOpacity.value = withTiming(1, { duration: 250 });

        spinValue.value = withRepeat(
            withTiming(360, { duration: 5000, easing: Easing.linear }),
            -1,
            false,
        );
    }, [spinValue, modalScale, modalOpacity, modalTranslateY]);

    const hideModalAfterAnimation = useCallback(() => {
        setAvatarModalVisible(false);
        cancelAnimation(spinValue);
        spinValue.value = 0;
    }, [spinValue]);

    const closeAvatarModal = useCallback(() => {
        // Elegant & fast fly-back to origin (top of the profile)
        modalScale.value = withSpring(0.2, { damping: 14, stiffness: 400 });
        modalTranslateY.value = withSpring(-350, { damping: 14, stiffness: 400 });

        modalOpacity.value = withTiming(0, { duration: 250, easing: Easing.inOut(Easing.quad) }, () => {
            runOnJS(hideModalAfterAnimation)();
        });
    }, [modalScale, modalTranslateY, modalOpacity, hideModalAfterAnimation]);

    const backdropStyle = useAnimatedStyle(() => ({
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        opacity: modalOpacity.value,
        alignItems: "center",
        justifyContent: "center",
    }));

    const spinStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1000 },
            { rotateY: `${spinValue.value}deg` },
        ],
    }));

    const modalContentStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: modalTranslateY.value },
            { scale: modalScale.value },
        ],
    }));

    const openAvatarModal = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setAvatarModalVisible(true);
        startSpin();
    };

    // ”—€ Settings handlers ”—€
    const openSettingsModal = (key: SettingsModalKey) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isClosingSettingsModalRef.current) {
            isClosingSettingsModalRef.current = false;
        }
        if (key === "editProfile") {
            setEditName(state.learner.firstName);
            setEditAvatarId(state.learner.avatarId ?? avatarOptions[0].id);
        } else if (key === "linkEmail") {
            setShowLinkPassword(false);
        }
        setActiveSettingsModal(key);
    };

    const hideSettingsModalAfterAnimation = useCallback(() => {
        setSettingsModalVisible(false);
        setActiveSettingsModal(null);
        isClosingSettingsModalRef.current = false;
    }, []);

    const closeSettingsModal = useCallback(() => {
        if (!settingsModalVisible || isClosingSettingsModalRef.current) {
            return;
        }

        isClosingSettingsModalRef.current = true;
        const dismissDistance = isDesktop || isTablet ? 28 : 260;

        settingsBackdropOpacity.value = withTiming(0, {
            duration: 180,
            easing: Easing.out(Easing.quad),
        });
        settingsSheetTranslateY.value = withTiming(
            dismissDistance,
            { duration: 220, easing: Easing.out(Easing.cubic) },
        );
        settingsSheetScale.value = withTiming(
            isDesktop || isTablet ? 0.98 : 1,
            { duration: 220, easing: Easing.out(Easing.cubic) },
            (finished) => {
                if (finished) {
                    runOnJS(hideSettingsModalAfterAnimation)();
                }
            },
        );
    }, [
        hideSettingsModalAfterAnimation,
        isDesktop,
        isTablet,
        settingsBackdropOpacity,
        settingsModalVisible,
        settingsSheetScale,
        settingsSheetTranslateY,
    ]);

    useEffect(() => {
        if (activeSettingsModal === null) {
            return;
        }

        setSettingsModalVisible(true);
        isClosingSettingsModalRef.current = false;

        cancelAnimation(settingsBackdropOpacity);
        cancelAnimation(settingsSheetTranslateY);
        cancelAnimation(settingsSheetScale);

        settingsBackdropOpacity.value = 0;
        settingsSheetTranslateY.value = isDesktop || isTablet ? 28 : 300;
        settingsSheetScale.value = isDesktop || isTablet ? 0.96 : 1;

        settingsBackdropOpacity.value = withTiming(1, {
            duration: 220,
            easing: Easing.out(Easing.quad),
        });
        settingsSheetTranslateY.value = withSpring(0, {
            damping: 20,
            stiffness: 220,
        });
        if (isDesktop || isTablet) {
            settingsSheetScale.value = withSpring(1, {
                damping: 20,
                stiffness: 220,
            });
        }
    }, [
        activeSettingsModal,
        isDesktop,
        isTablet,
        settingsBackdropOpacity,
        settingsSheetScale,
        settingsSheetTranslateY,
    ]);

    const settingsBackdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: settingsBackdropOpacity.value,
    }));

    const settingsSheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: settingsSheetTranslateY.value },
            { scale: settingsSheetScale.value },
        ],
    }));

    const settingsDragPanResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    if (isDesktop || isTablet || !settingsModalVisible) {
                        return false;
                    }
                    return (
                        gestureState.dy > 6 &&
                        Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
                    );
                },
                onPanResponderMove: (_, gestureState) => {
                    if (isDesktop || isTablet) {
                        return;
                    }
                    const nextY = Math.max(0, gestureState.dy);
                    settingsSheetTranslateY.value = nextY;
                    settingsBackdropOpacity.value = Math.max(0.15, 1 - nextY / 320);
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (isDesktop || isTablet) {
                        return;
                    }
                    if (gestureState.dy > 120 || gestureState.vy > 1.15) {
                        closeSettingsModal();
                        return;
                    }
                    settingsBackdropOpacity.value = withTiming(1, {
                        duration: 180,
                        easing: Easing.out(Easing.quad),
                    });
                    settingsSheetTranslateY.value = withSpring(0, {
                        damping: 20,
                        stiffness: 220,
                    });
                },
            }),
        [
            closeSettingsModal,
            isDesktop,
            isTablet,
            settingsBackdropOpacity,
            settingsModalVisible,
            settingsSheetTranslateY,
        ],
    );

    const saveProfile = () => {
        if (!editName.trim()) {
            Alert.alert("Name required", "Please enter your name.");
            return;
        }
        registerLearner({
            firstName: editName.trim(),
            avatarId: editAvatarId,
            age: state.learner.age ?? 11,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        closeSettingsModal();
    };

    // Computed stats
    const completedMissions = Object.values(state.missionProgress).filter(
        (p) => p.status === "completed",
    ).length;
    const totalMissions = missionCatalog.length;

    const totalTriviaSessions = Object.values(state.stemTriviaProgress).reduce(
        (sum, p) => sum + p.sessionsPlayed,
        0,
    );

    const submittedProjects = Object.values(state.projectProgress).filter(
        (p) => p.status === "submitted",
    ).length;

    const totalBadges = state.unlockedBadgeIds.length;
    const totalCertificates = state.unlockedCertificateIds.length;

    const statCards = [
        { label: "Total Score", value: state.learner.totalScore.toString(), icon: "diamond" as const, color: colors.statusWarning },
        { label: "Streak", value: `${state.learner.streakDays}d`, icon: "flame" as const, color: "#FF5252" },
        { label: "Badges", value: totalBadges.toString(), icon: "ribbon" as const, color: colors.pastelGreen },
        { label: "Certificates", value: totalCertificates.toString(), icon: "school" as const, color: colors.pastelPurple },
    ];

    const activityItems = [
        { label: "Missions Completed", value: `${completedMissions}/${totalMissions}`, icon: "rocket" as const, bg: colors.pastelBlue },
        { label: "Trivia Sessions", value: totalTriviaSessions.toString(), icon: "flask" as const, bg: colors.pastelPink },
        { label: "Projects Submitted", value: submittedProjects.toString(), icon: "construct" as const, bg: colors.pastelPeach },
    ];

    type MenuItem = { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; key: SettingsModalKey };
    const menuItems: MenuItem[] = [
        { label: "Edit Profile", icon: "person-outline", key: "editProfile" },
        ...(userIsAnonymous
            ? [{ label: "Link Email Account", icon: "mail-outline" as const, key: "linkEmail" as SettingsModalKey }]
            : []),
        { label: "Notifications", icon: "notifications-outline", key: "notifications" },
        { label: "Preferences", icon: "settings-outline", key: "preferences" },
        { label: "Help & Support", icon: "help-circle-outline", key: "help" },
        { label: "About Daraverse", icon: "information-circle-outline", key: "about" },
    ];

    const handleLinkEmail = async () => {
        if (!linkEmail.trim() || linkPassword.length < 6) {
            Alert.alert("Invalid Input", "Please enter a valid email and a password with at least 6 characters.");
            return;
        }
        setIsLinking(true);
        try {
            await linkAnonymousToEmail(linkEmail.trim(), linkPassword);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Account Linked!", "Your progress is now permanently saved with your email.");
            closeSettingsModal();
        } catch (error: any) {
            let message = "Could not link account. Please try again.";
            if (error?.code === "auth/email-already-in-use") {
                message = "This email is already in use by another account.";
            } else if (error?.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            } else if (error?.code === "auth/weak-password") {
                message = "Password must be at least 6 characters.";
            }
            Alert.alert("Link Failed", message);
        } finally {
            setIsLinking(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            userIsAnonymous
                ? "Warning: As a guest, signing out will lose all your progress. Link an email first to save it."
                : "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            // RootNavigator will automatically react to auth state change
                        } catch {
                            Alert.alert("Error", "Could not sign out. Please try again.");
                        }
                    },
                },
            ],
        );
    };

    const pressAnimate = useMemo(
        () =>
            ({ pressed }: { pressed: boolean }) => {
                "worklet";
                return { scale: pressed ? 0.95 : 1 };
            },
        [],
    );

    const headerStyle = useMemo(
        () => ({
            alignSelf: "center" as const,
            maxWidth: contentMaxWidth,
            paddingHorizontal: horizontalPadding,
            width: "100%" as const,
        }),
        [contentMaxWidth, horizontalPadding],
    );

    const contentContainerStyle = useMemo(
        () => [
            s.content,
            {
                alignSelf: "center" as const,
                maxWidth: contentMaxWidth,
                paddingHorizontal: horizontalPadding,
                width: "100%" as const,
            },
        ],
        [contentMaxWidth, horizontalPadding],
    );

    const settingsSheetStyle = useMemo(
        () => [
            s.settingsSheet,
            (isDesktop || isTablet) ? s.settingsDialog : s.settingsBottomSheet,
            {
                alignSelf: "center" as const,
                maxWidth: Math.min(contentMaxWidth, 760),
                width: "100%" as const,
            },
        ],
        [contentMaxWidth, isDesktop, isTablet],
    );

    const settingsOverlayStyle = useMemo(
        () => [s.settingsOverlay, (isDesktop || isTablet) && s.settingsOverlayCentered],
        [isDesktop, isTablet],
    );

    const settingsKeyboardAvoidingStyle = useMemo(
        () => [
            s.settingsKeyboardAvoiding,
            (isDesktop || isTablet) && s.settingsKeyboardAvoidingCentered,
        ],
        [isDesktop, isTablet],
    );

    // ”—€ Render helpers for settings modals ”—€
    const renderSettingsContent = () => {
        switch (activeSettingsModal) {
            case "editProfile":
                return (
                    <View>
                        <Text style={s.settingsTitle}>Edit Profile</Text>
                        <Text style={s.fieldLabel}>Name</Text>
                        <TextInput
                            style={s.textInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Your name"
                            placeholderTextColor={colors.textSecondary}
                            maxLength={30}
                        />
                        <Text style={s.fieldLabel}>Avatar</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.avatarPicker}>
                            {avatarOptions.map((av) => (
                                <Pressable
                                    key={av.id}
                                    onPress={() => setEditAvatarId(av.id)}
                                    style={[
                                        s.avatarPickOption,
                                        editAvatarId === av.id && s.avatarPickSelected,
                                    ]}
                                >
                                    <Image source={av.thumbnail} style={s.avatarPickImg} />
                                </Pressable>
                            ))}
                        </ScrollView>
                        <Pressable onPress={saveProfile} style={({ pressed }) => [s.primaryBtn, pressed && { opacity: 0.8 }]}>
                            <Text style={s.primaryBtnText}>Save Changes</Text>
                        </Pressable>
                    </View>
                );

            case "notifications":
                return (
                    <View>
                        <Text style={s.settingsTitle}>Notifications</Text>
                        <View style={s.toggleRow}>
                            <View style={s.toggleInfo}>
                                <Ionicons name="trophy-outline" size={20} color={colors.textPrimary} />
                                <Text style={s.toggleLabel}>Achievements</Text>
                            </View>
                            <Switch
                                value={state.settings.notifAchievements}
                                onValueChange={(value) => updateSettings({ notifAchievements: value })}
                                trackColor={{ false: colors.bgSoft, true: colors.ctaPrimary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={s.toggleRow}>
                            <View style={s.toggleInfo}>
                                <Ionicons name="alarm-outline" size={20} color={colors.textPrimary} />
                                <Text style={s.toggleLabel}>Daily Reminders</Text>
                            </View>
                            <Switch
                                value={state.settings.notifReminders}
                                onValueChange={(value) => updateSettings({ notifReminders: value })}
                                trackColor={{ false: colors.bgSoft, true: colors.ctaPrimary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={s.toggleRow}>
                            <View style={s.toggleInfo}>
                                <Ionicons name="megaphone-outline" size={20} color={colors.textPrimary} />
                                <Text style={s.toggleLabel}>App Updates</Text>
                            </View>
                            <Switch
                                value={state.settings.notifUpdates}
                                onValueChange={(value) => updateSettings({ notifUpdates: value })}
                                trackColor={{ false: colors.bgSoft, true: colors.ctaPrimary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                );

            case "preferences":
                return (
                    <View>
                        <Text style={s.settingsTitle}>Preferences</Text>
                        <View style={s.toggleRow}>
                            <View style={s.toggleInfo}>
                                <Ionicons name="volume-high-outline" size={20} color={colors.textPrimary} />
                                <Text style={s.toggleLabel}>Sound Effects</Text>
                            </View>
                            <Switch
                                value={state.settings.soundEnabled}
                                onValueChange={(value) => updateSettings({ soundEnabled: value })}
                                trackColor={{ false: colors.bgSoft, true: colors.ctaPrimary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={s.toggleRow}>
                            <View style={s.toggleInfo}>
                                <Ionicons name="phone-portrait-outline" size={20} color={colors.textPrimary} />
                                <Text style={s.toggleLabel}>Haptic Feedback</Text>
                            </View>
                            <Switch
                                value={state.settings.hapticEnabled}
                                onValueChange={(value) => updateSettings({ hapticEnabled: value })}
                                trackColor={{ false: colors.bgSoft, true: colors.ctaPrimary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={s.toggleRow}>
                            <View style={s.toggleInfo}>
                                <Ionicons name="sparkles-outline" size={20} color={colors.textPrimary} />
                                <Text style={s.toggleLabel}>Animations</Text>
                            </View>
                            <Switch
                                value={state.settings.animationsEnabled}
                                onValueChange={(value) => updateSettings({ animationsEnabled: value })}
                                trackColor={{ false: colors.bgSoft, true: colors.ctaPrimary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                );

            case "help":
                return (
                    <View>
                        <Text style={s.settingsTitle}>Help & Support</Text>
                        <View style={s.helpSection}>
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.ctaPrimary} />
                            <View style={s.helpText}>
                                <Text style={s.helpHeading}>Frequently Asked Questions</Text>
                                <Text style={s.helpBody}>Find answers about quizzes, badges, missions, and more in our FAQ section.</Text>
                            </View>
                        </View>
                        <View style={s.helpSection}>
                            <Ionicons name="mail-outline" size={24} color={colors.ctaPrimary} />
                            <View style={s.helpText}>
                                <Text style={s.helpHeading}>Contact Us</Text>
                                <Text style={s.helpBody}>Email: support@daraverse.com</Text>
                            </View>
                        </View>
                        <View style={s.helpSection}>
                            <Ionicons name="bug-outline" size={24} color={colors.ctaPrimary} />
                            <View style={s.helpText}>
                                <Text style={s.helpHeading}>Report a Bug</Text>
                                <Text style={s.helpBody}>Found something broken? Let us know and we'll fix it ASAP.</Text>
                            </View>
                        </View>
                    </View>
                );

            case "linkEmail":
                return (
                    <View>
                        <Text style={s.settingsTitle}>Link Email Account</Text>
                        <Text style={[s.fieldLabel, { marginTop: 0 }]}>
                            Save your progress permanently by linking an email and password.
                        </Text>
                        <Text style={s.fieldLabel}>Email</Text>
                        <TextInput
                            autoCapitalize="none"
                            autoComplete="email"
                            keyboardType="email-address"
                            style={s.textInput}
                            value={linkEmail}
                            onChangeText={setLinkEmail}
                            placeholder="your@email.com"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <Text style={s.fieldLabel}>Password</Text>
                        <View style={s.passwordInputRow}>
                            <TextInput
                                autoCapitalize="none"
                                secureTextEntry={!showLinkPassword}
                                style={s.passwordInputField}
                                value={linkPassword}
                                onChangeText={setLinkPassword}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={colors.textSecondary}
                            />
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={showLinkPassword ? "Hide password" : "Show password"}
                                onPress={() => setShowLinkPassword((prev) => !prev)}
                                style={({ pressed }) => [s.eyeButton, pressed && { opacity: 0.75 }]}
                            >
                                <Ionicons
                                    name={showLinkPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </Pressable>
                        </View>
                        <Pressable
                            onPress={handleLinkEmail}
                            disabled={isLinking}
                            style={({ pressed }) => [s.primaryBtn, pressed && { opacity: 0.8 }, isLinking && { opacity: 0.6 }]}
                        >
                            {isLinking ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={s.primaryBtnText}>Link Account</Text>
                            )}
                        </Pressable>
                    </View>
                );


            case "about":
                return (
                    <View style={s.aboutContent}>
                        <Text style={s.settingsTitle}>About Daraverse</Text>
                        <View style={s.aboutLogoWrap}>
                            <Image
                                source={require("../../assets/Daraverse Logo New Main.png")}
                                style={{ width: 80, height: 80 }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={s.aboutVersion}>Version 1.0.0</Text>
                        <Text style={s.aboutDesc}>
                            Daraverse is an interactive learning platform designed to empower young learners
                            through STEM education, engaging missions, mentorship, and hands-on projects.
                        </Text>
                        <View style={s.aboutRow}>
                            <Text style={s.aboutLabel}>Developer</Text>
                            <Text style={s.aboutValue}>Daraverse Team</Text>
                        </View>
                        <View style={s.aboutRow}>
                            <Text style={s.aboutLabel}>Platform</Text>
                            <Text style={s.aboutValue}>iOS & Android</Text>
                        </View>
                        <View style={s.aboutRow}>
                            <Text style={s.aboutLabel}>Expo SDK</Text>
                            <Text style={s.aboutValue}>55</Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView edges={["top", "bottom"]} style={s.safeArea}>
            {/* Header */}
            <View style={headerStyle}>
                <AppHeader
                    title="My Profile"
                    showHomeAction
                    onPressHome={() => navigation.goBack()}
                />
            </View>

            <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
                {/* Avatar hero */}
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 18 }}
                    style={s.heroCard}
                >
                    <Pressable onPress={openAvatarModal} style={s.avatarRing}>
                        <Image source={selectedAvatarDisplaySource} style={s.heroAvatar} resizeMode="contain" />
                    </Pressable>
                    <Text style={s.avatarTapHint}>Tap to view</Text>
                    <Text style={s.heroName}>{state.learner.firstName || "Learner"}</Text>
                    <View style={s.heroBadgeRow}>
                        <View style={s.heroBadge}>
                            <Ionicons name="calendar" size={12} color={colors.textSecondary} />
                            <Text style={s.heroBadgeText}>Ages {ageLabel}</Text>
                        </View>
                        <View style={s.heroBadge}>
                            <Ionicons name="flame" size={12} color="#FF5252" />
                            <Text style={s.heroBadgeText}>{state.learner.streakDays} day streak</Text>
                        </View>
                    </View>
                </MotiView>

                {/* Stats grid */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 100 }}
                    style={s.statsGrid}
                >
                    {statCards.map((stat) => (
                        <View key={stat.label} style={s.statCard}>
                            <Ionicons name={stat.icon} size={20} color={stat.color} />
                            <Text style={s.statValue}>{stat.value}</Text>
                            <Text style={s.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </MotiView>

                {/* Activity */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 200 }}
                >
                    <Text style={s.sectionTitle}>Activity Overview</Text>
                    <View style={s.activityList}>
                        {activityItems.map((item) => (
                            <View key={item.label} style={[s.activityRow, { backgroundColor: item.bg }]}>
                                <View style={s.activityIconWrap}>
                                    <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
                                </View>
                                <Text style={s.activityLabel}>{item.label}</Text>
                                <Text style={s.activityValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </MotiView>

                {/* STEM Progress */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 300 }}
                >
                    <Text style={s.sectionTitle}>STEM Progress</Text>
                    <View style={s.stemProgressList}>
                        {stemCategoryCatalog.map((cat) => {
                            const progress = state.stemTriviaProgress[cat.id];
                            return (
                                <View key={cat.id} style={s.stemRow}>
                                    <View style={s.stemInfo}>
                                        <Text style={s.stemName}>{cat.title}</Text>
                                        <Text style={s.stemMeta}>
                                            {progress.sessionsPlayed} sessions • Best: {progress.bestScore}
                                        </Text>
                                    </View>
                                    <View style={s.stemBarTrack}>
                                        <View
                                            style={[s.stemBarFill, { width: `${Math.min(progress.sessionsPlayed * 10, 100)}%` }]}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </MotiView>

                {/* Settings menu */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 400 }}
                >
                    <Text style={s.sectionTitle}>Settings</Text>
                    <View style={s.menuCard}>
                        {menuItems.map((item, idx) => (
                            <MotiPressable
                                key={item.label}
                                onPress={() => openSettingsModal(item.key)}
                                animate={pressAnimate}
                                style={[s.menuRow, idx < menuItems.length - 1 && s.menuRowBorder]}
                            >
                                <View style={s.menuIconWrap}>
                                    <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
                                </View>
                                <Text style={s.menuLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                            </MotiPressable>
                        ))}
                    </View>
                </MotiView>

                {/* Sign Out */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "spring", delay: 450 }}
                >
                    <MotiPressable
                        onPress={handleSignOut}
                        animate={pressAnimate}
                        style={s.signOutButton}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text style={s.signOutText}>Sign Out</Text>
                    </MotiPressable>

                    {userIsAnonymous && (
                        <Text style={s.guestWarning}>
                            You're signed in as a guest. Link an email to save your progress.
                        </Text>
                    )}
                    {user?.email && (
                        <Text style={s.emailLabel}>Signed in as {user.email}</Text>
                    )}
                </MotiView>

                {/* Version */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", delay: 500 }}
                    style={s.versionWrap}
                >
                    <Text style={s.versionText}>Daraverse v1.0.0</Text>
                </MotiView>
            </ScrollView>

            {/* ”—€ Avatar 3D Spin Modal ”—€ */}
            <Modal visible={avatarModalVisible} transparent animationType="none" onRequestClose={closeAvatarModal}>
                <Animated.View style={backdropStyle}>
                    <Pressable style={StyleSheet.absoluteFill} />
                    <Animated.View style={[s.modalContent, modalContentStyle]}>
                        <Animated.View style={[s.modalAvatarWrap, spinStyle]}>
                            <Image source={selectedAvatarDisplaySource} style={s.modalAvatar} resizeMode="contain" />
                        </Animated.View>
                        <Text style={s.modalName}>{state.learner.firstName || "Learner"}</Text>
                        <Text style={s.modalSubtitle}>Ages {ageLabel}</Text>
                        <Pressable
                            onPress={closeAvatarModal}
                            style={({ pressed }) => [s.modalCloseBtn, pressed && { opacity: 0.7 }]}
                        >
                            <Ionicons name="close-circle" size={48} color="rgba(255,255,255,0.8)" />
                        </Pressable>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* ”—€ Settings Modal ”—€ */}
            <Modal
                visible={settingsModalVisible}
                transparent
                animationType="none"
                onRequestClose={closeSettingsModal}
                statusBarTranslucent
            >
                <View style={settingsOverlayStyle}>
                    <Animated.View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFillObject, s.settingsBackdrop, settingsBackdropAnimatedStyle]}
                    />
                    <Pressable style={StyleSheet.absoluteFillObject} onPress={closeSettingsModal} />
                    <KeyboardAvoidingView
                        style={settingsKeyboardAvoidingStyle}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
                    >
                        <Animated.View style={[settingsSheetStyle, settingsSheetAnimatedStyle]}>
                            <View
                                style={s.settingsHandleTouchArea}
                                {...(!isDesktop && !isTablet ? settingsDragPanResponder.panHandlers : {})}
                            >
                                <View style={s.settingsHandle} />
                            </View>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                                contentContainerStyle={s.settingsScrollContent}
                            >
                                {renderSettingsContent()}
                            </ScrollView>
                            <Pressable
                                onPress={closeSettingsModal}
                                style={({ pressed }) => [s.settingsCloseBtn, pressed && { opacity: 0.8 }]}
                            >
                                <Text style={s.settingsCloseBtnText}>Close</Text>
                            </Pressable>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgCanvas },
    fixedTopBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    topBarTitle: { fontSize: typography.subheading, fontWeight: "800", color: colors.textPrimary },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },

    // Hero
    heroCard: { backgroundColor: colors.pastelBlue, borderRadius: 30, padding: spacing.xl, alignItems: "center", ...shadow.card },
    avatarRing: {
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 4, borderColor: "rgba(255,255,255,0.7)",
        overflow: "hidden", backgroundColor: colors.bgSoft, marginBottom: 4,
    },
    heroAvatar: { width: "100%", height: "100%" },
    avatarTapHint: { fontSize: 11, fontWeight: "600", color: colors.textSecondary, marginBottom: spacing.xs },
    heroName: { fontSize: 28, fontWeight: "900", color: colors.textPrimary, marginBottom: spacing.xs },
    heroBadgeRow: { flexDirection: "row", gap: spacing.sm },
    heroBadge: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "rgba(255,255,255,0.5)", borderRadius: radius.pill,
        paddingHorizontal: 12, paddingVertical: 4,
    },
    heroBadgeText: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },

    // Stats
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
    statCard: {
        flex: 1, minWidth: "45%", backgroundColor: colors.bgSurface,
        borderRadius: 24, padding: spacing.md, alignItems: "center", gap: 4, ...shadow.soft,
    },
    statValue: { fontSize: 28, fontWeight: "900", color: colors.textPrimary },
    statLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },

    // Sections
    sectionTitle: { fontSize: typography.subheading, fontWeight: "800", color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },

    // Activity
    activityList: { gap: spacing.sm },
    activityRow: { flexDirection: "row", alignItems: "center", borderRadius: 20, padding: spacing.md },
    activityIconWrap: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", marginRight: spacing.md,
    },
    activityLabel: { flex: 1, fontSize: typography.body, fontWeight: "700", color: colors.textPrimary },
    activityValue: { fontSize: typography.heading, fontWeight: "900", color: colors.textPrimary },

    // STEM progress
    stemProgressList: { backgroundColor: colors.bgSurface, borderRadius: 24, padding: spacing.lg, gap: spacing.md, ...shadow.soft },
    stemRow: { gap: spacing.xs },
    stemInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    stemName: { fontSize: typography.body, fontWeight: "700", color: colors.textPrimary },
    stemMeta: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
    stemBarTrack: { height: 8, backgroundColor: colors.bgSoft, borderRadius: 4, overflow: "hidden" },
    stemBarFill: { height: "100%", backgroundColor: colors.ctaPrimary, borderRadius: 4 },

    // Menu
    menuCard: { backgroundColor: colors.bgSurface, borderRadius: 24, overflow: "hidden", ...shadow.soft },
    menuRow: { flexDirection: "row", alignItems: "center", padding: spacing.md, paddingVertical: spacing.lg },
    menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
    menuIconWrap: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center", marginRight: spacing.md,
    },
    menuLabel: { flex: 1, fontSize: typography.body, fontWeight: "700", color: colors.textPrimary },

    // Sign Out
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        backgroundColor: colors.bgSurface,
        borderRadius: 24,
        paddingVertical: spacing.lg,
        marginTop: spacing.xl,
        ...shadow.soft,
    },
    signOutText: { fontSize: typography.body, fontWeight: "800", color: "#EF4444" },
    guestWarning: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.statusWarning,
        textAlign: "center",
        marginTop: spacing.sm,
    },
    emailLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.sm,
    },

    // Version
    versionWrap: { alignItems: "center", marginTop: spacing.xl },
    versionText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },

    // ”—€ Avatar modal ”—€
    modalContent: { alignItems: "center", justifyContent: "center", padding: spacing.xl },
    modalAvatarWrap: {
        width: 260, height: 260, borderRadius: 130,
        borderWidth: 5, borderColor: "rgba(255,255,255,0.3)",
        overflow: "hidden", backgroundColor: colors.bgSoft, marginBottom: spacing.lg,
    },
    modalAvatar: { width: "100%", height: "100%" },
    modalName: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginBottom: 4 },
    modalSubtitle: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.6)", marginBottom: spacing.xl },
    modalCloseBtn: { marginTop: spacing.md, alignItems: "center" },

    // ”—€ Settings bottom sheet ”—€
    settingsOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    settingsBackdrop: {
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    settingsOverlayCentered: {
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    settingsKeyboardAvoiding: {
        width: "100%",
        justifyContent: "flex-end",
    },
    settingsKeyboardAvoidingCentered: {
        justifyContent: "center",
    },
    settingsSheet: {
        backgroundColor: colors.bgSurface,
        padding: spacing.lg, paddingTop: spacing.md,
        maxHeight: "88%",
        ...shadow.card,
    },
    settingsBottomSheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    settingsDialog: {
        borderRadius: 28,
    },
    settingsHandle: {
        width: 40, height: 5, borderRadius: 3,
        backgroundColor: colors.bgSoft, alignSelf: "center",
    },
    settingsHandleTouchArea: {
        alignItems: "center",
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
        marginBottom: spacing.xs,
    },
    settingsScrollContent: {
        paddingBottom: spacing.sm,
    },
    settingsTitle: { fontSize: 22, fontWeight: "900", color: colors.textPrimary, marginBottom: spacing.lg },
    settingsCloseBtn: {
        backgroundColor: colors.bgSoft, borderRadius: radius.pill,
        paddingVertical: 14, alignItems: "center", marginTop: spacing.md,
    },
    settingsCloseBtnText: { fontSize: typography.body, fontWeight: "800", color: colors.textPrimary },

    // Settings: Edit Profile
    fieldLabel: { fontSize: 14, fontWeight: "700", color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
    textInput: {
        backgroundColor: colors.bgCanvas, borderRadius: 16,
        padding: spacing.md, fontSize: typography.body,
        fontWeight: "700", color: colors.textPrimary,
        borderWidth: 2, borderColor: colors.borderSoft,
    },
    passwordInputRow: {
        backgroundColor: colors.bgCanvas,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.borderSoft,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
    },
    passwordInputField: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: typography.body,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    eyeButton: {
        paddingVertical: spacing.xs,
        paddingLeft: spacing.sm,
    },
    avatarPicker: { gap: spacing.sm, paddingVertical: spacing.sm },
    avatarPickOption: {
        width: 64, height: 64, borderRadius: 20,
        overflow: "hidden", borderWidth: 3, borderColor: "transparent",
        backgroundColor: colors.bgSoft,
    },
    avatarPickSelected: { borderColor: colors.ctaPrimary },
    avatarPickImg: { width: "100%", height: "100%" },
    primaryBtn: {
        backgroundColor: colors.ctaPrimary, borderRadius: radius.pill,
        paddingVertical: 16, alignItems: "center", marginTop: spacing.lg,
    },
    primaryBtnText: { fontSize: typography.body, fontWeight: "900", color: "#FFFFFF" },

    // Settings: Toggles
    toggleRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.borderSoft,
    },
    toggleInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    toggleLabel: { fontSize: typography.body, fontWeight: "700", color: colors.textPrimary },

    // Settings: Help
    helpSection: {
        flexDirection: "row", gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.borderSoft,
    },
    helpText: { flex: 1 },
    helpHeading: { fontSize: typography.body, fontWeight: "800", color: colors.textPrimary, marginBottom: 2 },
    helpBody: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, lineHeight: 18 },

    // Settings: About
    aboutContent: { alignItems: "center" },
    aboutLogoWrap: {
        width: 88, height: 88, borderRadius: 24,
        backgroundColor: colors.pastelBlue, alignItems: "center", justifyContent: "center",
        marginBottom: spacing.md,
    },
    aboutVersion: { fontSize: 14, fontWeight: "700", color: colors.textSecondary, marginBottom: spacing.md },
    aboutDesc: {
        fontSize: 14, fontWeight: "600", color: colors.textSecondary,
        textAlign: "center", lineHeight: 20, marginBottom: spacing.lg,
    },
    aboutRow: {
        flexDirection: "row", justifyContent: "space-between", width: "100%",
        paddingVertical: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.borderSoft,
    },
    aboutLabel: { fontSize: 14, fontWeight: "700", color: colors.textSecondary },
    aboutValue: { fontSize: 14, fontWeight: "800", color: colors.textPrimary },
});

