import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedButton from "../components/AnimatedButton";
import AppHeader from "../components/AppHeader";
import Pressable from "../components/SoundPressable";
import { useAppState } from "../context/AppStateContext";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "SessionBooking">;

export default function MentorshipRequestScreen({ navigation, route }: Props) {
  const {
    state,
    requestMentorship,
    updateMentorshipRequestStatus,
  } = useAppState();
  const mentor = state.catalogs.mentors.find((item) => item.id === route.params.mentorId);
  const currentRequest = state.mentorshipRequests[route.params.mentorId];
  const requestStatus = currentRequest?.status ?? "none";
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  const [goals, setGoals] = useState(currentRequest?.goals ?? "");
  const [note, setNote] = useState(currentRequest?.note ?? "");

  if (!mentor) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title="Mentor Not Found"
            subtitle="Unable to submit request"
            showHomeAction
            onPressHome={() => navigation.goBack()}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const submitRequest = () => {
    if (goals.trim().length < 6 || note.trim().length < 6) {
      Alert.alert("Add more detail", "Please provide clear goals and an intro note.");
      return;
    }

    requestMentorship({
      mentorId: mentor.id,
      goals,
      note,
    });
    Alert.alert("Request sent", "Your mentorship request is now pending mentor approval.");
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
      <ScrollView
        contentContainerStyle={[styles.content, responsiveContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <AppHeader
          title="Mentorship Request"
          subtitle={`To ${mentor.name}`}
          showHomeAction
          onPressHome={() => navigation.goBack()}
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connection status</Text>
          <Text style={styles.status}>
            {requestStatus === "none" ? "No request sent yet" : `Current status: ${requestStatus}`}
          </Text>

          <Text style={styles.label}>Goals</Text>
          <TextInput
            value={goals}
            onChangeText={setGoals}
            placeholder="What do you want help with?"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />

          <Text style={styles.label}>Intro note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Tell your mentor your current level and target outcome."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.noteInput]}
            multiline
          />
        </View>

        {(requestStatus === "none" || requestStatus === "declined") ? (
          <AnimatedButton
            label="Send Request"
            onPress={submitRequest}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        ) : null}

        {requestStatus === "pending" ? (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingText}>
              Your request is pending. Chat and call will unlock after acceptance.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Simulate mentor acceptance"
              onPress={() =>
                updateMentorshipRequestStatus({
                  mentorId: mentor.id,
                  status: "accepted",
                })
              }
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
            >
              <Text style={styles.secondaryText}>Simulate Acceptance</Text>
            </Pressable>
          </View>
        ) : null}

        {requestStatus === "accepted" ? (
          <AnimatedButton
            label="Open Chat"
            onPress={() => navigation.navigate("MentorChat", { mentorId: mentor.id })}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPurple,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  status: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textTransform: "capitalize",
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "800",
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    color: colors.textPrimary,
    minHeight: 72,
    padding: spacing.md,
    textAlignVertical: "top",
    fontSize: typography.body,
    fontWeight: "600",
  },
  noteInput: {
    minHeight: 104,
  },
  primaryButton: {
    marginTop: spacing.md,
  },
  primaryButtonText: {
    fontSize: typography.subheading,
  },
  pendingCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow.soft,
  },
  pendingText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    backgroundColor: colors.pastelBlue,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  secondaryPressed: {
    opacity: 0.8,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "800",
  },
});
