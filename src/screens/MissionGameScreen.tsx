import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import MotiPressable from "../components/SoundMotiPressable";
import { useAppState } from "../context/AppStateContext";
import { backToMissionDetail } from "../navigation/backNavigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { MissionsStackParamList } from "../types/navigation";
import ChessTacticsArenaVerticalSlice from "./ChessTacticsArenaVerticalSlice";
import SudokuSprintVerticalSlice from "./SudokuSprintVerticalSlice";

type Props = NativeStackScreenProps<MissionsStackParamList, "MissionGame">;

type GamePhase = "intro" | "playing" | "result";

const QUESTIONS_PER_SESSION = 8;
const SCORE_PER_CORRECT = 60;

function shuffleArray<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createSessionQuestionIds(questionCount: number) {
  const pool = Array.from({ length: questionCount }, (_, idx) => idx);
  return shuffleArray(pool).slice(0, Math.min(QUESTIONS_PER_SESSION, questionCount));
}

export default function MissionGameScreen({ navigation, route }: Props) {
  const { missionId } = route.params;
  const rootNavigation = useRootNavigation();
  const { state, completeMission } = useAppState();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const { missions: missionCatalog, missionGames } = state.catalogs;
  const mission = missionCatalog.find((m) => m.id === missionId);
  const game = missionGames.find((mg) => mg.missionId === missionId);
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [sessionSeed, setSessionSeed] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedByQuestionIndex, setSelectedByQuestionIndex] = useState<Record<number, number>>({});

  const sessionQuestionIndices = useMemo(
    () => (game ? createSessionQuestionIds(game.questions.length) : []),
    [game, sessionSeed],
  );

  const sessionQuestions = useMemo(
    () => (game ? sessionQuestionIndices.map((idx) => game.questions[idx]) : []),
    [game, sessionQuestionIndices],
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
  const maxScore = sessionQuestions.length * SCORE_PER_CORRECT;
  const score = correctAnswers * SCORE_PER_CORRECT;
  const accuracyPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const handleExitGame = useCallback(() => {
    backToMissionDetail(rootNavigation, missionId);
  }, [missionId, rootNavigation]);

  const handleSubmitMissionResult = useCallback(
    (sessionScore: number, sessionMaxScore: number) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeMission({ missionId, score: sessionScore });
      navigation.navigate("MissionReflection", {
        missionId,
        sessionScore,
        maxScore: sessionMaxScore,
      });
    },
    [completeMission, missionId, navigation],
  );

  if (!mission || !game) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.content, responsiveContainerStyle]}>
          <AppHeader
            title="Mission Game"
            subtitle="Game module unavailable"
            showHomeAction
            onPressHome={handleExitGame}
          />
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Game Not Found</Text>
            <Text style={styles.bodyText}>
              We could not find a playable game for `{missionId}`.
            </Text>
            <MotiPressable
              onPress={() => {
                navigation.navigate("MissionDetail", { missionId });
              }}
              animate={() => {
                "worklet";
                return { scale: 1 };
              }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </MotiPressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (missionId === "chess-tactics-m1") {
    return (
      <ChessTacticsArenaVerticalSlice
        missionTitle={mission.title}
        missionSubtitle={game.gameSubtitle}
        onExit={handleExitGame}
        onSubmitResult={handleSubmitMissionResult}
      />
    );
  }

  if (missionId === "sudoku-sprint-m1") {
    return (
      <SudokuSprintVerticalSlice
        missionTitle={mission.title}
        missionSubtitle={game.gameSubtitle}
        onExit={handleExitGame}
        onSubmitResult={handleSubmitMissionResult}
      />
    );
  }

  const resetSession = () => {
    setCurrentQuestionIndex(0);
    setSelectedByQuestionIndex({});
    setSessionSeed((seed) => seed + 1);
    setPhase("intro");
  };

  const handleStartGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase("playing");
    setCurrentQuestionIndex(0);
    setSelectedByQuestionIndex({});
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) {
      return;
    }
    if (isCurrentAnswered) {
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

  const handleCompleteMission = () => {
    handleSubmitMissionResult(score, maxScore);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, responsiveContainerStyle]} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={mission.title}
          subtitle={game.gameSubtitle}
          showHomeAction
          onPressHome={handleExitGame}
        />

        {phase === "intro" ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 100 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>{game.gameTitle}</Text>
            <Text style={styles.bodyText}>{game.summary}</Text>
            <Text style={styles.howTitle}>How to play</Text>
            {game.howToPlay.map((rule, idx) => (
              <Text key={rule} style={styles.ruleText}>
                {idx + 1}. {rule}
              </Text>
            ))}
            <Text style={styles.metaText}>
              Session length: {sessionQuestions.length} questions
            </Text>
            <MotiPressable
              accessibilityRole="button"
              onPress={handleStartGame}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Start Game</Text>
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
                  {isCurrentCorrect ? "Correct choice." : "Not quite right."}
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
                {isLastQuestion ? "Finish Game" : "Next Question"}
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
            <Text style={styles.sectionTitle}>Mission Complete</Text>
            <Text style={styles.resultScore}>{score}/{maxScore}</Text>
            <Text style={styles.bodyText}>
              {correctAnswers} correct answers ({accuracyPercent}% accuracy)
            </Text>

            <MotiPressable
              accessibilityRole="button"
              onPress={handleCompleteMission}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Save Result and Reflect</Text>
            </MotiPressable>

            <MotiPressable
              accessibilityRole="button"
              onPress={resetSession}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Play Again</Text>
            </MotiPressable>

            <MotiPressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("MissionsHome")}
              animate={({ pressed }) => {
                "worklet";
                return { scale: pressed ? 0.96 : 1 };
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Back to Missions</Text>
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
    backgroundColor: colors.pastelBlue,
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
  howTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  ruleText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.xs,
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
