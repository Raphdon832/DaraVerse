import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
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
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

import MotiPressable from "../components/SoundMotiPressable";
import { avatarOptions } from "../data/avatars";
import { getAgeBracketLabel, getAgeBracketForAge } from "../data/ageBrackets";
import { useAppState } from "../context/AppStateContext";
import { useAuth } from "../context/AuthContext";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { signInAnonymously } from "../services/authService";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Registration">;

export default function RegistrationScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const { registerLearner } = useAppState();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contentMaxWidth, horizontalPadding, isLargeScreen } = useResponsiveLayout();

  const selectedAvatar = useMemo(
    () => avatarOptions.find((avatar) => avatar.id === selectedAvatarId),
    [selectedAvatarId]
  );

  const parsedAge = Number.parseInt(ageInput, 10);
  const ageIsValid = Number.isInteger(parsedAge) && parsedAge >= 0 && parsedAge <= 120;
  const ageBracketLabel = ageIsValid
    ? getAgeBracketLabel(getAgeBracketForAge(parsedAge))
    : null;

  const canContinue = firstName.trim().length > 0 && Boolean(selectedAvatarId) && ageIsValid && !isSubmitting;

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
        maxWidth: Math.min(contentMaxWidth, 680),
        paddingHorizontal: horizontalPadding,
        paddingTop: isLargeScreen ? spacing.xxxl : spacing.xl,
      },
    ],
    [contentMaxWidth, horizontalPadding, isLargeScreen],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <MotiPressable
          onPress={() => navigation.navigate("AuthWelcome")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
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
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself so we can tailor your Daraverse experience.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
          style={styles.card}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FIRST NAME</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                onChangeText={setFirstName}
                placeholder="How should we call you?"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={firstName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>YOUR AGE</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                keyboardType="number-pad"
                maxLength={3}
                onChangeText={(value) => setAgeInput(value.replace(/[^0-9]/g, ""))}
                placeholder="Used for STEM difficulty"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={ageInput}
              />
            </View>
            {ageBracketLabel && (
              <Text style={styles.ageHint}>
                Level: <Text style={{ fontWeight: "bold", color: colors.ctaPrimary }}>{ageBracketLabel}</Text>
              </Text>
            )}
          </View>

          <Text style={styles.label}>CHOOSE AN AVATAR</Text>
          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar) => {
              const selected = selectedAvatarId === avatar.id;
              return (
                <MotiPressable
                  key={avatar.id}
                  onPress={() => setSelectedAvatarId(avatar.id)}
                  animate={useMemo(() => ({ pressed }: { pressed: boolean }) => {
                    "worklet";
                    return {
                      scale: pressed ? 0.9 : 1,
                      borderColor: selected ? colors.ctaPrimary : "transparent",
                    };
                  }, [selected])}
                  style={[
                    styles.avatarTile,
                    selected && styles.avatarTileSelected,
                  ]}
                >
                  <Image source={avatar.thumbnail} style={styles.avatarThumb} />
                </MotiPressable>
              );
            })}
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 400 }}
          style={styles.previewCard}
        >
          {selectedAvatar ? (
            <Image source={selectedAvatar.full} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="happy-outline" size={60} color={colors.textMuted} />
              <Text style={styles.previewFallback}>Select an avatar to see the full view!</Text>
            </View>
          )}
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
        >
          <MotiPressable
            disabled={!canContinue}
            onPress={async () => {
              if (!selectedAvatarId || firstName.trim().length === 0 || !ageIsValid) return;

              setIsSubmitting(true);
              try {
                if (!isAuthenticated) {
                  await signInAnonymously();
                }

                registerLearner({
                  firstName: firstName.trim(),
                  avatarId: selectedAvatarId,
                  age: parsedAge,
                });
                // RootNavigator will automatically redirect to HomeHub because isRegistered is now true
              } catch (error) {
                Alert.alert("Error", "Could not save your profile. Please try again.");
              } finally {
                setIsSubmitting(false);
              }
            }}
            animate={pressScale}
            style={[
              styles.primaryButton,
              !canContinue && styles.primaryButtonDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Begin Journey</Text>
            )}
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
  keyboardAvoiding: {
    flex: 1,
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
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoSmall: {
    width: 60,
    height: 60,
    marginBottom: spacing.xs,
    marginLeft: -10,
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
  ageHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: spacing.xs,
  },
  avatarTile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.bgSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarTileSelected: {
    borderColor: colors.ctaPrimary,
    backgroundColor: colors.pastelPeach,
  },
  avatarThumb: {
    width: 48,
    height: 48,
  },
  previewCard: {
    height: 240,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
    padding: spacing.lg,
  },
  previewFallback: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    height: 58,
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
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
