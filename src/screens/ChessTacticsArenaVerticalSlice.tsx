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
  chessTacticsLevels,
  type ChessPieceColor,
  type ChessPieceState,
  type ChessPieceType,
  type ChessTacticsLevel,
} from "../data/chessTacticsLevels";
import { colors, radius, shadow, spacing, typography } from "../theme/tokens";

type Props = {
  missionTitle: string;
  missionSubtitle: string;
  onExit: () => void;
  onSubmitResult: (score: number, maxScore: number) => void;
};

type Phase = "briefing" | "playing" | "objectiveResult" | "sessionReport";

type ObjectiveResult = {
  levelId: string;
  title: string;
  objective: string;
  solved: boolean;
  score: number;
  maxScore: number;
  stars: number;
  wrongMoves: number;
  hintsUsed: number;
  resetsUsed: number;
  timeSpentSec: number;
  moveLog: string[];
  tacticalPattern: string;
  completionNote: string;
};

const BOARD_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const BOARD_SIZE = 8;
const PLAYER_COLOR: ChessPieceColor = "w";

const CHESS_BASE_OBJECTIVE_SCORE = 220;
const CHESS_TIME_BONUS_MULTIPLIER = 2;
const CHESS_WRONG_MOVE_PENALTY = 30;
const CHESS_HINT_PENALTY = 25;
const CHESS_RESET_PENALTY = 15;
const CHESS_MIN_SOLVE_SCORE = 80;

const pressScale = ({ pressed }: { pressed: boolean }) => {
  "worklet";
  return { scale: pressed ? 0.96 : 1 };
};

function squareToIndices(square: string) {
  if (!/^[a-h][1-8]$/.test(square)) {
    return null;
  }
  const file = square[0];
  const rank = Number(square[1]);
  const col = BOARD_FILES.indexOf(file as (typeof BOARD_FILES)[number]);
  const row = BOARD_SIZE - rank;
  return { row, col };
}

function indicesToSquare(row: number, col: number) {
  const file = BOARD_FILES[col];
  const rank = BOARD_SIZE - row;
  return `${file}${rank}`;
}

function clonePieces(pieces: ChessPieceState[]) {
  return pieces.map((piece) => ({ ...piece }));
}

function isInsideBoard(row: number, col: number) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getPieceBySquareMap(pieces: ChessPieceState[]) {
  const map = new Map<string, ChessPieceState>();
  pieces.forEach((piece) => {
    map.set(piece.square, piece);
  });
  return map;
}

function getPieceEmoji(type: ChessPieceType, color: ChessPieceColor) {
  if (color === "w") {
    switch (type) {
      case "king":
        return "♔";
      case "queen":
        return "♕";
      case "rook":
        return "♖";
      case "bishop":
        return "♗";
      case "knight":
        return "♘";
      case "pawn":
        return "♙";
      default:
        return "·";
    }
  }

  switch (type) {
    case "king":
      return "♚";
    case "queen":
      return "♛";
    case "rook":
      return "♜";
    case "bishop":
      return "♝";
    case "knight":
      return "♞";
    case "pawn":
      return "♟";
    default:
      return "·";
  }
}

function getSlidingMoves(
  piece: ChessPieceState,
  pieces: ChessPieceState[],
  directions: Array<{ rowDelta: number; colDelta: number }>,
) {
  const origin = squareToIndices(piece.square);
  if (!origin) return [];

  const map = getPieceBySquareMap(pieces);
  const moves: string[] = [];

  directions.forEach(({ rowDelta, colDelta }) => {
    let row = origin.row + rowDelta;
    let col = origin.col + colDelta;
    while (isInsideBoard(row, col)) {
      const square = indicesToSquare(row, col);
      const occupant = map.get(square);
      if (!occupant) {
        moves.push(square);
        row += rowDelta;
        col += colDelta;
        continue;
      }
      if (occupant.color !== piece.color) {
        moves.push(square);
      }
      break;
    }
  });

  return moves;
}

