import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import MotiPressable from "../components/SoundMotiPressable";
import Pressable from "../components/SoundPressable";
import {
  sudokuSprintLevels,
  type SudokuCellValue,
  type SudokuSprintLevel,
} from "../data/sudokuSprintLevels";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";

type Props = {
  missionTitle: string;
  missionSubtitle: string;
  onExit: () => void;
  onSubmitResult: (score: number, maxScore: number) => void;
};

type Phase = "briefing" | "playing" | "objectiveResult" | "sessionReport";

type SelectedCell = {
  row: number;
  col: number;
} | null;

type ObjectiveResult = {
  levelId: string;
  title: string;
  objective: string;
  solved: boolean;
  score: number;
  maxScore: number;
  stars: number;
  mistakes: number;
  hintsUsed: number;
  bestCombo: number;
  timeSpentSec: number;
  keySkill: string;
  completionNote: string;
};

const SUDOKU_BASE_OBJECTIVE_SCORE = 240;
const SUDOKU_TIME_BONUS_MULTIPLIER = 3;
const SUDOKU_MISTAKE_PENALTY = 28;
const SUDOKU_HINT_PENALTY = 35;
const SUDOKU_MIN_SOLVE_SCORE = 90;
const SUDOKU_COMBO_POINT_UNIT = 14;

const pressScale = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.96 : 1 };
};

function cloneGrid(grid: SudokuCellValue[][]) {
  return grid.map((row) => [...row]);
}

function cellKey(row: number, col: number) {
  return `${row}-${col}`;
}

function countEmptyCells(grid: SudokuCellValue[][]) {
  return grid.reduce((count, row) => {
    return count + row.filter((value) => value === null).length;
  }, 0);
}

