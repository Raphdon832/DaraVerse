import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState, useMemo } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import MotiPressable from "../components/SoundMotiPressable";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { signIn, resetPassword } from "../services/authService";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { formMaxWidth, horizontalPadding, isLargeScreen } = useResponsiveLayout();

    const canSubmit = email.trim().length > 0 && password.length >= 6 && !isSubmitting;

    const handleLogin = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        try {
            await signIn(email.trim(), password);
            // AuthContext will handle state change and RootNavigator will redirect
        } catch (error: any) {
            let message = "Could not sign in. Please try again.";
            if (error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") {
                message = "Invalid email or password.";
            } else if (error?.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            }
            Alert.alert("Sign In Failed", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert("Enter Email", "Please type your email above, then tap Forgot Password.");
            return;
        }
        try {
            await resetPassword(email.trim());
            Alert.alert("Email Sent", "Check your inbox for a password reset link.");
        } catch {
            Alert.alert("Error", "Could not send reset email. Please check the email and try again.");
        }
    };

    const pressScale = useMemo(
        () => ({ pressed }: { pressed: boolean }) => {
            "worklet";
            return { scale: pressed ? 0.98 : 1 };
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
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={contentContainerStyle}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <MotiPressable
                        onPress={() => navigation.navigate("AuthWelcome")}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                    </MotiPressable>

                    <MotiView
                        from={{ opacity: 0, translateY: -20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "timing", duration: 600 }}
                    >
                        <Image
                            source={require("../../public/Daraverse Logo New Main.png")}
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to continue your STEM adventure and track your progress.
                        </Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200 }}
                        style={styles.card}
                    >
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>EMAIL ADDRESS</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    keyboardType="email-address"
                                    onChangeText={setEmail}
                                    placeholder="e.g. dara@stem.com"
                                    placeholderTextColor={colors.textMuted}
                                    style={styles.input}
                                    value={email}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    autoCapitalize="none"
                                    onChangeText={setPassword}
                                    placeholder="Min. 6 characters"
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                    value={password}
                                />
                                <MotiPressable
                                    accessibilityRole="button"
                                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </MotiPressable>
                            </View>
                        </View>

                        <MotiPressable
                            onPress={handleForgotPassword}
                            style={styles.forgotBtn}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </MotiPressable>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 }}
                    >
                        <MotiPressable
                            disabled={!canSubmit}
                            onPress={handleLogin}
                            animate={pressScale}
                            style={[
                                styles.primaryButton,
                                !canSubmit && styles.primaryButtonDisabled,
                            ]}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign In</Text>
                            )}
                        </MotiPressable>

                        <MotiPressable
                            onPress={() => navigation.navigate("SignUp")}
                            style={styles.footerLink}
                        >
                            <Text style={styles.footerText}>
                                New to Daraverse? <Text style={styles.footerTextBold}>Create Account</Text>
                            </Text>
                        </MotiPressable>
                    </MotiView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgCanvas,
    },
    content: {
        padding: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.bgSurface,
        borderWidth: 1.5,
        borderColor: colors.borderSoft,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,
        ...shadow.soft,
    },
    logoSmall: {
        width: 60,
        height: 60,
        marginBottom: spacing.xs,
        marginLeft: -10, // Adjust for logo padding
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 22,
        marginTop: spacing.xs,
        marginBottom: spacing.xl,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: radius.xxl,
        padding: spacing.lg,
        ...shadow.card,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.borderSoft,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 12,
        fontWeight: "800",
        color: colors.textMuted,
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.bgSoft,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        height: 52,
        borderWidth: 1,
        borderColor: "transparent",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.textPrimary,
        height: "100%",
    },
    eyeButton: {
        paddingLeft: spacing.xs,
        paddingVertical: spacing.xs,
    },
    forgotBtn: {
        alignSelf: "flex-end",
        marginTop: 4,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.ctaPrimary,
    },
    primaryButton: {
        backgroundColor: colors.ctaPrimary,
        height: 56,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        ...shadow.soft,
    },
    primaryButtonDisabled: {
        opacity: 0.6,
        backgroundColor: colors.textMuted,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    footerLink: {
        marginTop: spacing.lg,
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    footerTextBold: {
        color: colors.ctaPrimary,
        fontWeight: "800",
    },
});
