import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedButton from "../components/AnimatedButton";
import AppHeader from "../components/AppHeader";
import Pressable from "../components/SoundPressable";
import { useAppState } from "../context/AppStateContext";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorProfile">;

const statusLabels = {
  none: "No request yet",
  pending: "Request pending",
  accepted: "Mentorship active",
  declined: "Request declined",
} as const;

export default function MentorProfileScreen({ navigation, route }: Props) {
  const { state, updateMentorshipRequestStatus } = useAppState();
  const mentor = state.catalogs.mentors.find((item) => item.id === route.params.mentorId);
  const requestStatus = state.mentorshipRequests[route.params.mentorId]?.status ?? "none";

  if (!mentor) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader
            title="Mentor Not Found"
            subtitle="This mentor may have been removed"
            showHomeAction
            onPressHome={() => navigation.goBack()}
          />
          <Text style={styles.missingText}>Unable to load mentor details.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const expertise = mentor.expertiseTags ?? [mentor.specialty];
  const languages = mentor.languages?.join(", ") ?? "English";
  const availability = mentor.availabilitySlots?.join(" • ") ?? mentor.openSlotsLabel;
  const responseTime = mentor.responseTimeLabel ?? "Usually replies in under 24 hours";

  const canChatAndCall = requestStatus === "accepted";

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={mentor.name}
          subtitle="Mentor Profile"
          showHomeAction
          onPressHome={() => navigation.goBack()}
        />

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{mentor.specialty}</Text>
          <Text style={styles.heroDescription}>{mentor.description}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusLabels[requestStatus]}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionBody}>
            {mentor.bio ?? `${mentor.name} supports learners with practical, goal-focused mentoring.`}
          </Text>
          <Text style={styles.metaLine}>Experience: {mentor.yearsExperience ?? 5}+ years</Text>
          <Text style={styles.metaLine}>Response time: {responseTime}</Text>
          <Text style={styles.metaLine}>Languages: {languages}</Text>
          <Text style={styles.metaLine}>Availability: {availability}</Text>
          {mentor.rating ? (
            <Text style={styles.metaLine}>
              Rating: {mentor.rating.toFixed(1)} / 5 ({mentor.totalReviews ?? 0} reviews)
            </Text>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Expertise</Text>
          <View style={styles.tagsRow}>
            {expertise.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {(requestStatus === "none" || requestStatus === "declined") ? (
          <AnimatedButton
            label="Request Mentorship"
            onPress={() => navigation.navigate("SessionBooking", { mentorId: mentor.id })}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        ) : null}

        {requestStatus === "pending" ? (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingText}>
              Request sent. Chat and calls unlock after mentor acceptance.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Simulate acceptance"
              onPress={() => {
                Alert.alert(
                  "Prototype Action",
                  "Approve this request to unlock chat and call features?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Approve",
                      onPress: () =>
                        updateMentorshipRequestStatus({
                          mentorId: mentor.id,
                          status: "accepted",
                        }),
                    },
                  ],
                );
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
            >
              <Text style={styles.secondaryButtonText}>Simulate Mentor Acceptance</Text>
            </Pressable>
          </View>
        ) : null}

        {canChatAndCall ? (
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open mentor chat"
              onPress={() => navigation.navigate("MentorChat", { mentorId: mentor.id })}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            >
              <Text style={styles.actionText}>Chat</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Schedule call"
              onPress={() => navigation.navigate("MentorCall", { mentorId: mentor.id })}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            >
              <Text style={styles.actionText}>Schedule Call</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pastelPurple,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  missingText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
    marginTop: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    ...shadow.card,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  heroDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.pastelGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  sectionBody: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  metaLine: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tagChip: {
    backgroundColor: colors.pastelBlue,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.subheading,
  },
  pendingBox: {
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
  secondaryButtonPressed: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    ...shadow.fab,
  },
  actionPressed: {
    backgroundColor: colors.ctaPrimaryPressed,
  },
  actionText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
  },
});