function getLegalMoves(piece: ChessPieceState, pieces: ChessPieceState[]) {
  const origin = squareToIndices(piece.square);
  if (!origin) return [];

  const map = getPieceBySquareMap(pieces);
  const canOccupy = (row: number, col: number) => {
    if (!isInsideBoard(row, col)) return false;
    const target = indicesToSquare(row, col);
    const occupant = map.get(target);
    return !occupant || occupant.color !== piece.color;
  };

  switch (piece.type) {
    case "king": {
      const deltas = [
        { rowDelta: -1, colDelta: -1 },
        { rowDelta: -1, colDelta: 0 },
        { rowDelta: -1, colDelta: 1 },
        { rowDelta: 0, colDelta: -1 },
        { rowDelta: 0, colDelta: 1 },
        { rowDelta: 1, colDelta: -1 },
        { rowDelta: 1, colDelta: 0 },
        { rowDelta: 1, colDelta: 1 },
      ];
      return deltas
        .map(({ rowDelta, colDelta }) => ({
          row: origin.row + rowDelta,
          col: origin.col + colDelta,
        }))
        .filter(({ row, col }) => canOccupy(row, col))
        .map(({ row, col }) => indicesToSquare(row, col));
    }
    case "queen":
      return getSlidingMoves(piece, pieces, [
        { rowDelta: -1, colDelta: 0 },
        { rowDelta: 1, colDelta: 0 },
        { rowDelta: 0, colDelta: -1 },
        { rowDelta: 0, colDelta: 1 },
        { rowDelta: -1, colDelta: -1 },
        { rowDelta: -1, colDelta: 1 },
        { rowDelta: 1, colDelta: -1 },
        { rowDelta: 1, colDelta: 1 },
      ]);
    case "rook":
      return getSlidingMoves(piece, pieces, [
        { rowDelta: -1, colDelta: 0 },
        { rowDelta: 1, colDelta: 0 },
        { rowDelta: 0, colDelta: -1 },
        { rowDelta: 0, colDelta: 1 },
      ]);
    case "bishop":
      return getSlidingMoves(piece, pieces, [
        { rowDelta: -1, colDelta: -1 },
        { rowDelta: -1, colDelta: 1 },
        { rowDelta: 1, colDelta: -1 },
        { rowDelta: 1, colDelta: 1 },
      ]);
    case "knight": {
      const jumps = [
        { rowDelta: -2, colDelta: -1 },
        { rowDelta: -2, colDelta: 1 },
        { rowDelta: -1, colDelta: -2 },
        { rowDelta: -1, colDelta: 2 },
        { rowDelta: 1, colDelta: -2 },
        { rowDelta: 1, colDelta: 2 },
        { rowDelta: 2, colDelta: -1 },
        { rowDelta: 2, colDelta: 1 },
      ];
      return jumps
        .map(({ rowDelta, colDelta }) => ({
          row: origin.row + rowDelta,
          col: origin.col + colDelta,
        }))
        .filter(({ row, col }) => canOccupy(row, col))
        .map(({ row, col }) => indicesToSquare(row, col));
    }
    case "pawn": {
      const direction = piece.color === "w" ? -1 : 1;
      const startingRow = piece.color === "w" ? 6 : 1;
      const moves: string[] = [];
      const oneForwardRow = origin.row + direction;
      if (isInsideBoard(oneForwardRow, origin.col)) {
        const oneForwardSquare = indicesToSquare(oneForwardRow, origin.col);
        if (!map.get(oneForwardSquare)) {
          moves.push(oneForwardSquare);
          const twoForwardRow = origin.row + direction * 2;
          if (origin.row === startingRow && isInsideBoard(twoForwardRow, origin.col)) {
            const twoForwardSquare = indicesToSquare(twoForwardRow, origin.col);
            if (!map.get(twoForwardSquare)) {
              moves.push(twoForwardSquare);
            }
          }
        }
      }

      [-1, 1].forEach((colDelta) => {
        const targetRow = origin.row + direction;
        const targetCol = origin.col + colDelta;
        if (!isInsideBoard(targetRow, targetCol)) {
          return;
        }
        const targetSquare = indicesToSquare(targetRow, targetCol);
        const occupant = map.get(targetSquare);
        if (occupant && occupant.color !== piece.color) {
          moves.push(targetSquare);
        }
      });
      return moves;
    }
    default:
      return [];
  }
}

