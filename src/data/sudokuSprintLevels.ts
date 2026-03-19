export type SudokuCellValue = number | null;

export type SudokuSprintLevel = {
  id: string;
  title: string;
  objective: string;
  briefing: string;
  keySkill: string;
  mentorDebrief: string;
  timeLimitSec: number;
  size: number;
  blockRows: number;
  blockCols: number;
  puzzle: SudokuCellValue[][];
  solution: number[][];
};

export const sudokuSprintLevels: SudokuSprintLevel[] = [
  {
    id: "ss-1",
    title: "Objective 1: Row and Column Locks",
    objective:
      "Complete the 4x4 grid using row and column elimination without random guessing.",
    briefing:
      "Start with the rows that already contain two or more values. Eliminate impossible candidates quickly and place only forced values.",
    keySkill: "Constraint Elimination",
    mentorDebrief:
      "Fast solvers trust elimination and avoid speculative entries. A single clean pass can open the whole puzzle.",
    timeLimitSec: 80,
    size: 4,
    blockRows: 2,
    blockCols: 2,
    puzzle: [
      [1, null, 3, null],
      [null, 4, null, 2],
      [2, null, 4, null],
      [null, 3, null, 1],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  {
    id: "ss-2",
    title: "Objective 2: Box Pressure Sprint",
    objective:
      "Solve a tighter 4x4 board by combining row, column, and mini-box checks every move.",
    briefing:
      "Before placing each number, confirm three constraints: row, column, and box. Keep a rhythm and protect your combo streak.",
    keySkill: "Multi-Constraint Verification",
    mentorDebrief:
      "Consistency beats speed spikes. Verify all three constraints and your accuracy stays high even under pressure.",
    timeLimitSec: 75,
    size: 4,
    blockRows: 2,
    blockCols: 2,
    puzzle: [
      [1, null, null, 2],
      [null, 2, 1, null],
      [2, null, 3, null],
      [null, 4, null, 1],
    ],
    solution: [
      [1, 3, 4, 2],
      [4, 2, 1, 3],
      [2, 1, 3, 4],
      [3, 4, 2, 1],
    ],
  },
  {
    id: "ss-3",
    title: "Objective 3: 6x6 Logic Run",
    objective:
      "Complete a 6x6 sprint puzzle while maintaining low mistakes and stable combo momentum.",
    briefing:
      "Use region scanning in 2x3 boxes to unlock chained placements. Every wrong input costs time, so prioritize certainty.",
    keySkill: "Pattern Chaining Under Time",
    mentorDebrief:
      "Advanced Sudoku is still elimination. Work from forced cells, chain implications, and keep composure.",
    timeLimitSec: 130,
    size: 6,
    blockRows: 2,
    blockCols: 3,
    puzzle: [
      [1, null, 3, null, null, 6],
      [null, 5, null, 1, 2, null],
      [2, null, 4, null, 6, null],
      [null, 6, null, 2, null, 4],
      [3, null, 5, null, 1, null],
      [null, 1, null, 3, null, 5],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 4, 5, 6, 1],
      [5, 6, 1, 2, 3, 4],
      [3, 4, 5, 6, 1, 2],
      [6, 1, 2, 3, 4, 5],
    ],
  },
];

