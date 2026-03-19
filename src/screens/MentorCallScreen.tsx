import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import Pressable from "../components/SoundPressable";
import { useAppState } from "../context/AppStateContext";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorCall">;

export default function MentorCallScreen({ navigation, route }: Props) {
  const { state, scheduleMentorCall } = useAppState();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const mentor = state.catalogs.mentors.find((item) => item.id === route.params.mentorId);
  const requestStatus = state.mentorshipRequests[route.params.mentorId]?.status ?? "none";
  const calls = useMemo(
    () => state.mentorshipCalls[route.params.mentorId] ?? [],
    [route.params.mentorId, state.mentorshipCalls],
  );

  if (!mentor) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.content}>
          <AppHeader
            title="Call Unavailable"
            subtitle="Mentor not found"
            showHomeAction
            onPressHome={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isUnlocked = requestStatus === "accepted";
  const slots = mentor.availabilitySlots ?? [mentor.openSlotsLabel];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={`${mentor.name} Call`}
          subtitle="Schedule an in-app call"
          showHomeAction
          onPressHome={() => navigation.goBack()}
        />

        {!isUnlocked ? (
          <View style={styles.lockCard}>
            <Text style={styles.lockTitle}>Call scheduling is locked.</Text>
            <Text style={styles.lockBody}>
              Calls are available only after mentor acceptance.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Available slots</Text>
              <View style={styles.slotList}>
                {slots.map((slot) => {
                  const selected = selectedSlot === slot;
                  return (
                    <Pressable
                      key={slot}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${slot}`}
                      onPress={() => setSelectedSlot(slot)}
                      style={({ pressed }) => [
                        styles.slotButton,
                        selected && styles.slotButtonSelected,
                        pressed && styles.slotButtonPressed,
                      ]}
                    >
                      <Text style={[styles.slotText, selected && styles.slotTextSelected]}>{slot}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Schedule selected slot"
              onPress={() => {
                if (!selectedSlot) {
                  return;
                }
                scheduleMentorCall({
                  mentorId: mentor.id,
                  slotLabel: selectedSlot,
                });
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                (!selectedSlot || pressed) && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Schedule Call</Text>
            </Pressable>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Upcoming calls</Text>
              {calls.length === 0 ? (
                <Text style={styles.emptyText}>No calls scheduled yet.</Text>
              ) : (
                calls.map((call) => (
                  <View key={call.id} style={styles.callRow}>
                    <Text style={styles.callSlot}>{call.slotLabel}</Text>
                    <Text style={styles.callMeta}>Status: {call.status}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
    marginBottom: spacing.sm,
  },
  slotList: {
    gap: spacing.sm,
  },
  slotButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  slotButtonSelected: {
    backgroundColor: colors.pastelBlue,
    borderWidth: 1,
    borderColor: colors.ctaPrimary,
  },
  slotButtonPressed: {
    opacity: 0.85,
  },
  slotText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
  },
  slotTextSelected: {
    color: colors.ctaPrimary,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    justifyContent: "center",
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    ...shadow.fab,
  },
  primaryButtonPressed: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
  },
  callRow: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  callSlot: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
  },
  callMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.xxs,
    textTransform: "capitalize",
  },
});
