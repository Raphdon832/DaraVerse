import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import Pressable from "../components/SoundPressable";
import { useAppState } from "../context/AppStateContext";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorChat">;

export default function MentorChatScreen({ navigation, route }: Props) {
  const { state, sendMentorshipMessage } = useAppState();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const [draft, setDraft] = useState("");

  const mentor = state.catalogs.mentors.find((item) => item.id === route.params.mentorId);
  const requestStatus = state.mentorshipRequests[route.params.mentorId]?.status ?? "none";
  const messages = useMemo(
    () => state.mentorshipMessages[route.params.mentorId] ?? [],
    [state.mentorshipMessages, route.params.mentorId],
  );
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  const isUnlocked = requestStatus === "accepted";

  if (!mentor) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title="Chat Unavailable"
            subtitle="Mentor not found"
            showHomeAction
            onPressHome={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isUnlocked) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title={`${mentor.name} Chat`}
            subtitle="Locked"
            showHomeAction
            onPressHome={() => navigation.goBack()}
          />
          <View style={styles.lockCard}>
            <Text style={styles.lockTitle}>Chat unlocks after mentor acceptance.</Text>
            <Text style={styles.lockBody}>
              Send a mentorship request first, then wait for status to become accepted.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go to mentor profile"
              onPress={() => navigation.navigate("MentorProfile", { mentorId: mentor.id })}
              style={({ pressed }) => [styles.lockButton, pressed && styles.lockButtonPressed]}
            >
              <Text style={styles.lockButtonText}>Back to Profile</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    sendMentorshipMessage({ mentorId: mentor.id, text });
    setDraft("");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title={`${mentor.name} Chat`}
            subtitle="Mentorship conversation"
            showHomeAction
            onPressHome={() => navigation.goBack()}
          />

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            renderItem={({ item }) => {
              const isMentee = item.senderRole === "mentee";
              return (
                <View style={[styles.bubble, isMentee ? styles.menteeBubble : styles.mentorBubble]}>
                  <Text style={styles.bubbleText}>{item.text}</Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No messages yet. Start with your first question.</Text>
            }
          />
        </View>

        <View style={responsiveContainerStyle}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask your mentor a question..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={sendMessage}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.sendButtonPressed,
              ]}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPurple,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  lockCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    ...shadow.card,
  },
  lockTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  lockBody: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  lockButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  lockButtonPressed: {
    backgroundColor: colors.ctaPrimaryPressed,
  },
  lockButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
  },
  messagesContainer: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  bubble: {
    borderRadius: radius.lg,
    maxWidth: "82%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  mentorBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.bgSurface,
  },
  menteeBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.ctaPrimary,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.lg,
    textAlign: "center",
  },
  composer: {
    alignItems: "flex-end",
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    ...shadow.soft,
  },
  input: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.body,
    maxHeight: 120,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    textAlignVertical: "top",
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  sendButtonPressed: {
    backgroundColor: colors.ctaPrimaryPressed,
  },
  sendButtonText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "800",
  },
});
