import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import FeatureCard from "../components/FeatureCard";
import SearchField from "../components/SearchField";
import Pressable from "../components/SoundPressable";
import { useAuth } from "../context/AuthContext";
import { type StoryHeritageFocus } from "../data/mentorshipStories";
import { useMentorshipStoryCatalog } from "../hooks/useMentorshipStoryCatalog";
import { backToMentorshipHome } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { subscribeUserRole, type UserRole } from "../services/userService";
import { colors, radius, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorshipStories">;

type FocusFilter = "all" | StoryHeritageFocus;
const STORIES_PER_PAGE = 10;

const focusFilterLabels: Record<FocusFilter, string> = {
  all: "All",
  nigerian: "Nigerian",
  african: "African",
  global_african_descent: "Global African",
  global: "Global",
};

function includesNormalized(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export default function MentorshipStoriesScreen({ navigation }: Props) {
  const rootNavigation = useRootNavigation();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>("learner");
  const [search, setSearch] = useState("");
  const [focusFilter, setFocusFilter] = useState<FocusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { stories, counts } = useMentorshipStoryCatalog();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };
  const isAdmin = userRole === "admin";

  const visibleStories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stories
      .filter((story) => {
        if (focusFilter === "all") return true;
        return story.heritageFocus === focusFilter;
      })
      .filter((story) => {
        if (!query) return true;
        return (
          includesNormalized(story.name, query) ||
          includesNormalized(story.origin, query) ||
          includesNormalized(story.domains.join(" "), query) ||
          includesNormalized(story.signature, query)
        );
      })
      .sort((a, b) => {
        const focusWeight = (focus: StoryHeritageFocus) => {
          if (focus === "nigerian") return 4;
          if (focus === "african") return 3;
          if (focus === "global_african_descent") return 2;
          return 1;
        };
        const byFocus = focusWeight(b.heritageFocus) - focusWeight(a.heritageFocus);
        if (byFocus !== 0) return byFocus;
        if (a.gender !== b.gender) {
          return a.gender === "female" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  }, [focusFilter, search, stories]);

  const totalPages = Math.max(1, Math.ceil(visibleStories.length / STORIES_PER_PAGE));
  const pageStart = (currentPage - 1) * STORIES_PER_PAGE;
  const pageEnd = Math.min(pageStart + STORIES_PER_PAGE, visibleStories.length);

  const pagedStories = useMemo(
    () => visibleStories.slice(pageStart, pageEnd),
    [pageEnd, pageStart, visibleStories],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [focusFilter, search]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={[styles.headerContainer, responsiveContainerStyle]}>
        <AppHeader
          title="Mentorship Stories"
          subtitle={`${counts.total} biographies with story trivia`}
          showHomeAction
          onPressHome={() => backToMentorshipHome(rootNavigation)}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, responsiveContainerStyle]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickySearchWrap}>
          <SearchField
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, origin, domain, or impact area"
            onClearPress={() => setSearch("")}
          />
          {isAdmin ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open admin story management"
              onPress={() => navigation.navigate("ManageMentorshipStories")}
              style={({ pressed }) => [
                styles.adminButton,
                pressed && styles.adminButtonPressed,
              ]}
            >
              <Text style={styles.adminButtonText}>Manage Stories (Admin)</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          {(Object.keys(focusFilterLabels) as FocusFilter[]).map((filter) => {
            const active = focusFilter === filter;
            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${focusFilterLabels[filter]}`}
                onPress={() => setFocusFilter(filter)}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {focusFilterLabels[filter]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.resultsMeta}>
          {visibleStories.length === 0
            ? "Showing 0 stories"
            : `Showing ${pageStart + 1}-${pageEnd} of ${visibleStories.length} stories | Page ${currentPage}/${totalPages}`}
        </Text>

        {pagedStories.map((story, index) => (
          <MotiView
            key={story.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: Math.min(180, index * 16) }}
          >
            <FeatureCard
              title={story.name}
              subtitle={`${story.origin} • ${story.domains.join(" + ")}`}
              meta={`${story.signature} • ${story.gender === "female" ? "Female focus" : "Male profile"}`}
              backgroundImage={story.imageUrl ? { uri: story.imageUrl } : undefined}
              accentColor={
                story.heritageFocus === "nigerian"
                  ? colors.pastelGreen
                  : story.heritageFocus === "african"
                    ? colors.pastelYellow
                    : story.heritageFocus === "global_african_descent"
                      ? colors.pastelPurple
                      : colors.pastelBlue
              }
              onPress={() => navigation.navigate("MentorshipStoryDetail", { storyId: story.id })}
            />
          </MotiView>
        ))}

        {visibleStories.length > 0 ? (
          <View style={styles.paginationRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous page"
              accessibilityState={{ disabled: currentPage === 1 }}
              onPress={() => {
                if (currentPage === 1) return;
                setCurrentPage((page) => Math.max(1, page - 1));
              }}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.pageButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </Pressable>

            <Text style={styles.pageText}>
              {currentPage} / {totalPages}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next page"
              accessibilityState={{ disabled: currentPage === totalPages }}
              onPress={() => {
                if (currentPage === totalPages) return;
                setCurrentPage((page) => Math.min(totalPages, page + 1));
              }}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.pageButtonTextDisabled,
                ]}
              >
                Next
              </Text>
            </Pressable>
          </View>
        ) : null}

        {visibleStories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No stories matched this filter</Text>
            <Text style={styles.emptySubtitle}>
              Try another filter or clear your search to view the full 100-story library.
            </Text>
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
    paddingHorizontal: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  stickySearchWrap: {
    backgroundColor: colors.pastelPurple,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    zIndex: 1,
  },
  adminButton: {
    alignItems: "center",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    justifyContent: "center",
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  adminButtonPressed: {
    backgroundColor: colors.ctaPrimaryPressed,
  },
  adminButtonText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: colors.ctaPrimary,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  resultsMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  paginationRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  pageButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pageButtonDisabled: {
    backgroundColor: colors.bgSoft,
  },
  pageButtonText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  pageButtonTextDisabled: {
    color: colors.textSecondary,
  },
  pageText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
});
