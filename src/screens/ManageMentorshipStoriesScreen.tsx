import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import AnimatedButton from "../components/AnimatedButton";
import Pressable from "../components/SoundPressable";
import SearchField from "../components/SearchField";
import { useAuth } from "../context/AuthContext";
import { useMentorshipStoryCatalog } from "../hooks/useMentorshipStoryCatalog";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import {
  removeMentorshipStoryAsAdmin,
  setMentorshipStoryHiddenAsAdmin,
  type MentorshipStoryCatalogItem,
} from "../services/mentorshipStoryService";
import { subscribeUserRole, type UserRole } from "../services/userService";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "ManageMentorshipStories">;

function includesNormalized(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export default function ManageMentorshipStoriesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { allStories } = useMentorshipStoryCatalog({ includeHidden: true });
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const [userRole, setUserRole] = useState<UserRole>("learner");
  const [search, setSearch] = useState("");
  const [busyStoryId, setBusyStoryId] = useState<string | null>(null);
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!user) {
      setUserRole("learner");
      return;
    }

    const unsubscribe = subscribeUserRole(user.uid, (role) => {
      setUserRole(role);
    });

    return unsubscribe;
  }, [user]);

  const filteredStories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allStories
      .filter((story) => {
        if (!query) return true;
        return (
          includesNormalized(story.name, query) ||
          includesNormalized(story.origin, query) ||
          includesNormalized(story.domains.join(" "), query) ||
          includesNormalized(story.signature, query)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allStories, search]);

  const withAuthGuard = async (task: () => Promise<void>) => {
    if (!user) {
      Alert.alert("Authentication required", "Please sign in as an admin.");
      return;
    }
    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admin users can manage stories.");
      return;
    }
    await task();
  };

  const handleToggleHidden = async (story: MentorshipStoryCatalogItem) => {
    await withAuthGuard(async () => {
      setBusyStoryId(story.id);
      try {
        await setMentorshipStoryHiddenAsAdmin(user!.uid, story.id, !story.adminHidden);
      } catch (error) {
        Alert.alert(
          "Unable to update visibility",
          error instanceof Error ? error.message : "Please try again.",
        );
      } finally {
        setBusyStoryId(null);
      }
    });
  };

  const handleRemove = (story: MentorshipStoryCatalogItem) => {
    const message =
      story.adminSource === "base"
        ? "This will remove this built-in story from the library for all users."
        : "This will permanently delete this custom story.";

    Alert.alert("Remove story?", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          void withAuthGuard(async () => {
            setBusyStoryId(story.id);
            try {
              await removeMentorshipStoryAsAdmin(user!.uid, story.id, story.adminSource);
            } catch (error) {
              Alert.alert(
                "Unable to remove story",
                error instanceof Error ? error.message : "Please try again.",
              );
            } finally {
              setBusyStoryId(null);
            }
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Manage Stories"
          subtitle="Admin controls"
          showHomeAction
          onPressHome={() => navigation.goBack()}
        />

        {!isAdmin ? (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>Admin access required</Text>
            <Text style={styles.lockedText}>
              Only users with `role = admin` can add, edit, hide, or remove mentorship stories.
            </Text>
          </View>
        ) : (
          <>
            <AnimatedButton
              label="Add New Story"
              onPress={() => navigation.navigate("MentorshipStoryEditor")}
              style={styles.addButton}
              textStyle={styles.addButtonText}
            />

            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, origin, domain, or signature"
              onClearPress={() => setSearch("")}
            />

            <Text style={styles.resultsMeta}>
              Showing {filteredStories.length} story
              {filteredStories.length === 1 ? "" : "ies"}
            </Text>

            {filteredStories.map((story) => {
              const isBusy = busyStoryId === story.id;
              return (
                <View key={story.id} style={styles.storyCard}>
                  <Text style={styles.storyName}>{story.name}</Text>
                  <Text style={styles.storyMeta}>
                    {story.origin} • {story.domains.join(" + ")}
                  </Text>
                  <Text style={styles.storyMeta}>{story.signature}</Text>

                  <View style={styles.chipRow}>
                    <View
                      style={[
                        styles.statusChip,
                        story.adminHidden ? styles.hiddenChip : styles.visibleChip,
                      ]}
                    >
                      <Text style={styles.statusChipText}>
                        {story.adminHidden ? "Hidden" : "Visible"}
                      </Text>
                    </View>
                    <View style={styles.statusChip}>
                      <Text style={styles.statusChipText}>
                        {story.adminSource === "base" ? "Base story" : "Custom story"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => navigation.navigate("MentorshipStoryEditor", { storyId: story.id })}
                      style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.actionButtonPressed,
                      ]}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        if (isBusy) return;
                        void handleToggleHidden(story);
                      }}
                      style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.actionButtonPressed,
                        isBusy && styles.actionButtonDisabled,
                      ]}
                    >
                      <Text style={styles.actionButtonText}>
                        {story.adminHidden ? "Unhide" : "Hide"}
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        if (isBusy) return;
                        handleRemove(story);
                      }}
                      style={({ pressed }) => [
                        styles.actionButtonDanger,
                        pressed && styles.actionButtonPressed,
                        isBusy && styles.actionButtonDisabled,
                      ]}
                    >
                      <Text style={styles.actionButtonDangerText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {filteredStories.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No stories matched your search.</Text>
                <Text style={styles.emptyText}>
                  Clear the search to view all mentorship stories.
                </Text>
              </View>
            ) : null}
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
  lockedCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    ...shadow.card,
  },
  lockedTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "900",
    marginBottom: spacing.xs,
  },
  lockedText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  addButton: {
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
  },
  resultsMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  storyCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadow.card,
  },
  storyName: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
  },
  storyMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  statusChip: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  visibleChip: {
    backgroundColor: colors.pastelGreen,
  },
  hiddenChip: {
    backgroundColor: colors.pastelYellow,
  },
  statusChipText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  actionButtonDanger: {
    alignItems: "center",
    backgroundColor: "#B33939",
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  actionButtonPressed: {
    opacity: 0.82,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  actionButtonDangerText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
});
