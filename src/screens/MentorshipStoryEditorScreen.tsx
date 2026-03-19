import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../context/AuthContext";
import {
  type StoryGender,
  type StoryHeritageFocus,
} from "../data/mentorshipStories";
import { useMentorshipStoryCatalog } from "../hooks/useMentorshipStoryCatalog";
import {
  upsertMentorshipStoryAsAdmin,
  type UpsertMentorshipStoryInput,
} from "../services/mentorshipStoryService";
import { subscribeUserRole, type UserRole } from "../services/userService";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorshipStoryEditor">;

const heritageOptions: StoryHeritageFocus[] = [
  "nigerian",
  "african",
  "global_african_descent",
  "global",
];

const heritageLabels: Record<StoryHeritageFocus, string> = {
  nigerian: "Nigerian",
  african: "African",
  global_african_descent: "Global African",
  global: "Global",
};

const genderOptions: StoryGender[] = ["female", "male"];

function toParagraphText(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}

export default function MentorshipStoryEditorScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { storyById } = useMentorshipStoryCatalog({ includeHidden: true });
  const editingStoryId = route.params?.storyId;
  const editingStory = editingStoryId ? storyById[editingStoryId] : undefined;

  const [userRole, setUserRole] = useState<UserRole>("learner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didInitialize, setDidInitialize] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<StoryGender>("female");
  const [origin, setOrigin] = useState("");
  const [heritageFocus, setHeritageFocus] = useState<StoryHeritageFocus>("global");
  const [domainA, setDomainA] = useState("");
  const [domainB, setDomainB] = useState("");
  const [signature, setSignature] = useState("");
  const [contribution, setContribution] = useState("");
  const [impact, setImpact] = useState("");
  const [lesson, setLesson] = useState("");
  const [title, setTitle] = useState("");
  const [shortBlurb, setShortBlurb] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [storyText, setStoryText] = useState("");

  const isAdmin = userRole === "admin";
  const isEditing = Boolean(editingStoryId);

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

  useEffect(() => {
    if (didInitialize) {
      return;
    }

    if (isEditing && !editingStory) {
      return;
    }

    if (editingStory) {
      setName(editingStory.name);
      setGender(editingStory.gender);
      setOrigin(editingStory.origin);
      setHeritageFocus(editingStory.heritageFocus);
      setDomainA(editingStory.domains[0] ?? "");
      setDomainB(editingStory.domains[1] ?? "");
      setSignature(editingStory.signature);
      setContribution(editingStory.contribution);
      setImpact(editingStory.impact);
      setLesson(editingStory.lesson);
      setTitle(editingStory.title);
      setShortBlurb(editingStory.shortBlurb);
      setImageUrl(editingStory.imageUrl ?? "");
      setStoryText(toParagraphText(editingStory.storyParagraphs));
    }

    setDidInitialize(true);
  }, [didInitialize, editingStory, isEditing]);

  const missingEditingStory = isEditing && !editingStory && didInitialize;

  const canSubmit = useMemo(
    () => isAdmin && !isSubmitting,
    [isAdmin, isSubmitting],
  );

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Authentication required", "Please sign in as an admin.");
      return;
    }
    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admin users can manage stories.");
      return;
    }

    const parsedParagraphs = storyText
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const requiredErrors: string[] = [];
    if (name.trim().length < 2) requiredErrors.push("Name");
    if (origin.trim().length < 2) requiredErrors.push("Origin");
    if (domainA.trim().length < 2) requiredErrors.push("Primary domain");
    if (domainB.trim().length < 2) requiredErrors.push("Secondary domain");
    if (signature.trim().length < 2) requiredErrors.push("Signature");
    if (title.trim().length < 2) requiredErrors.push("Title");
    if (shortBlurb.trim().length < 12) requiredErrors.push("Short blurb");
    if (parsedParagraphs.length === 0) requiredErrors.push("Story paragraphs");

    if (requiredErrors.length > 0) {
      Alert.alert("Incomplete form", `Please complete: ${requiredErrors.join(", ")}`);
      return;
    }

    const payload: UpsertMentorshipStoryInput = {
      id: editingStory?.id,
      name: name.trim(),
      gender,
      origin: origin.trim(),
      heritageFocus,
      domains: [domainA.trim(), domainB.trim()],
      signature: signature.trim(),
      contribution: contribution.trim() || `advanced ${signature.trim()}`,
      impact: impact.trim() || `created positive change in ${domainA.trim().toLowerCase()}`,
      lesson: lesson.trim() || "Consistent execution creates durable impact.",
      title: title.trim(),
      shortBlurb: shortBlurb.trim(),
      imageUrl: imageUrl.trim() || undefined,
      storyParagraphs: parsedParagraphs,
      triviaPool: editingStory?.triviaPool,
      hidden: editingStory?.adminHidden ?? false,
    };

    setIsSubmitting(true);
    try {
      await upsertMentorshipStoryAsAdmin(user.uid, payload);
      Alert.alert(
        isEditing ? "Story updated" : "Story added",
        "Changes are now available in the mentorship stories library.",
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Unable to save story",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            title={isEditing ? "Edit Story" : "Add Story"}
            subtitle="Admin only"
            showHomeAction
            onPressHome={() => navigation.goBack()}
          />

          {!isAdmin ? (
            <View style={styles.lockedCard}>
              <Text style={styles.lockedTitle}>Admin access required</Text>
              <Text style={styles.lockedText}>
                Only users with `role = admin` can add or edit mentorship stories.
              </Text>
            </View>
          ) : null}

          {missingEditingStory ? (
            <View style={styles.lockedCard}>
              <Text style={styles.lockedTitle}>Story not found</Text>
              <Text style={styles.lockedText}>
                The selected story could not be loaded for editing.
              </Text>
            </View>
          ) : null}

          {isAdmin && !missingEditingStory ? (
            <View style={styles.formCard}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionRow}>
                {genderOptions.map((option) => {
                  const active = gender === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      onPress={() => setGender(option)}
                      style={[
                        styles.optionChip,
                        active && styles.optionChipActive,
                      ]}
                    >
                      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                        {option === "female" ? "Female" : "Male"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Origin</Text>
              <TextInput
                value={origin}
                onChangeText={setOrigin}
                placeholder="Country or region"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Priority focus</Text>
              <View style={styles.optionRowWrap}>
                {heritageOptions.map((option) => {
                  const active = heritageFocus === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      onPress={() => setHeritageFocus(option)}
                      style={[
                        styles.optionChip,
                        active && styles.optionChipActive,
                      ]}
                    >
                      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                        {heritageLabels[option]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Primary domain</Text>
              <TextInput
                value={domainA}
                onChangeText={setDomainA}
                placeholder="e.g. Science"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Secondary domain</Text>
              <TextInput
                value={domainB}
                onChangeText={setDomainB}
                placeholder="e.g. Leadership"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Signature area</Text>
              <TextInput
                value={signature}
                onChangeText={setSignature}
                placeholder="e.g. medical safety reforms"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Contribution</Text>
              <TextInput
                value={contribution}
                onChangeText={setContribution}
                placeholder="How this person contributed"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                multiline
              />

              <Text style={styles.label}>Impact</Text>
              <TextInput
                value={impact}
                onChangeText={setImpact}
                placeholder="Long-term positive outcomes"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                multiline
              />

              <Text style={styles.label}>Mentorship lesson</Text>
              <TextInput
                value={lesson}
                onChangeText={setLesson}
                placeholder="Actionable learner takeaway"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                multiline
              />

              <Text style={styles.label}>Card title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Story title"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Short blurb</Text>
              <TextInput
                value={shortBlurb}
                onChangeText={setShortBlurb}
                placeholder="Summary shown on story card"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                multiline
              />

              <Text style={styles.label}>Image URL (optional)</Text>
              <TextInput
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Story paragraphs</Text>
              <Text style={styles.helperText}>
                Separate each paragraph with a blank line.
              </Text>
              <TextInput
                value={storyText}
                onChangeText={setStoryText}
                placeholder="Write the full story content..."
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.longTextArea]}
                multiline
                textAlignVertical="top"
              />
            </View>
          ) : null}

          {isAdmin && !missingEditingStory ? (
            <AnimatedButton
              label={isSubmitting ? "Saving..." : isEditing ? "Save Story" : "Add Story"}
              onPress={handleSave}
              disabled={!canSubmit}
              style={styles.submitButton}
              textStyle={styles.submitText}
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
  formCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "800",
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  textArea: {
    minHeight: 84,
  },
  longTextArea: {
    minHeight: 180,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  optionRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  optionChip: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  optionChipActive: {
    backgroundColor: colors.ctaPrimary,
  },
  optionChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  optionChipTextActive: {
    color: colors.textInverse,
  },
  submitButton: {
    borderRadius: radius.pill,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  submitText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
  },
});