function isSolved(grid: SudokuCellValue[][], solution: number[][]) {
  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      if (grid[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

function getObjectiveMaxScore(level: SudokuSprintLevel) {
  const fillableCells = countEmptyCells(level.puzzle);
  return (
    SUDOKU_BASE_OBJECTIVE_SCORE +
    level.timeLimitSec * SUDOKU_TIME_BONUS_MULTIPLIER +
    fillableCells * 60
  );
}

function getStars(
  solved: boolean,
  mistakes: number,
  hintsUsed: number,
  secondsRemaining: number,
  timeLimitSec: number,
) {
  if (!solved) return 0;
  if (mistakes === 0 && hintsUsed === 0 && secondsRemaining >= Math.floor(timeLimitSec * 0.4)) {
    return 3;
  }
  if (mistakes <= 2 && hintsUsed <= 1) {
    return 2;
  }
  return 1;
}

function getConflictKeys(
  level: SudokuSprintLevel,
  grid: SudokuCellValue[][],
  row: number,
  col: number,
  value: number,
) {
  const conflicts = new Set<string>();

  for (let c = 0; c < level.size; c += 1) {
    if (c !== col && grid[row][c] === value) {
      conflicts.add(cellKey(row, c));
    }
  }

  for (let r = 0; r < level.size; r += 1) {
    if (r !== row && grid[r][col] === value) {
      conflicts.add(cellKey(r, col));
    }
  }

  const boxStartRow = Math.floor(row / level.blockRows) * level.blockRows;
  const boxStartCol = Math.floor(col / level.blockCols) * level.blockCols;
  for (let r = boxStartRow; r < boxStartRow + level.blockRows; r += 1) {
    for (let c = boxStartCol; c < boxStartCol + level.blockCols; c += 1) {
      if ((r !== row || c !== col) && grid[r][c] === value) {
        conflicts.add(cellKey(r, c));
      }
    }
  }

  conflicts.add(cellKey(row, col));
  return conflicts;
}

export default function SudokuSprintVerticalSlice({
  missionTitle,
  missionSubtitle,
  onExit,
  onSubmitResult,
}: Props) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [grid, setGrid] = useState<SudokuCellValue[][]>(() =>
    cloneGrid(sudokuSprintLevels[0].puzzle),
  );
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(sudokuSprintLevels[0].timeLimitSec);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [placementScore, setPlacementScore] = useState(0);
  const [feedback, setFeedback] = useState(sudokuSprintLevels[0].briefing);
  const [conflictKeys, setConflictKeys] = useState<string[]>([]);
  const [objectiveResults, setObjectiveResults] = useState<ObjectiveResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ObjectiveResult | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [didSubmitResult, setDidSubmitResult] = useState(false);

  const conflictTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();

  const currentLevel = sudokuSprintLevels[currentLevelIndex];
  const boardSize = Math.min(width - spacing.md * 2, currentLevel.size === 6 ? 360 : 320);
  const tileSize = boardSize / currentLevel.size;
  const sessionMaxScore = useMemo(
    () => sudokuSprintLevels.reduce((sum, level) => sum + getObjectiveMaxScore(level), 0),
    [],
  );

  const fixedCellSet = useMemo(() => {
    const set = new Set<string>();
    currentLevel.puzzle.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value !== null) {
          set.add(cellKey(rowIndex, colIndex));
        }
      });
    });
    return set;
  }, [currentLevel]);
  const conflictSet = useMemo(() => new Set(conflictKeys), [conflictKeys]);
  const remainingCells = useMemo(() => countEmptyCells(grid), [grid]);
  const totalFillableCells = useMemo(() => countEmptyCells(currentLevel.puzzle), [currentLevel]);

  const clearConflictTimer = useCallback(() => {
    if (conflictTimeoutRef.current) {
      clearTimeout(conflictTimeoutRef.current);
      conflictTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearConflictTimer();
  }, [clearConflictTimer]);

  const initializeObjective = useCallback((levelIndex: number) => {
    const level = sudokuSprintLevels[levelIndex];
    clearConflictTimer();
    setGrid(cloneGrid(level.puzzle));
    setSelectedCell(null);
    setSecondsRemaining(level.timeLimitSec);
    setMistakes(0);
    setHintsUsed(0);
    setCombo(0);
    setBestCombo(0);
    setPlacementScore(0);
    setFeedback(level.briefing);
    setConflictKeys([]);
  }, [clearConflictTimer]);

  const finalizeObjective = useCallback(
    (solved: boolean, completionNote: string) => {
      if (phase !== "playing") {
        return;
      }
      clearConflictTimer();
      const maxScore = getObjectiveMaxScore(currentLevel);
      const rawScore =
        SUDOKU_BASE_OBJECTIVE_SCORE +
        placementScore +
        secondsRemaining * SUDOKU_TIME_BONUS_MULTIPLIER -
        mistakes * SUDOKU_MISTAKE_PENALTY -
        hintsUsed * SUDOKU_HINT_PENALTY;
      const score = solved
        ? Math.min(maxScore, Math.max(SUDOKU_MIN_SOLVE_SCORE, rawScore))
        : 0;
      const stars = getStars(
        solved,
        mistakes,
        hintsUsed,
        secondsRemaining,
        currentLevel.timeLimitSec,
      );
      const result: ObjectiveResult = {
        levelId: currentLevel.id,
        title: currentLevel.title,
        objective: currentLevel.objective,
        solved,
        score,
        maxScore,
        stars,
        mistakes,
        hintsUsed,
        bestCombo,
        timeSpentSec: Math.max(0, currentLevel.timeLimitSec - secondsRemaining),
        keySkill: currentLevel.keySkill,
        completionNote,
      };
      setCurrentResult(result);
      setObjectiveResults((prev) => {
        const next = [...prev];
        next[currentLevelIndex] = result;
        return next;
      });
      if (solved) {
        setSessionScore((prev) => prev + score);
        setSessionStars((prev) => prev + stars);
      }
      setPhase("objectiveResult");
    },
    [
      phase,
      clearConflictTimer,
      currentLevel,
      currentLevelIndex,
      placementScore,
      secondsRemaining,
      mistakes,
      hintsUsed,
      bestCombo,
    ],
  );

  useEffect(() => {
    if (phase !== "playing") {
      return undefined;
    }
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, currentLevelIndex]);

  useEffect(() => {
    if (phase === "playing" && secondsRemaining === 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      finalizeObjective(false, "Timer expired before the grid was completed.");
    }
  }, [phase, secondsRemaining, finalizeObjective]);

  const startSession = () => {
    setDidSubmitResult(false);
    setObjectiveResults([]);
    setCurrentResult(null);
    setSessionScore(0);
    setSessionStars(0);
    setCurrentLevelIndex(0);
    initializeObjective(0);
    setPhase("playing");
  };

  const setConflictFeedback = (keys: Set<string>) => {
    setConflictKeys(Array.from(keys));
    clearConflictTimer();
    conflictTimeoutRef.current = setTimeout(() => {
      setConflictKeys([]);
    }, 650);
  };

  const commitCorrectPlacement = (row: number, col: number, value: number) => {
    const nextGrid = cloneGrid(grid);
    nextGrid[row][col] = value;
    const nextCombo = combo + 1;
    const comboMultiplier = Math.min(4, Math.max(1, nextCombo));
    const points = 18 + comboMultiplier * SUDOKU_COMBO_POINT_UNIT;

    setGrid(nextGrid);
    setCombo(nextCombo);
    setBestCombo((prev) => Math.max(prev, nextCombo));
    setPlacementScore((prev) => prev + points);
    setFeedback(`Correct placement +${points}. Keep your combo active.`);
    setConflictKeys([]);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isSolved(nextGrid, currentLevel.solution)) {
      finalizeObjective(true, "Grid solved with full constraint compliance.");
    }
  };

  const handleSelectCell = (row: number, col: number) => {
    if (phase !== "playing") {
      return;
    }
    const key = cellKey(row, col);
    if (fixedCellSet.has(key)) {
      setFeedback("That cell is fixed. Choose an editable cell.");
      return;
    }
    setSelectedCell({ row, col });
  };

  const handlePlaceValue = (value: number) => {
    if (phase !== "playing" || !selectedCell) {
      return;
    }
    const { row, col } = selectedCell;
    if (fixedCellSet.has(cellKey(row, col))) {
      return;
    }
    if (currentLevel.solution[row][col] === value) {
      commitCorrectPlacement(row, col, value);
      return;
    }

    const conflicts = getConflictKeys(currentLevel, grid, row, col, value);
    setMistakes((prev) => prev + 1);
    setCombo(0);
    setSecondsRemaining((prev) => Math.max(0, prev - 6));
    setFeedback("Conflict detected. Wrong entry rejected and 6 seconds deducted.");
    setConflictFeedback(conflicts);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleClearCell = () => {
    if (phase !== "playing" || !selectedCell) {
      return;
    }
    const { row, col } = selectedCell;
    if (fixedCellSet.has(cellKey(row, col)) || grid[row][col] === null) {
      return;
    }
    const nextGrid = cloneGrid(grid);
    nextGrid[row][col] = null;
    setGrid(nextGrid);
    setCombo(0);
    setFeedback("Cell cleared. Rebuild combo with accurate placements.");
  };

  const handleUseHint = () => {
    if (phase !== "playing") {
      return;
    }
    let target = selectedCell;
    if (!target || fixedCellSet.has(cellKey(target.row, target.col)) || grid[target.row][target.col] !== null) {
      target = null;
      for (let row = 0; row < currentLevel.size; row += 1) {
        for (let col = 0; col < currentLevel.size; col += 1) {
          if (!fixedCellSet.has(cellKey(row, col)) && grid[row][col] === null) {
            target = { row, col };
            break;
          }
        }
        if (target) break;
      }
    }

    if (!target) {
      setFeedback("No hint target available.");
      return;
    }

    const hintValue = currentLevel.solution[target.row][target.col];
    const nextGrid = cloneGrid(grid);
    nextGrid[target.row][target.col] = hintValue;
    setGrid(nextGrid);
    setSelectedCell(target);
    setHintsUsed((prev) => prev + 1);
    setCombo(0);
    setSecondsRemaining((prev) => Math.max(0, prev - 4));
    setFeedback(
      `Hint placed ${hintValue} at R${target.row + 1}C${target.col + 1}. Time penalty: 4 seconds.`,
    );
    setConflictKeys([]);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isSolved(nextGrid, currentLevel.solution)) {
      finalizeObjective(true, "Grid solved using tactical hints and elimination flow.");
    }
  };

  const handleContinue = () => {
    if (!currentResult?.solved) {
      initializeObjective(currentLevelIndex);
      setPhase("playing");
      return;
    }
    if (currentLevelIndex >= sudokuSprintLevels.length - 1) {
      setPhase("sessionReport");
      return;
    }
    const nextLevelIndex = currentLevelIndex + 1;
    setCurrentLevelIndex(nextLevelIndex);
    initializeObjective(nextLevelIndex);
    setPhase("playing");
  };

  const handleSubmitMissionResult = () => {
    if (didSubmitResult) {
      return;
    }
    setDidSubmitResult(true);
    onSubmitResult(sessionScore, sessionMaxScore);
  };

  const gameplayLines = [
    "Primary Goal: solve timed Sudoku objectives through direct grid interaction.",
    "Input Loop: select a cell, place value, validate row/column/box constraints.",
    "Combo Rule: consecutive correct placements increase point gain per move.",
    "Error Rule: invalid entries are rejected, combo resets, and timer loses 6 seconds.",
    "Hint Rule: auto-fills one valid cell with a 4-second penalty and score reduction.",
    "Session Output: score, stars, mistakes, and combo metrics drive mission completion.",
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={missionTitle}
          subtitle={`${missionSubtitle} - 2D Grid Vertical Slice`}
          showHomeAction
          onPressHome={onExit}
        />

        {phase === "briefing" ? (
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 120 }}
            style={styles.card}
          >
            <Text style={styles.title}>Sudoku Sprint: Gameplay Blueprint</Text>
            <Text style={styles.body}>
              This vertical slice upgrades Sudoku Sprint into a hands-on timed logic game with
              combo scoring, penalties, and objective-based progression.
            </Text>
            {gameplayLines.map((line) => (
              <Text key={line} style={styles.ruleText}>
                - {line}
              </Text>
            ))}
            <Text style={styles.meta}>
              Objective count: {sudokuSprintLevels.length} - Max score: {sessionMaxScore}
            </Text>
            <MotiPressable
              onPress={startSession}
              animate={pressScale}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Start Sprint Session</Text>
            </MotiPressable>
          </MotiView>
        ) : null}

        {phase === "playing" ? (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 120 }}
            style={styles.card}
          >
            <View style={styles.statRow}>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Objective</Text>
                <Text style={styles.statValue}>
                  {currentLevelIndex + 1}/{sudokuSprintLevels.length}
                </Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Timer</Text>
                <Text style={styles.statValue}>{secondsRemaining}s</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Session Score</Text>
                <Text style={styles.statValue}>{sessionScore}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>{currentLevel.title}</Text>
            <Text style={styles.sectionBody}>{currentLevel.objective}</Text>
            <Text style={styles.patternText}>Key skill: {currentLevel.keySkill}</Text>
            <Text style={styles.progressText}>
              Remaining cells: {remainingCells}/{totalFillableCells}
            </Text>

            <View style={[styles.board, { width: boardSize, height: boardSize }]}>
              {Array.from({ length: currentLevel.size }, (_, row) =>
                Array.from({ length: currentLevel.size }, (_, col) => {
                  const value = grid[row][col];
                  const key = cellKey(row, col);
                  const isFixed = fixedCellSet.has(key);
                  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                  const inConflict = conflictSet.has(key);
                  const sameRowOrCol =
                    selectedCell &&
                    (selectedCell.row === row || selectedCell.col === col) &&
                    !isSelected;
                  const sameBlock =
                    selectedCell &&
                    Math.floor(selectedCell.row / currentLevel.blockRows) ===
                      Math.floor(row / currentLevel.blockRows) &&
                    Math.floor(selectedCell.col / currentLevel.blockCols) ===
                      Math.floor(col / currentLevel.blockCols) &&
                    !isSelected;
                  const topWidth = row % currentLevel.blockRows === 0 ? 2 : 0.6;
                  const leftWidth = col % currentLevel.blockCols === 0 ? 2 : 0.6;
                  const rightWidth =
                    (col + 1) % currentLevel.blockCols === 0 ||
                    col === currentLevel.size - 1
                      ? 2
                      : 0.6;
                  const bottomWidth =
                    (row + 1) % currentLevel.blockRows === 0 ||
                    row === currentLevel.size - 1
                      ? 2
                      : 0.6;

                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityLabel={`Sudoku cell row ${row + 1} column ${col + 1}`}
                      onPress={() => handleSelectCell(row, col)}
                      style={[
                        styles.cell,
                        {
                          width: tileSize,
                          height: tileSize,
                          borderTopWidth: topWidth,
                          borderLeftWidth: leftWidth,
                          borderRightWidth: rightWidth,
                          borderBottomWidth: bottomWidth,
                        },
                        isFixed && styles.fixedCell,
                        (sameRowOrCol || sameBlock) && styles.relatedCell,
                        isSelected && styles.selectedCell,
                        inConflict && styles.conflictCell,
                      ]}
                    >
                      <Text style={[styles.cellText, isFixed && styles.fixedCellText]}>
                        {value ?? ""}
                      </Text>
                    </Pressable>
                  );
                }),
              )}
            </View>

            <View style={styles.numberPad}>
              {Array.from({ length: currentLevel.size }, (_, idx) => idx + 1).map((value) => (
                <MotiPressable
                  key={value}
                  onPress={() => handlePlaceValue(value)}
                  animate={pressScale}
                  accessibilityRole="button"
                  style={styles.padButton}
                >
                  <Text style={styles.padButtonText}>{value}</Text>
                </MotiPressable>
              ))}
            </View>

            <Text style={styles.feedbackText}>{feedback}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>Mistakes: {mistakes}</Text>
              <Text style={styles.metaItem}>Hints: {hintsUsed}</Text>
              <Text style={styles.metaItem}>Combo: x{combo}</Text>
              <Text style={styles.metaItem}>Best Combo: x{bestCombo}</Text>
            </View>

            <View style={styles.buttonRow}>
              <MotiPressable
                onPress={handleUseHint}
                animate={pressScale}
                accessibilityRole="button"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Use Hint</Text>
              </MotiPressable>
              <MotiPressable
                onPress={handleClearCell}
                animate={pressScale}
                accessibilityRole="button"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Clear Cell</Text>
              </MotiPressable>
            </View>
          </MotiView>
        ) : null}

        {phase === "objectiveResult" && currentResult ? (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 100 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>
              {currentResult.solved ? "Objective Cleared" : "Objective Failed"}
            </Text>
            <Text style={styles.body}>{currentResult.completionNote}</Text>
            <Text style={styles.resultScore}>
              {currentResult.score}/{currentResult.maxScore}
            </Text>
            <Text style={styles.body}>Stars earned: {currentResult.stars} / 3</Text>
            <Text style={styles.body}>
              Mistakes {currentResult.mistakes} - Hints {currentResult.hintsUsed} - Best Combo x
              {currentResult.bestCombo}
            </Text>
            <Text style={styles.body}>{currentLevel.mentorDebrief}</Text>

            <MotiPressable
              onPress={handleContinue}
              animate={pressScale}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {!currentResult.solved
                  ? "Retry Objective"
                  : currentLevelIndex >= sudokuSprintLevels.length - 1
                    ? "Open Session Report"
                    : "Next Objective"}
              </Text>
            </MotiPressable>
            <MotiPressable
              onPress={onExit}
              animate={pressScale}
              accessibilityRole="button"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Exit Mission</Text>
            </MotiPressable>
          </MotiView>
        ) : null}

        {phase === "sessionReport" ? (
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 120 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Session Logic Report</Text>
            <Text style={styles.resultScore}>
              {sessionScore}/{sessionMaxScore}
            </Text>
            <Text style={styles.body}>
              Total stars: {sessionStars} / {sudokuSprintLevels.length * 3}
            </Text>

            {objectiveResults.map((result) => (
              <View key={result.levelId} style={styles.reportRow}>
                <Text style={styles.reportTitle}>{result.title}</Text>
                <Text style={styles.reportMeta}>
                  {result.score}/{result.maxScore} - {result.stars} stars - mistakes{" "}
                  {result.mistakes} - hints {result.hintsUsed} - combo x{result.bestCombo}
                </Text>
              </View>
            ))}

            <MotiPressable
              onPress={handleSubmitMissionResult}
              animate={pressScale}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Save Result and Reflect</Text>
            </MotiPressable>
            <MotiPressable
              onPress={startSession}
              animate={pressScale}
              accessibilityRole="button"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Play Session Again</Text>
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
    padding: spacing.lg,
    ...shadow.card,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
  },
  sectionBody: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  body: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  ruleText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.md,
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statChip: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    flex: 1,
    padding: spacing.sm,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "900",
    marginTop: 2,
  },
  patternText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  progressText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "800",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  board: {
    alignSelf: "center",
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "#AEB9D7",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#AEB9D7",
  },
  fixedCell: {
    backgroundColor: "#E5EBFA",
  },
  selectedCell: {
    backgroundColor: "#D6E5FF",
  },
  relatedCell: {
    backgroundColor: "#F5F8FF",
  },
  conflictCell: {
    backgroundColor: "#FFDCDC",
  },
  cellText: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "800",
  },
  fixedCellText: {
    color: "#2E3B63",
  },
  numberPad: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  padButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    minWidth: 52,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  padButtonText: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: typography.body,
    fontWeight: "900",
  },
  feedbackText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  metaItem: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.ctaPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    flex: 1,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center",
  },
  resultScore: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    marginTop: spacing.md,
  },
  reportRow: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  reportTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "800",
  },
  reportMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: 4,
  },
});