function getAttackSquares(piece: ChessPieceState, pieces: ChessPieceState[]) {
  if (piece.type !== "pawn") {
    return getLegalMoves(piece, pieces);
  }
  const origin = squareToIndices(piece.square);
  if (!origin) return [];
  const direction = piece.color === "w" ? -1 : 1;
  const targets: string[] = [];
  [-1, 1].forEach((colDelta) => {
    const row = origin.row + direction;
    const col = origin.col + colDelta;
    if (!isInsideBoard(row, col)) {
      return;
    }
    targets.push(indicesToSquare(row, col));
  });
  return targets;
}

function getThreatenedSquares(pieces: ChessPieceState[], attackerColor: ChessPieceColor) {
  const set = new Set<string>();
  pieces
    .filter((piece) => piece.color === attackerColor)
    .forEach((piece) => {
      getAttackSquares(piece, pieces).forEach((square) => set.add(square));
    });
  return set;
}

function applyMove(pieces: ChessPieceState[], from: string, to: string) {
  const moving = pieces.find((piece) => piece.square === from);
  if (!moving) return pieces;
  const remaining = pieces.filter(
    (piece) => piece.id !== moving.id && piece.square !== to,
  );
  return [...remaining, { ...moving, square: to }];
}

function getObjectiveMaxScore(level: ChessTacticsLevel) {
  return CHESS_BASE_OBJECTIVE_SCORE + level.timeLimitSec * CHESS_TIME_BONUS_MULTIPLIER;
}

function getStars(
  solved: boolean,
  hintsUsed: number,
  wrongMoves: number,
  secondsRemaining: number,
  timeLimitSec: number,
) {
  if (!solved) return 0;
  if (hintsUsed === 0 && wrongMoves <= 1 && secondsRemaining >= Math.floor(timeLimitSec * 0.45)) {
    return 3;
  }
  if (hintsUsed <= 1 && wrongMoves <= 3) {
    return 2;
  }
  return 1;
}

