import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import MotiPressable from "../components/SoundMotiPressable";
import {
  heritageLabel,
} from "../data/mentorshipStories";
import { useMentorshipStoryCatalog } from "../hooks/useMentorshipStoryCatalog";
import { backToMentorshipStories } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorshipStoryDetail">;

const pressScale = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.96 : 1 };
};

function splitStoryParagraph(paragraph: string) {
  const separatorIndex = paragraph.indexOf(":");
  if (separatorIndex <= 0) {
    return { heading: null as string | null, body: paragraph };
  }
  return {
    heading: paragraph.slice(0, separatorIndex).trim(),
    body: paragraph.slice(separatorIndex + 1).trim(),
  };
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export default function MentorshipStoryDetailScreen({ navigation, route }: Props) {
  const rootNavigation = useRootNavigation();
  const { storyById } = useMentorshipStoryCatalog({ includeHidden: true });
  const story = storyById[route.params.storyId];
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  if (!story) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title="Story Detail"
            subtitle="Story not found"
            showHomeAction
            onPressHome={() => backToMentorshipStories(rootNavigation)}
          />
          <View style={styles.card}>
            <Text style={styles.title}>Missing Story</Text>
            <Text style={styles.bodyText}>
              We could not load that profile. Please return to the stories list.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={story.name}
          subtitle={`${story.origin} • ${story.domains.join(" + ")}`}
          showHomeAction
          onPressHome={() => backToMentorshipStories(rootNavigation)}
        />

        <View style={styles.heroCard}>
          {story.imageUrl ? (
            <Image
              source={{ uri: story.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroImageFallback}>
              <Text style={styles.heroImageFallbackText}>{initialsFromName(story.name)}</Text>
            </View>
          )}
          <Text style={styles.heroTitle}>{story.title}</Text>
          <Text style={styles.heroBlurb}>{story.shortBlurb}</Text>
          {story.imageSourceTitle && story.imageSourceUrl ? (
            <Text style={styles.heroSourceText}>
              Image source: {story.imageSourceTitle}
            </Text>
          ) : null}

          <View style={styles.chipRow}>
            <View style={[styles.chip, styles.chipPrimary]}>
              <Text style={styles.chipText}>{heritageLabel[story.heritageFocus]}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {story.gender === "female" ? "Female profile" : "Male profile"}
              </Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>50 trivia questions</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Story</Text>
          {story.storyParagraphs.map((paragraph, index) => {
            const parsed = splitStoryParagraph(paragraph);
            return (
              <Text key={`${story.id}-story-${index}`} style={styles.bodyText}>
                {parsed.heading ? (
                  <Text style={styles.bodyHeading}>
                    {parsed.heading}
                    {": "}
                  </Text>
                ) : null}
                {parsed.body}
              </Text>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mentorship Lens</Text>
          <Text style={styles.bodyText}>
            Core contribution: {story.contribution}
          </Text>
          <Text style={styles.bodyText}>
            Positive impact: {story.impact}
          </Text>
          <Text style={styles.bodyText}>
            Learner lesson: {story.lesson}
          </Text>
        </View>

        <MotiPressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("MentorshipStoryTrivia", { storyId: story.id })}
          animate={pressScale}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Start Story Trivia (Random 10)</Text>
        </MotiPressable>

        <MotiPressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("MentorshipStories")}
          animate={pressScale}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Back to Story Library</Text>
        </MotiPressable>
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
  heroCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  heroImage: {
    borderRadius: radius.lg,
    height: 220,
    marginBottom: spacing.sm,
    width: "100%",
  },
  heroImageFallback: {
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    height: 220,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: "100%",
  },
  heroImageFallbackText: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: "900",
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  heroBlurb: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  heroSourceText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipPrimary: {
    backgroundColor: colors.pastelGreen,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  bodyHeading: {
    color: colors.textPrimary,
    fontWeight: "800",
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
});

