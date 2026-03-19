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
import { signUp } from "../services/authService";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { formMaxWidth, horizontalPadding, isLargeScreen } = useResponsiveLayout();

    const canSubmit =
        email.trim().length > 0 &&
        password.length >= 6 &&
        password === confirmPassword &&
        !isSubmitting;

    const handleSignUp = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        try {
            await signUp(email.trim(), password);
            // Auth success -> RootNavigator will naturally show Registration because !isRegistered
        } catch (error: any) {
            let message = "Could not create account. Please try again.";
            if (error?.code === "auth/email-already-in-use") {
                message = "This email is already registered.";
            } else if (error?.code === "auth/invalid-email") {
                message = "Invalid email address.";
            } else if (error?.code === "auth/weak-password") {
                message = "Password is too weak. Use at least 6 characters.";
            }
            Alert.alert("Sign Up Failed", message);
        } finally {
            setIsSubmitting(false);
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
                    >
                        <Image
                            source={require("../../public/Daraverse Logo New Main.png")}
                            style={styles.logoSmall}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join the Daraverse family and start your mission to master the future.
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
                                    placeholder="your@email.com"
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CONFIRM PASSWORD</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    autoCapitalize="none"
                                    onChangeText={setConfirmPassword}
                                    placeholder="Repeat your password"
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showConfirmPassword}
                                    style={styles.input}
                                    value={confirmPassword}
                                />
                                <MotiPressable
                                    accessibilityRole="button"
                                    accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </MotiPressable>
                            </View>
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 }}
                    >
                        <MotiPressable
                            disabled={!canSubmit}
                            onPress={handleSignUp}
                            animate={pressScale}
                            style={[
                                styles.primaryButton,
                                !canSubmit && styles.primaryButtonDisabled,
                            ]}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Create Account</Text>
                            )}
                        </MotiPressable>

                        <MotiPressable
                            onPress={() => navigation.navigate("Login")}
                            style={styles.footerLink}
                        >
                            <Text style={styles.footerText}>
                                Already have an account? <Text style={styles.footerTextBold}>Sign In</Text>
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
        marginLeft: -10,
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