export default function ChessTacticsArenaVerticalSlice({
  missionTitle,
  missionSubtitle,
  onExit,
  onSubmitResult,
}: Props) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [pieces, setPieces] = useState<ChessPieceState[]>(() =>
    clonePieces(chessTacticsLevels[0].initialPieces),
  );
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(chessTacticsLevels[0].timeLimitSec);
  const [wrongMoves, setWrongMoves] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [resetsUsed, setResetsUsed] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [feedback, setFeedback] = useState(chessTacticsLevels[0].briefing);
  const [objectiveResults, setObjectiveResults] = useState<ObjectiveResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ObjectiveResult | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [didSubmitResult, setDidSubmitResult] = useState(false);

  const autoReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - spacing.md * 2, 360);
  const tileSize = boardSize / BOARD_SIZE;

  const currentLevel = chessTacticsLevels[currentLevelIndex];
  const sessionMaxScore = useMemo(
    () => chessTacticsLevels.reduce((sum, level) => sum + getObjectiveMaxScore(level), 0),
    [],
  );

  const pieceBySquare = useMemo(() => getPieceBySquareMap(pieces), [pieces]);
  const selectedPiece = selectedSquare ? pieceBySquare.get(selectedSquare) : undefined;
  const legalTargets = useMemo(() => {
    if (!selectedPiece || selectedPiece.color !== PLAYER_COLOR) {
      return [];
    }
    return getLegalMoves(selectedPiece, pieces);
  }, [selectedPiece, pieces]);
  const legalTargetSet = useMemo(() => new Set(legalTargets), [legalTargets]);
  const threatenedSquares = useMemo(
    () => getThreatenedSquares(pieces, "b"),
    [pieces],
  );
  const currentScriptedMove = currentLevel.requiredLine[currentStepIndex] ?? null;

  const clearTimers = useCallback(() => {
    if (autoReplyTimeoutRef.current) {
      clearTimeout(autoReplyTimeoutRef.current);
      autoReplyTimeoutRef.current = null;
    }
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const initializeObjective = useCallback((levelIndex: number) => {
    const level = chessTacticsLevels[levelIndex];
    clearTimers();
    setPieces(clonePieces(level.initialPieces));
    setSelectedSquare(null);
    setCurrentStepIndex(0);
    setSecondsRemaining(level.timeLimitSec);
    setWrongMoves(0);
    setHintsUsed(0);
    setResetsUsed(0);
    setHintVisible(false);
    setMoveLog([]);
    setFeedback(level.briefing);
  }, [clearTimers]);

  const finalizeObjective = useCallback(
    (solved: boolean, completionNote: string) => {
      if (phase !== "playing") {
        return;
      }
      clearTimers();
      const timeSpentSec = Math.max(0, currentLevel.timeLimitSec - secondsRemaining);
      const maxScore = getObjectiveMaxScore(currentLevel);
      const stars = getStars(
        solved,
        hintsUsed,
        wrongMoves,
        secondsRemaining,
        currentLevel.timeLimitSec,
      );
      const rawScore =
        CHESS_BASE_OBJECTIVE_SCORE +
        secondsRemaining * CHESS_TIME_BONUS_MULTIPLIER -
        wrongMoves * CHESS_WRONG_MOVE_PENALTY -
        hintsUsed * CHESS_HINT_PENALTY -
        resetsUsed * CHESS_RESET_PENALTY;
      const score = solved
        ? Math.min(maxScore, Math.max(CHESS_MIN_SOLVE_SCORE, rawScore))
        : 0;
      const result: ObjectiveResult = {
        levelId: currentLevel.id,
        title: currentLevel.title,
        objective: currentLevel.objective,
        solved,
        score,
        maxScore,
        stars,
        wrongMoves,
        hintsUsed,
        resetsUsed,
        timeSpentSec,
        moveLog,
        tacticalPattern: currentLevel.tacticalPattern,
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
      clearTimers,
      currentLevel,
      currentLevelIndex,
      hintsUsed,
      moveLog,
      resetsUsed,
      secondsRemaining,
      wrongMoves,
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
      finalizeObjective(
        false,
        "Timer expired before the required tactical line was completed.",
      );
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

  const handleBoardReset = () => {
    if (phase !== "playing") {
      return;
    }
    setPieces(clonePieces(currentLevel.initialPieces));
    setCurrentStepIndex(0);
    setSelectedSquare(null);
    setHintVisible(false);
    setMoveLog([]);
    setResetsUsed((prev) => prev + 1);
    setSecondsRemaining((prev) => Math.max(0, prev - 6));
    setFeedback("Board reset. Sequence restarted and 6 seconds deducted.");
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUseHint = () => {
    if (phase !== "playing" || !currentScriptedMove || hintVisible) {
      return;
    }
    setHintsUsed((prev) => prev + 1);
    setHintVisible(true);
    setSecondsRemaining((prev) => Math.max(0, prev - 5));
    setFeedback(
      `${currentLevel.hint} Tactical cue: ${currentScriptedMove.from.toUpperCase()} -> ${currentScriptedMove.to.toUpperCase()}.`,
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSquarePress = (square: string) => {
    if (phase !== "playing") {
      return;
    }

    const squarePiece = pieceBySquare.get(square);
    if (!selectedSquare) {
      if (squarePiece && squarePiece.color === PLAYER_COLOR) {
        setSelectedSquare(square);
      } else {
        setFeedback("Select one of your white pieces to begin the tactical line.");
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const selected = pieceBySquare.get(selectedSquare);
    if (!selected || selected.color !== PLAYER_COLOR) {
      setSelectedSquare(null);
      return;
    }

    if (squarePiece && squarePiece.color === PLAYER_COLOR) {
      setSelectedSquare(square);
      return;
    }

    if (!legalTargetSet.has(square)) {
      setFeedback("Illegal move for that piece. Recalculate and try again.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const expectedMove = currentLevel.requiredLine[currentStepIndex];
    if (!expectedMove) {
      return;
    }

    if (expectedMove.from === selectedSquare && expectedMove.to === square) {
      setPieces((prev) => applyMove(prev, selectedSquare, square));
      setMoveLog((prev) => [...prev, expectedMove.notation]);
      setSelectedSquare(null);
      setHintVisible(false);
      setFeedback(expectedMove.explanation);
      setCurrentStepIndex((prev) => prev + 1);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const nextStepIndex = currentStepIndex + 1;
      if (expectedMove.autoReply) {
        autoReplyTimeoutRef.current = setTimeout(() => {
          setPieces((prev) =>
            applyMove(prev, expectedMove.autoReply!.from, expectedMove.autoReply!.to),
          );
          setMoveLog((prev) => [...prev, expectedMove.autoReply!.notation]);
          setFeedback(expectedMove.autoReply!.explanation);

          if (nextStepIndex >= currentLevel.requiredLine.length) {
            completionTimeoutRef.current = setTimeout(() => {
              finalizeObjective(true, "Scripted tactical sequence completed cleanly.");
            }, 250);
          }
        }, 350);
        return;
      }

      if (nextStepIndex >= currentLevel.requiredLine.length) {
        completionTimeoutRef.current = setTimeout(() => {
          finalizeObjective(true, "All tactical objectives completed in sequence.");
        }, 250);
      }
      return;
    }

    setWrongMoves((prev) => prev + 1);
    setResetsUsed((prev) => prev + 1);
    setSecondsRemaining((prev) => Math.max(0, prev - 8));
    setPieces(clonePieces(currentLevel.initialPieces));
    setCurrentStepIndex(0);
    setSelectedSquare(null);
    setHintVisible(false);
    setMoveLog([]);
    setFeedback(
      "Legal move, but it misses the mission objective. Board reset and 8 seconds deducted.",
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleContinue = () => {
    if (!currentResult?.solved) {
      initializeObjective(currentLevelIndex);
      setPhase("playing");
      return;
    }
    if (currentLevelIndex >= chessTacticsLevels.length - 1) {
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

  const missionControlLines = [
    "Primary Goal: Solve five tactical objectives using direct board interaction, not multiple choice.",
    "Move Input: Tap a white piece, then tap a legal destination square.",
    "Wrong Tactical Choice: Board resets to objective start, plus 8-second penalty.",
    "Hint System: One tactical cue per objective step, with 5-second time penalty.",
    "Objective Completion: Follow scripted line exactly, including forced enemy replies.",
    "Session Result: Total score, stars, and tactical execution report feed mission completion.",
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={missionTitle}
          subtitle={`${missionSubtitle} • 2D Tactical Vertical Slice`}
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
            <Text style={styles.title}>Chess Tactics Arena: Gameplay Blueprint</Text>
            <Text style={styles.body}>
              This vertical slice turns the mission into a true 2D tactical board loop with
              objective sequences, threat awareness, and score pressure.
            </Text>
            {missionControlLines.map((line) => (
              <Text key={line} style={styles.ruleText}>
                - {line}
              </Text>
            ))}
            <Text style={styles.meta}>
              Objective count: {chessTacticsLevels.length} - Max score: {sessionMaxScore}
            </Text>
            <MotiPressable
              onPress={startSession}
              animate={pressScale}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Start Tactical Session</Text>
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
                  {currentLevelIndex + 1}/{chessTacticsLevels.length}
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
            <Text style={styles.patternText}>Pattern: {currentLevel.tacticalPattern}</Text>
            <Text style={styles.progressText}>
              Tactical line step: {Math.min(currentStepIndex + 1, currentLevel.requiredLine.length)}
              /{currentLevel.requiredLine.length}
            </Text>

            <View style={[styles.board, { width: boardSize, height: boardSize }]}>
              {Array.from({ length: BOARD_SIZE }, (_, row) =>
                Array.from({ length: BOARD_SIZE }, (_, col) => {
                  const square = indicesToSquare(row, col);
                  const piece = pieceBySquare.get(square);
                  const isLightSquare = (row + col) % 2 === 0;
                  const isSelected = selectedSquare === square;
                  const isLegalTarget = legalTargetSet.has(square);
                  const isThreatened = threatenedSquares.has(square);
                  const isHintFrom = hintVisible && currentScriptedMove?.from === square;
                  const isHintTo = hintVisible && currentScriptedMove?.to === square;
                  const isWhiteKingDanger =
                    piece?.color === "w" &&
                    piece.type === "king" &&
                    isThreatened;

                  return (
                    <Pressable
                      key={square}
                      accessibilityRole="button"
                      accessibilityLabel={`Board square ${square}`}
                      onPress={() => handleSquarePress(square)}
                      style={[
                        styles.boardSquare,
                        {
                          width: tileSize,
                          height: tileSize,
                          backgroundColor: isLightSquare ? "#F1D9B5" : "#B9875A",
                        },
                        isSelected && styles.selectedSquare,
                        isLegalTarget && styles.legalTargetSquare,
                        isHintFrom && styles.hintFromSquare,
                        isHintTo && styles.hintToSquare,
                        isWhiteKingDanger && styles.kingDangerSquare,
                      ]}
                    >
                      {piece ? (
                        <View
                          style={[
                            styles.pieceToken,
                            piece.color === "w" ? styles.whiteToken : styles.blackToken,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pieceLabel,
                              piece.color === "w" ? styles.whiteTokenText : styles.blackTokenText,
                            ]}
                          >
                            {getPieceEmoji(piece.type, piece.color)}
                          </Text>
                        </View>
                      ) : null}
                      {isThreatened ? <View style={styles.threatDot} /> : null}
                    </Pressable>
                  );
                }),
              )}
            </View>

            <View style={styles.coordRow}>
              {BOARD_FILES.map((file) => (
                <Text key={file} style={[styles.coordText, { width: tileSize }]}>
                  {file.toUpperCase()}
                </Text>
              ))}
            </View>

            <Text style={styles.feedbackText}>{feedback}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>Wrong moves: {wrongMoves}</Text>
              <Text style={styles.metaItem}>Hints: {hintsUsed}</Text>
              <Text style={styles.metaItem}>Resets: {resetsUsed}</Text>
            </View>
            <Text style={styles.metaItem}>
              Move log: {moveLog.length > 0 ? moveLog.join(" -> ") : "No confirmed tactic yet"}
            </Text>

            <View style={styles.buttonRow}>
              <MotiPressable
                onPress={handleUseHint}
                animate={pressScale}
                accessibilityRole="button"
                style={[styles.secondaryButton, hintVisible && styles.disabledButton]}
              >
                <Text style={styles.secondaryButtonText}>
                  {hintVisible ? "Hint Active" : "Reveal Hint"}
                </Text>
              </MotiPressable>
              <MotiPressable
                onPress={handleBoardReset}
                animate={pressScale}
                accessibilityRole="button"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Reset Board</Text>
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
              Mistakes {currentResult.wrongMoves} - Hints {currentResult.hintsUsed} - Resets{" "}
              {currentResult.resetsUsed}
            </Text>
            <Text style={styles.body}>Move log: {currentResult.moveLog.join(" -> ") || "none"}</Text>
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
                  : currentLevelIndex >= chessTacticsLevels.length - 1
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
            <Text style={styles.sectionTitle}>Session Tactical Report</Text>
            <Text style={styles.resultScore}>
              {sessionScore}/{sessionMaxScore}
            </Text>
            <Text style={styles.body}>
              Total stars: {sessionStars} / {chessTacticsLevels.length * 3}
            </Text>

            {objectiveResults.map((result) => (
              <View key={result.levelId} style={styles.reportRow}>
                <Text style={styles.reportTitle}>{result.title}</Text>
                <Text style={styles.reportMeta}>
                  {result.score}/{result.maxScore} - {result.stars} stars - mistakes{" "}
                  {result.wrongMoves} - hints {result.hintsUsed}
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
    borderWidth: 2,
    borderColor: "#7C5434",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  boardSquare: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.35,
    borderColor: "rgba(35, 23, 14, 0.18)",
  },
  selectedSquare: {
    borderColor: "#2D9CDB",
    borderWidth: 2,
  },
  legalTargetSquare: {
    backgroundColor: "rgba(54, 195, 138, 0.45)",
  },
  hintFromSquare: {
    backgroundColor: "rgba(250, 188, 74, 0.55)",
  },
  hintToSquare: {
    backgroundColor: "rgba(255, 121, 89, 0.62)",
  },
  kingDangerSquare: {
    borderColor: "#D64545",
    borderWidth: 2,
  },
  pieceToken: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    width: "76%",
    height: "76%",
    borderWidth: 1,
  },
  whiteToken: {
    backgroundColor: "#FAFAFA",
    borderColor: "#B7B7B7",
  },
  blackToken: {
    backgroundColor: "#1B1B1B",
    borderColor: "#555555",
  },
  whiteTokenText: {
    color: "#1A1A1A",
  },
  blackTokenText: {
    color: "#FFFFFF",
  },
  pieceLabel: {
    fontSize: 20,
    fontWeight: "900",
  },
  threatDot: {
    position: "absolute",
    right: 3,
    top: 3,
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: "#D64545",
  },
  coordRow: {
    alignSelf: "center",
    flexDirection: "row",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  coordText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  feedbackText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
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
  disabledButton: {
    opacity: 0.5,
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
