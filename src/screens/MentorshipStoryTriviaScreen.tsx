import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import MotiPressable from "../components/SoundMotiPressable";
import {
  type MentorshipStoryTriviaQuestion,
} from "../data/mentorshipStories";
import { useMentorshipStoryCatalog } from "../hooks/useMentorshipStoryCatalog";
import { backToMentorshipStoryDetail } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MentorshipStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<MentorshipStackParamList, "MentorshipStoryTrivia">;

type TriviaPhase = "intro" | "playing" | "result";

const QUESTIONS_PER_SESSION = 10;
const SCORE_PER_CORRECT = 10;

function shuffleArray<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sampleSessionQuestions(pool: MentorshipStoryTriviaQuestion[], count: number) {
  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

export default function MentorshipStoryTriviaScreen({ navigation, route }: Props) {
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

  const [phase, setPhase] = useState<TriviaPhase>("intro");
  const [sessionSeed, setSessionSeed] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedByQuestionIndex, setSelectedByQuestionIndex] = useState<Record<number, number>>({});

  const sessionQuestions = useMemo(
    () =>
      story ? sampleSessionQuestions(story.triviaPool, QUESTIONS_PER_SESSION) : [],
    [story, sessionSeed],
  );

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const selectedOptionIndex = selectedByQuestionIndex[currentQuestionIndex];
  const isCurrentAnswered = selectedOptionIndex !== undefined;
  const isCurrentCorrect =
    currentQuestion && selectedOptionIndex === currentQuestion.correctOptionIndex;
  const isLastQuestion = currentQuestionIndex >= sessionQuestions.length - 1;

  const correctAnswers = useMemo(
    () =>
      sessionQuestions.reduce((count, question, idx) => {
        const selected = selectedByQuestionIndex[idx];
        if (selected === question.correctOptionIndex) {
          return count + 1;
        }
        return count;
      }, 0),
    [selectedByQuestionIndex, sessionQuestions],
  );

  const score = correctAnswers * SCORE_PER_CORRECT;
  const maxScore = sessionQuestions.length * SCORE_PER_CORRECT;
  const accuracyPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const resetSession = () => {
    setCurrentQuestionIndex(0);
    setSelectedByQuestionIndex({});
    setSessionSeed((seed) => seed + 1);
    setPhase("intro");
  };

  const handleStartTrivia = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentQuestionIndex(0);
    setSelectedByQuestionIndex({});
    setPhase("playing");
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion || isCurrentAnswered) {
      return;
    }
    setSelectedByQuestionIndex((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
    const wasCorrect = optionIndex === currentQuestion.correctOptionIndex;
    if (wasCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleNextQuestion = () => {
    if (!isCurrentAnswered) {
      return;
    }
    if (isLastQuestion) {
      setPhase("result");
      return;
    }
    setCurrentQuestionIndex((idx) => idx + 1);
  };

  if (!story) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title="Story Trivia"
            subtitle="Story not found"
            showHomeAction
            onPressHome={() => backToMentorshipStoryDetail(rootNavigation, route.params.storyId)}
          />
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Missing Story</Text>
            <Text style={styles.bodyText}>
              We could not load trivia for this profile. Return to the story list.
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
          title={`${story.name} Trivia`}
          subtitle="Random 10 from 50 story questions"
          showHomeAction
          onPressHome={() => backToMentorshipStoryDetail(rootNavigation, route.params.storyId)}
        />

        {phase === "intro" ? (
          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 100 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Story Trivia Session</Text>
            <Text style={styles.bodyText}>
              This session draws 10 random questions from a 50-question profile pool. Replay to
              get a different set and reinforce retention.
            </Text>
            <Text style={styles.metaText}>
              Pool size: {story.triviaPool.length} • Session size: {sessionQuestions.length}
            </Text>
            <MotiPressable
              accessibilityRole="button"
              onPress={handleStartTrivia}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Start Trivia</Text>
            </MotiPressable>
          </MotiView>
        ) : null}

        {phase === "playing" && currentQuestion ? (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 100 }}
            style={styles.card}
          >
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} / {sessionQuestions.length}
              </Text>
              <Text style={styles.progressText}>Score: {score}</Text>
            </View>

            <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

            <View style={styles.optionsWrap}>
              {currentQuestion.options.map((option, optionIdx) => {
                const selected = selectedOptionIndex === optionIdx;
                const isCorrectChoice = optionIdx === currentQuestion.correctOptionIndex;
                const showCorrect = isCurrentAnswered && isCorrectChoice;
                const showWrong = isCurrentAnswered && selected && !isCorrectChoice;

                return (
                  <MotiPressable
                    key={`${currentQuestion.id}-${option}`}
                    accessibilityRole="button"
                    onPress={() => handleSelectOption(optionIdx)}
                    animate={({ pressed }) => {
                      "worklet";
                      return { scale: pressed ? 0.98 : 1 };
                    }}
                    style={[
                      styles.optionButton,
                      selected && styles.optionButtonSelected,
                      showCorrect && styles.optionButtonCorrect,
                      showWrong && styles.optionButtonWrong,
                    ]}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </MotiPressable>
                );
              })}
            </View>

            {isCurrentAnswered ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>
                  {isCurrentCorrect ? "Correct answer." : "Not correct."}
                </Text>
                <Text style={styles.feedbackText}>{currentQuestion.explanation}</Text>
              </View>
            ) : null}

            <MotiPressable
              accessibilityRole="button"
              onPress={handleNextQuestion}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={[
                styles.primaryButton,
                !isCurrentAnswered && styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isLastQuestion ? "Finish Trivia" : "Next Question"}
              </Text>
            </MotiPressable>
          </MotiView>
        ) : null}

        {phase === "result" ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 100 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Session Complete</Text>
            <Text style={styles.resultScore}>{score}/{maxScore}</Text>
            <Text style={styles.bodyText}>
              {correctAnswers} correct answers ({accuracyPercent}% accuracy)
            </Text>

            <MotiPressable
              accessibilityRole="button"
              onPress={resetSession}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Play New Random Set</Text>
            </MotiPressable>

            <MotiPressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("MentorshipStoryDetail", { storyId: story.id })}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Back to Story</Text>
            </MotiPressable>
          </MotiView>
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
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow.card,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  optionsWrap: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  optionButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionButtonSelected: {
    borderColor: colors.ctaPrimary,
    backgroundColor: colors.pastelYellow,
  },
  optionButtonCorrect: {
    borderColor: "#20A17A",
    backgroundColor: "#E8F8F3",
  },
  optionButtonWrong: {
    borderColor: "#D64545",
    backgroundColor: "#FDECEC",
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
  },
  feedbackCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  feedbackTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
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
    paddingVertical: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
  resultScore: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: "900",
    marginTop: spacing.md,
  },
});
