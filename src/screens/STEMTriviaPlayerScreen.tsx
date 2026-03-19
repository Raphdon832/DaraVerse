import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AnimatePresence, MotiView } from "moti";
import MotiPressable from "../components/SoundMotiPressable";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../components/BackButton";
import { useAppState } from "../context/AppStateContext";
import { defaultAgeBracket, getAgeBracketLabel } from "../data/ageBrackets";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";
import type { STEMStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<STEMStackParamList, "STEMTriviaPlayer">;

const SESSION_QUESTION_COUNT = 10;
const OPTION_LETTERS = ["A", "B", "C", "D"];

function shuffle<T>(array: T[]): T[] {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function STEMTriviaPlayerScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { state, completeStemTriviaSession, markStemTriviaActivity } = useAppState();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const { stemCategories: stemCategoryCatalog, stemTriviaQuestions: allTriviaQuestions } = state.catalogs;
  const category = stemCategoryCatalog.find((c) => c.id === categoryId);
  const rootNavigation = useRootNavigation();
  const progress = state.stemTriviaProgress[categoryId];
  const ageBracket = state.learner.ageBracket ?? defaultAgeBracket;
  const ageLabel = getAgeBracketLabel(ageBracket);

  const questions = useMemo(() => {
    const pool = allTriviaQuestions.filter(
      (q) => q.categoryId === categoryId && q.ageBracket === ageBracket
    );
    const excluded = new Set(progress.recentlySeenQuestionIds);
    const filtered = pool.filter((q) => !excluded.has(q.id));
    const source = filtered.length >= SESSION_QUESTION_COUNT ? filtered : pool;
    return shuffle(source).slice(0, Math.min(SESSION_QUESTION_COUNT, source.length));
  }, [ageBracket, categoryId, progress.recentlySeenQuestionIds, allTriviaQuestions]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, number>>({});
  const [sessionScore, setSessionScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const responsiveContainerStyle = {
    alignSelf: "center" as const,
    maxWidth: contentMaxWidth,
    paddingHorizontal: horizontalPadding,
    width: "100%" as const,
  };

  useEffect(() => {
    markStemTriviaActivity(categoryId);
    // The context function identity changes with state updates; only mark once per category entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex >= questions.length - 1;
  const progressPercent = questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0;

  if (!currentQuestion) {
    return <View style={styles.container} />;
  }

  const handleSelectOption = (index: number) => {
    setSelectedOptionIndex(index);
    const isCorrect = index === currentQuestion.correctOptionIndex;

    const updatedAnswers = {
      ...answersByQuestionId,
      [currentQuestion.id]: index,
    };
    setAnswersByQuestionId(updatedAnswers);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSessionScore((s) => s + 10);
      setCelebrationKey((k) => k + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const submitAndFinish = (finalAnswers: Record<string, number>) => {
    const correctAnswers = questions.reduce((total, question) => {
      return total + (finalAnswers[question.id] === question.correctOptionIndex ? 1 : 0);
    }, 0);
    const score = correctAnswers * 10;

    completeStemTriviaSession({
      categoryId,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      questionIds: questions.map((question) => question.id),
    });

    navigation.replace("STEMTriviaResult", {
      categoryId,
      score,
      totalQuestions: questions.length,
      correctAnswers,
    });
  };

  const optionAnimateActive = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return { scale: pressed ? 0.96 : 1 };
      },
    []
  );

  const optionAnimateDisabled = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return { scale: 1 };
      },
    []
  );

  const prevButtonAnimate = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return { scale: pressed ? 0.9 : 1 };
      },
    []
  );

  const nextButtonAnimate = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed && selectedOptionIndex !== null ? 0.95 : 1,
          opacity: selectedOptionIndex === null ? 0.5 : 1,
        };
      },
    [selectedOptionIndex]
  );

  return (
    <View style={styles.container}>
      {/* Top curved background */}
      <View style={styles.heroBgWrap}>
        <View style={styles.heroBg} />
      </View>

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Top bar */}
        <View style={[styles.topBar, responsiveContainerStyle]}>
          <BackButton
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
          />
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>{category?.title ?? "Category"}</Text>
            <Text style={styles.topBarSub}>Ages {ageLabel}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Ionicons name="diamond" size={14} color={colors.statusWarning} />
            <Text style={styles.pointsBadgeText}>{sessionScore}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={[styles.progressSection, responsiveContainerStyle]}
        >
          <View style={styles.progressTrack}>
            <MotiView
              animate={{ width: `${progressPercent}%` as any }}
              transition={{ type: "spring", damping: 20 }}
              style={styles.progressFill}
            />
          </View>
          <Text style={styles.progressText}>
            {questionIndex + 1} of {questions.length}
          </Text>
        </MotiView>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, responsiveContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero question card */}
          <MotiView
            key={`q-${questionIndex}`}
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "spring", damping: 18 }}
            style={styles.questionHeroWrap}
          >
            <View style={styles.questionHero}>
              <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
              <View style={styles.questionDecoRow}>
                <View style={styles.questionDecoDot} />
                <View style={[styles.questionDecoDot, styles.questionDecoDot2]} />
                <View style={[styles.questionDecoDot, styles.questionDecoDot3]} />
              </View>
            </View>
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumberText}>Q{questionIndex + 1}</Text>
            </View>
          </MotiView>

          {/* Answer options */}
          <View style={styles.optionsWrap}>
            {currentQuestion.options.map((option, index) => {
              const isAnswered = selectedOptionIndex !== null;
              const isSelected = selectedOptionIndex === index;
              const isCorrect = currentQuestion.correctOptionIndex === index;
              const letter = OPTION_LETTERS[index];

              let cardStyle: any = styles.optionCard;
              let textStyle: any = styles.optionText;
              let badgeStyle: any = styles.optionLetterBadge;
              let letterStyle: any = styles.optionLetter;
              let iconName: any = "ellipse-outline";
              let iconColor = "transparent";

              if (isAnswered) {
                if (isCorrect) {
                  cardStyle = [styles.optionCard, styles.optionCardCorrect];
                  textStyle = [styles.optionText, styles.optionTextCorrect];
                  badgeStyle = [styles.optionLetterBadge, styles.optionLetterBadgeCorrect];
                  letterStyle = [styles.optionLetter, styles.optionLetterCorrect];
                  iconName = "checkmark-circle";
                  iconColor = "#FFFFFF";
                } else if (isSelected && !isCorrect) {
                  cardStyle = [styles.optionCard, styles.optionCardWrong];
                  textStyle = [styles.optionText, styles.optionTextWrong];
                  badgeStyle = [styles.optionLetterBadge, styles.optionLetterBadgeWrong];
                  letterStyle = [styles.optionLetter, styles.optionLetterWrong];
                  iconName = "close-circle";
                  iconColor = "#FFFFFF";
                } else {
                  cardStyle = [styles.optionCard, { opacity: 0.4 }];
                }
              }

              return (
                <MotiView
                  key={`${questionIndex}-${option}`}
                  from={{ opacity: 0, translateX: 30 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "spring", delay: 80 + index * 60, damping: 20 }}
                >
                  <MotiPressable
                    disabled={isAnswered}
                    onPress={() => handleSelectOption(index)}
                    animate={isAnswered ? optionAnimateDisabled : optionAnimateActive}
                    transition={{ type: "spring", damping: 15, stiffness: 250 }}
                    style={cardStyle}
                  >
                    <View style={badgeStyle}>
                      <Text style={letterStyle}>{letter}</Text>
                    </View>
                    <Text style={textStyle}>{option}</Text>
                    {(isAnswered && (isSelected || isCorrect)) ? (
                      <Ionicons
                        name={iconName}
                        size={22}
                        color={iconColor}
                        style={styles.optionCheck}
                      />
                    ) : null}
                  </MotiPressable>
                </MotiView>
              );
            })}
          </View>

          {/* Explanation card */}
          {selectedOptionIndex !== null ? (
            <MotiView
              from={{ opacity: 0, translateY: 15, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "spring", damping: 18 }}
              style={styles.feedbackCard}
            >
              <View style={styles.feedbackIconRow}>
                <Ionicons name="bulb" size={20} color={colors.statusWarning} />
                <Text style={styles.feedbackLabel}>Why this matters</Text>
              </View>
              <Text style={styles.feedbackText}>{currentQuestion.explanation}</Text>
            </MotiView>
          ) : null}

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {questionIndex > 0 && (
              <MotiPressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuestionIndex((v) => v - 1);
                  setSelectedOptionIndex(
                    answersByQuestionId[questions[questionIndex - 1]?.id] ?? null
                  );
                }}
                animate={prevButtonAnimate}
                style={styles.prevButton}
              >
                <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
              </MotiPressable>
            )}

            <MotiPressable
              accessibilityRole="button"
              disabled={selectedOptionIndex === null}
              onPress={() => {
                if (selectedOptionIndex === null) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                if (isLastQuestion) {
                  submitAndFinish(answersByQuestionId);
                  return;
                }
                setQuestionIndex((v) => v + 1);
                setSelectedOptionIndex(null);
              }}
              animate={nextButtonAnimate}
              transition={{ type: "spring", damping: 18, stiffness: 300 }}
              style={[
                styles.nextButton,
                selectedOptionIndex === null && styles.nextButtonDisabled,
                isLastQuestion && selectedOptionIndex !== null && styles.nextButtonFinish,
              ]}
            >
              {/* Inner highlight strip */}
              <View style={styles.nextButtonHighlight} />
              <Text style={[
                styles.nextButtonText,
                isLastQuestion && styles.nextButtonTextFinish,
              ]}>
                {isLastQuestion ? "🏆  Finish Quiz" : "Next Question"}
              </Text>
              <View style={styles.nextButtonArrowWrap}>
                <Ionicons
                  name={isLastQuestion ? "trophy" : "arrow-forward"}
                  size={18}
                  color="#FFFFFF"
                />
              </View>
            </MotiPressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <View pointerEvents="none" style={styles.celebrationOverlay}>
            <MotiView
              key={`celeb-${celebrationKey}`}
              from={{ opacity: 0, scale: 0.5, translateY: 100 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 1.5, translateY: -100 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.celebrationContainer}
            >
              <Ionicons name="sparkles" size={48} color={colors.statusWarning} />
              <Text style={styles.celebrationText}>+10</Text>
              <Text style={styles.celebrationSub}>Correct!</Text>
            </MotiView>
          </View>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pastelPink,
  },
  heroBgWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    zIndex: 0,
  },
  heroBg: {
    position: "absolute",
    top: -120,
    left: -80,
    right: -80,
    height: 440,
    backgroundColor: colors.pastelBlue,
    borderBottomLeftRadius: 250,
    borderBottomRightRadius: 250,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  topBarCenter: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topBarTitle: {
    fontSize: typography.subheading,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  topBarSub: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    ...shadow.soft,
  },
  pointsBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  progressSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.ctaPrimary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "right",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  questionHeroWrap: {
    position: "relative",
    paddingTop: 16,
  },
  questionHero: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    padding: spacing.xl,
    paddingTop: 40,
    ...shadow.card,
  },
  questionNumberBadge: {
    position: "absolute",
    top: 2,
    left: spacing.xl,
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    ...shadow.fab,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textInverse,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 30,
  },
  questionDecoRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: spacing.md,
  },
  questionDecoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ctaPrimary,
    opacity: 0.3,
  },
  questionDecoDot2: {
    backgroundColor: colors.pastelBlue,
    opacity: 0.6,
    width: 12,
    borderRadius: 6,
  },
  questionDecoDot3: {
    backgroundColor: colors.pastelPurple,
    opacity: 0.4,
    width: 6,
    borderRadius: 3,
  },
  optionsWrap: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  optionCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 22,
    padding: spacing.md,
    paddingLeft: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...shadow.soft,
  },
  optionCardSelected: {
    backgroundColor: colors.ctaPrimary,
    borderColor: colors.ctaPrimary,
  },
  optionCardCorrect: {
    backgroundColor: colors.statusSuccess,
    borderColor: colors.statusSuccess,
  },
  optionTextCorrect: {
    color: colors.textInverse,
    fontWeight: "800",
  },
  optionLetterBadgeCorrect: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  optionLetterCorrect: {
    color: colors.textInverse,
  },
  optionCardWrong: {
    backgroundColor: "#FF5252",
    borderColor: "#FF5252",
  },
  optionTextWrong: {
    color: colors.textInverse,
    fontWeight: "800",
  },
  optionLetterBadgeWrong: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  optionLetterWrong: {
    color: colors.textInverse,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    elevation: 100,
  },
  celebrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 40,
    ...shadow.fab,
  },
  celebrationText: {
    fontSize: 56,
    fontWeight: "900",
    color: colors.statusSuccess,
    marginTop: 8,
  },
  celebrationSub: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },
  optionLetterBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bgSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  optionLetterBadgeSelected: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  optionLetterSelected: {
    color: colors.textInverse,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
    lineHeight: 22,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.textInverse,
    fontWeight: "800",
  },
  optionCheck: {
    marginLeft: spacing.sm,
  },
  feedbackCard: {
    backgroundColor: colors.pastelYellow,
    borderRadius: 24,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  feedbackIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.xs,
  },
  feedbackLabel: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 22,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  prevButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    ...shadow.soft,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
    shadowColor: colors.ctaPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#C8D6E5",
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonFinish: {
    backgroundColor: colors.statusSuccess,
    shadowColor: colors.statusSuccess,
  },
  nextButtonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  nextButtonTextFinish: {
    fontSize: 18,
    letterSpacing: 0.5,
  },
  nextButtonArrowWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});
