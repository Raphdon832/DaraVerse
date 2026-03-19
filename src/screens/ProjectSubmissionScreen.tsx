import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import { useAppState } from "../context/AppStateContext";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { ProjectsStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<ProjectsStackParamList, "ProjectSubmission">;

export default function ProjectSubmissionScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const { state, setProjectStatus } = useAppState();
  const { projects: projectCatalog } = state.catalogs;
  const project = projectCatalog.find((item) => item.id === projectId);
  const rootNavigation = useRootNavigation();
  const [submissionNotes, setSubmissionNotes] = useState("");

  if (!project) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.content}>
          <AppHeader
            title="Project Submission"
            subtitle="Project not found"
            showHomeAction
            onPressHome={() => rootNavigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

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
      >
        <AppHeader
          title="Project Submission"
          subtitle={project.title}
          showHomeAction
          onPressHome={() => rootNavigation.goBack()}
        />

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100 }}
          style={styles.card}
        >
          <Text style={styles.label}>Submission Notes</Text>
          <TextInput
            multiline
            numberOfLines={6}
            onChangeText={setSubmissionNotes}
            placeholder="Summarize what you built, challenges you solved, and final result."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            textAlignVertical="top"
            value={submissionNotes}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 200 }}
        >
          <MotiPressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setProjectStatus({ projectId, status: "submitted" });
              navigation.navigate("ProjectsHome");
            }}
            animate={useMemo(
              () =>
                ({ pressed }) => {
                  "worklet";
                  return { scale: pressed ? 0.95 : 1 };
                },
              []
            )}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryText}>Confirm Submission</Text>
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
    backgroundColor: colors.pastelPeach,
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
    borderRadius: 30,
    padding: spacing.xl,
    ...shadow.card,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgSoft,
    borderRadius: 24,
    color: colors.textPrimary,
    fontSize: typography.body,
    minHeight: 140,
    padding: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: 30,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  primaryText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
});
