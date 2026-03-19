export type MissionGameQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

export type MissionGameConfig = {
  missionId: string;
  gameTitle: string;
  gameSubtitle: string;
  summary: string;
  howToPlay: string[];
  questions: MissionGameQuestion[];
};

export const missionGameCatalog: MissionGameConfig[] = [
  {
    missionId: "chess-tactics-m1",
    gameTitle: "Chess Tactics Arena",
    gameSubtitle: "Think ahead, defend, and strike smartly",
    summary:
      "Solve chess-style tactical moments by choosing the best move in each situation. The game rewards planning, board awareness, and calm strategy.",
    howToPlay: [
      "Read each board scenario question carefully.",
      "Choose the move that gives the strongest tactical result.",
      "Score points for each correct decision and review explanations to improve.",
    ],
    questions: [
      {
        id: "chess-1",
        prompt: "Your king is under attack. What is always your first priority?",
        options: ["Win a pawn", "Castle", "Get out of check", "Develop a bishop"],
        correctOptionIndex: 2,
        explanation: "In chess, you must respond to check immediately before anything else.",
      },
      {
        id: "chess-2",
        prompt: "In the opening, what usually gives a strong start?",
        options: ["Move the same piece many times", "Control the center", "Push edge pawns fast", "Bring out the queen early"],
        correctOptionIndex: 1,
        explanation: "Controlling the center improves movement options for your pieces.",
      },
      {
        id: "chess-3",
        prompt: "Your opponent queen is unprotected and can be captured safely. Best action?",
        options: ["Ignore it", "Capture the queen", "Offer a draw", "Move a pawn"],
        correctOptionIndex: 1,
        explanation: "Winning high-value material safely is usually the strongest move.",
      },
      {
        id: "chess-4",
        prompt: "What does a fork do?",
        options: ["Protects your king", "Attacks two or more targets at once", "Trades rooks", "Forces a stalemate"],
        correctOptionIndex: 1,
        explanation: "A fork is a tactical attack on multiple pieces simultaneously.",
      },
      {
        id: "chess-5",
        prompt: "You can checkmate in one move. What should you do?",
        options: ["Play a safe pawn move", "Checkmate immediately", "Offer piece trade", "Repeat checks forever"],
        correctOptionIndex: 1,
        explanation: "Checkmate ends the game, so it is always the top priority when available.",
      },
      {
        id: "chess-6",
        prompt: "Why is castling often useful?",
        options: ["It gives extra queen moves", "It protects the king and connects rooks", "It captures a piece", "It skips opponent turn"],
        correctOptionIndex: 1,
        explanation: "Castling improves king safety and rook activity in one move.",
      },
      {
        id: "chess-7",
        prompt: "A piece is pinned to your king. What is true?",
        options: ["It can move freely", "It should move quickly", "It may not move without exposing king", "It becomes a queen"],
        correctOptionIndex: 2,
        explanation: "Pinned pieces are restricted because moving them can expose critical threats.",
      },
      {
        id: "chess-8",
        prompt: "If you are ahead in material late game, best strategy is often to:",
        options: ["Create unnecessary complications", "Trade pieces and simplify", "Sacrifice everything", "Ignore king safety"],
        correctOptionIndex: 1,
        explanation: "Simplifying when ahead often converts the advantage into a win.",
      },
    ],
  },
  {
    missionId: "sudoku-sprint-m1",
    gameTitle: "Sudoku Sprint",
    gameSubtitle: "Pattern logic under time pressure",
    summary:
      "Play quick Sudoku logic rounds by identifying the only number that fits each row, column, and mini-grid constraint.",
    howToPlay: [
      "Read the mini Sudoku clue and eliminate impossible numbers.",
      "Pick the one value that satisfies row and column rules.",
      "Use explanation feedback to sharpen logic speed.",
    ],
    questions: [
      {
        id: "sudoku-1",
        prompt: "Row has 1, 2, 4. Missing number is?",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 2,
        explanation: "In a 1-4 mini Sudoku row, the missing value is 3.",
      },
      {
        id: "sudoku-2",
        prompt: "Column has 2, 3, 4. Missing number is?",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 0,
        explanation: "Only 1 is missing from 1,2,3,4.",
      },
      {
        id: "sudoku-3",
        prompt: "2x2 box has 1, 3, 4. Missing number is?",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 1,
        explanation: "Only 2 completes the set 1-4.",
      },
      {
        id: "sudoku-4",
        prompt: "If row allows {2,4} and column already has 4, choose:",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 1,
        explanation: "Column rule removes 4, so 2 is the only valid value.",
      },
      {
        id: "sudoku-5",
        prompt: "A cell cannot be 1 or 2 from row, and cannot be 3 from box. Value is:",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 3,
        explanation: "By elimination, 4 is the only valid choice.",
      },
      {
        id: "sudoku-6",
        prompt: "Why does Sudoku never require guessing in basic levels?",
        options: ["Because numbers repeat", "Because logic elimination reveals valid values", "Because any number works", "Because rows can duplicate"],
        correctOptionIndex: 1,
        explanation: "Basic puzzles are designed to be solvable through constraints and elimination.",
      },
      {
        id: "sudoku-7",
        prompt: "Best first step when stuck in Sudoku?",
        options: ["Randomly fill a number", "Check candidates in one row/column", "Erase the grid", "Ignore box rules"],
        correctOptionIndex: 1,
        explanation: "Candidate scanning narrows choices and reveals forced placements.",
      },
      {
        id: "sudoku-8",
        prompt: "Sudoku improves which key STEM skill most directly?",
        options: ["Memorizing dates", "Logical reasoning", "Handwriting speed", "Color mixing"],
        correctOptionIndex: 1,
        explanation: "Sudoku trains structured logical thinking and constraint-based solving.",
      },
    ],
  },
  {
    missionId: "code-debug-dash-m1",
    gameTitle: "Code Debug Dash",
    gameSubtitle: "Fix the bug before launch",
    summary:
      "Spot coding mistakes in short snippets and choose the correction that makes the program behave as intended.",
    howToPlay: [
      "Read the code intent and identify the bug source.",
      "Choose the fix that aligns logic with expected output.",
      "Use explanations to build debugging instincts.",
    ],
    questions: [
      {
        id: "debug-1",
        prompt: "If a condition should check equality, which operator is common in many languages?",
        options: ["=", "==", "->", "::"],
        correctOptionIndex: 1,
        explanation: "Many languages use `==` for equality checks in conditions.",
      },
      {
        id: "debug-2",
        prompt: "Loop runs forever because counter never changes. Best fix?",
        options: ["Remove loop", "Increment/decrement counter each pass", "Add more prints", "Rename variable"],
        correctOptionIndex: 1,
        explanation: "Counters must update so loop eventually reaches its stop condition.",
      },
      {
        id: "debug-3",
        prompt: "Function should return sum but prints sum instead. What is missing?",
        options: ["if statement", "return statement", "array sort", "nested loop"],
        correctOptionIndex: 1,
        explanation: "To pass value back to caller, use `return`.",
      },
      {
        id: "debug-4",
        prompt: "Index out of range appears on list of length 5. Last valid index is:",
        options: ["5", "4", "6", "0"],
        correctOptionIndex: 1,
        explanation: "Zero-based indexing means length 5 has indices 0..4.",
      },
      {
        id: "debug-5",
        prompt: "Input text should become number before math. Use:",
        options: ["Type conversion", "Comment", "Indentation only", "Whitespace"],
        correctOptionIndex: 0,
        explanation: "Convert input strings to numeric types before arithmetic.",
      },
      {
        id: "debug-6",
        prompt: "Bug appears only for negative values. Best test approach?",
        options: ["Test only positive values", "Add edge-case tests including negatives", "Skip tests", "Deploy first"],
        correctOptionIndex: 1,
        explanation: "Edge-case tests help reveal hidden logic bugs.",
      },
      {
        id: "debug-7",
        prompt: "Which action helps locate where a bug starts?",
        options: ["Delete half the code blindly", "Use logs/breakpoints step by step", "Rename all files", "Ignore warnings"],
        correctOptionIndex: 1,
        explanation: "Tracing execution with logs/breakpoints isolates defect locations.",
      },
      {
        id: "debug-8",
        prompt: "A variable is declared inside a block and unavailable outside. This is called:",
        options: ["Scope", "Latency", "Rendering", "Caching"],
        correctOptionIndex: 0,
        explanation: "Scope determines where variables can be accessed.",
      },
    ],
  },
  {
    missionId: "loop-lab-m1",
    gameTitle: "Loop Lab Challenge",
    gameSubtitle: "Build and predict algorithm flow",
    summary:
      "Master loops and algorithm sequencing by predicting outputs, selecting correct loop structures, and avoiding logic traps.",
    howToPlay: [
      "Read each algorithm challenge carefully.",
      "Choose the loop or output that matches the logic.",
      "Track patterns and stop conditions to maximize score.",
    ],
    questions: [
      {
        id: "loop-1",
        prompt: "A `for` loop is best when:",
        options: ["You know exact iteration count", "You never want to stop", "You avoid counters", "You only handle text"],
        correctOptionIndex: 0,
        explanation: "`for` loops fit known iteration ranges well.",
      },
      {
        id: "loop-2",
        prompt: "A `while` loop is best when:",
        options: ["Iteration count fixed", "Condition decides continuation", "No condition needed", "Arrays forbidden"],
        correctOptionIndex: 1,
        explanation: "`while` loops continue until condition becomes false.",
      },
      {
        id: "loop-3",
        prompt: "Loop from i=1 to i<=3 prints i. Output?",
        options: ["1 2", "1 2 3", "0 1 2 3", "2 3 4"],
        correctOptionIndex: 1,
        explanation: "Values printed are 1, 2, and 3.",
      },
      {
        id: "loop-4",
        prompt: "What does `break` do in a loop?",
        options: ["Skips current turn only", "Exits loop immediately", "Restarts loop", "Creates a variable"],
        correctOptionIndex: 1,
        explanation: "`break` stops loop execution instantly.",
      },
      {
        id: "loop-5",
        prompt: "What does `continue` usually do?",
        options: ["End program", "Skip current iteration and continue loop", "Exit function", "Freeze variable"],
        correctOptionIndex: 1,
        explanation: "`continue` jumps to next iteration.",
      },
      {
        id: "loop-6",
        prompt: "Nested loops often increase:",
        options: ["Code readability always", "Operation count", "Internet speed", "Battery health"],
        correctOptionIndex: 1,
        explanation: "Nested loops can multiply iterations and runtime cost.",
      },
      {
        id: "loop-7",
        prompt: "To avoid infinite loops, ensure:",
        options: ["Condition changes toward stop", "Condition is always true", "Counter never changes", "Loop has no body"],
        correctOptionIndex: 0,
        explanation: "Loop state must move toward termination.",
      },
      {
        id: "loop-8",
        prompt: "Looping through array items one by one is called:",
        options: ["Iteration", "Compilation", "Refactoring", "Encryption"],
        correctOptionIndex: 0,
        explanation: "Iteration means processing each element in sequence.",
      },
    ],
  },
  {
    missionId: "binary-bridge-m1",
    gameTitle: "Binary Bridge",
    gameSubtitle: "Computational thinking and logic gates",
    summary:
      "Cross the Binary Bridge by solving number-system and logic-gate mini challenges used in real computing systems.",
    howToPlay: [
      "Convert binary and decimal values correctly.",
      "Solve simple AND/OR/NOT logic decisions.",
      "Use each explanation to connect game puzzles to real-world computing.",
    ],
    questions: [
      {
        id: "binary-1",
        prompt: "Binary `101` equals decimal:",
        options: ["3", "4", "5", "6"],
        correctOptionIndex: 2,
        explanation: "1*4 + 0*2 + 1*1 = 5.",
      },
      {
        id: "binary-2",
        prompt: "Decimal 6 in binary is:",
        options: ["101", "110", "111", "100"],
        correctOptionIndex: 1,
        explanation: "6 = 4 + 2, so binary is 110.",
      },
      {
        id: "binary-3",
        prompt: "AND gate returns 1 when:",
        options: ["Any input is 1", "Both inputs are 1", "Both inputs are 0", "Inputs are different"],
        correctOptionIndex: 1,
        explanation: "AND requires all inputs true (1).",
      },
      {
        id: "binary-4",
        prompt: "OR gate returns 0 only when:",
        options: ["Both inputs are 0", "At least one input is 1", "Both inputs are 1", "Inputs are opposite"],
        correctOptionIndex: 0,
        explanation: "OR is false only if all inputs are false.",
      },
      {
        id: "binary-5",
        prompt: "NOT 1 equals:",
        options: ["1", "0", "2", "-1"],
        correctOptionIndex: 1,
        explanation: "NOT flips 1 to 0 in binary logic.",
      },
      {
        id: "binary-6",
        prompt: "Computers use binary mainly because hardware is built on:",
        options: ["Three stable states", "Two stable electrical states", "Only text processing", "No memory"],
        correctOptionIndex: 1,
        explanation: "Electronic circuits naturally map to on/off states.",
      },
      {
        id: "binary-7",
        prompt: "Binary `1000` equals decimal:",
        options: ["6", "7", "8", "9"],
        correctOptionIndex: 2,
        explanation: "1*8 + 0 + 0 + 0 = 8.",
      },
      {
        id: "binary-8",
        prompt: "Why are logic gates important in coding systems?",
        options: ["They cook data", "They form decision circuits", "They color UI", "They replace variables"],
        correctOptionIndex: 1,
        explanation: "Logic gates are the fundamental building blocks of computation.",
      },
    ],
  },
];

const missionGameByMissionId = missionGameCatalog.reduce<Record<string, MissionGameConfig>>(
  (acc, game) => {
    acc[game.missionId] = game;
    return acc;
  },
  {},
);

export function getMissionGameByMissionId(missionId: string) {
  return missionGameByMissionId[missionId];
}

export function isMissionGameMission(missionId: string) {
  return Boolean(missionGameByMissionId[missionId]);
}
