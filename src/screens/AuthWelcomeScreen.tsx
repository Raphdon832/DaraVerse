import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import MotiPressable from "../components/SoundMotiPressable";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { signInAnonymously, signInWithGoogle, signInWithGoogleCredential } from "../services/authService";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "AuthWelcome">;

export default function AuthWelcomeScreen({ navigation }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { formMaxWidth, horizontalPadding, isLargeScreen } = useResponsiveLayout();

    // ─── Google Auth Setup ──────────────────────────────────────────────
    // Replace these with your actual Client IDs from Firebase/Google Console
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
        androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
        webClientId: "425792079222-fab9d1f77e3dc0551e6657.apps.googleusercontent.com", // Example from appId
    });

    useEffect(() => {
        if (response?.type === "success") {
            const { id_token, access_token } = response.params;
            handleFinishGoogleAuth(id_token, access_token);
        } else if (response?.type === "error") {
            Alert.alert("Google Auth Error", "An error occurred during sign in.");
        }
    }, [response]);

    const handleFinishGoogleAuth = async (idToken: string, accessToken?: string) => {
        setIsSubmitting(true);
        try {
            await signInWithGoogleCredential(idToken, accessToken);
            // AuthContext will handle state change
        } catch (error) {
            Alert.alert("Sign In Failed", "Could not complete Google authentication.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleAuth = async () => {
        if (Platform.OS === "web") {
            setIsSubmitting(true);
            try {
                await signInWithGoogle();
            } catch (error: any) {
                if (error?.code !== "auth/popup-closed-by-user") {
                    Alert.alert("Google Auth Failed", "Could not sign in with Google.");
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // Native flow
            promptAsync();
        }
    };

    const handleGuestAuth = async () => {
        setIsSubmitting(true);
        try {
            await signInAnonymously();
            // AuthContext will update, and RootNavigator will automatically show RegistrationScreen
        } catch (error) {
            Alert.alert("Guest Access Failed", "Temporary access is currently unavailable.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const pressScale = useMemo(
        () => ({ pressed }: { pressed: boolean }) => {
            "worklet";
            return { scale: pressed ? 0.96 : 1 };
        },
        []
    );

    const contentContainerStyle = useMemo(
        () => [
            styles.content,
            {
                alignSelf: "center" as const,
                maxWidth: formMaxWidth,
                paddingHorizontal: horizontalPadding,
                paddingTop: isLargeScreen ? spacing.xxxl : spacing.xl,
            },
        ],
        [formMaxWidth, horizontalPadding, isLargeScreen],
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "timing", duration: 800 }}
                    style={styles.header}
                >
                    <View style={styles.logoCircle}>
                        <Image
                            source={require("../../assets/Daraverse Logo New Main.png")}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Daraverse</Text>
                    <Text style={styles.subtitle}>Ignite your curiosity, master STEM, and lead the future.</Text>
                </MotiView>

                <View style={styles.actions}>
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 }}
                    >
                        <MotiPressable
                            onPress={handleGoogleAuth}
                            animate={pressScale}
                            style={[styles.button, styles.googleButton]}
                        >
                            <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.btnIcon} />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </MotiPressable>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 }}
                    >
                        <MotiPressable
                            onPress={() => navigation.navigate("SignUp")}
                            animate={pressScale}
                            style={[styles.button, styles.signUpButton]}
                        >
                            <Ionicons name="mail" size={20} color="#FFFFFF" style={styles.btnIcon} />
                            <Text style={styles.signUpButtonText}>Sign Up with Email</Text>
                        </MotiPressable>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 500 }}
                        style={styles.dividerRow}
                    >
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 600 }}
                    >
                        <MotiPressable
                            onPress={() => navigation.navigate("Login")}
                            animate={pressScale}
                            style={[styles.button, styles.signInButton]}
                        >
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        </MotiPressable>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 700 }}
                    >
                        <MotiPressable
                            onPress={handleGuestAuth}
                            animate={pressScale}
                            style={styles.guestButton}
                        >
                            <Text style={styles.guestButtonText}>Continue as Guest</Text>
                        </MotiPressable>
                    </MotiView>
                </View>

                {isSubmitting && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color={colors.ctaPrimary} />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgCanvas,
    },
    content: {
        flexGrow: 1,
        padding: spacing.xl,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: spacing.xxl,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        ...shadow.soft,
        marginBottom: spacing.md,
        overflow: "hidden",
    },
    logoImage: {
        width: "100%",
        height: "100%",
    },
    title: {
        fontSize: 36,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.xs,
        paddingHorizontal: spacing.md,
        lineHeight: 22,
    },
    actions: {
        width: "100%",
        gap: spacing.md,
    },
    button: {
        height: 56,
        borderRadius: radius.xl,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        ...shadow.soft,
    },
    btnIcon: {
        marginRight: spacing.sm,
    },
    googleButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#475569",
    },
    signUpButton: {
        backgroundColor: colors.ctaPrimary,
    },
    signUpButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    signInButton: {
        backgroundColor: colors.bgSurface,
        borderWidth: 1,
        borderColor: colors.borderSoft,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    guestButton: {
        paddingVertical: spacing.md,
        alignItems: "center",
    },
    guestButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textSecondary,
        textDecorationLine: "underline",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: spacing.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.borderSoft,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: 12,
        fontWeight: "700",
        color: colors.textMuted,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.6)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
    },
});
