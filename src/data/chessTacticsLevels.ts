export type ChessPieceColor = "w" | "b";
export type ChessPieceType =
  | "king"
  | "queen"
  | "rook"
  | "bishop"
  | "knight"
  | "pawn";

export type ChessPieceState = {
  id: string;
  color: ChessPieceColor;
  type: ChessPieceType;
  square: string;
};

export type ChessAutoReply = {
  from: string;
  to: string;
  notation: string;
  explanation: string;
};

export type ChessScriptedMove = {
  from: string;
  to: string;
  notation: string;
  explanation: string;
  autoReply?: ChessAutoReply;
};

export type ChessTacticsLevel = {
  id: string;
  title: string;
  objective: string;
  tacticalPattern: string;
  briefing: string;
  hint: string;
  mentorDebrief: string;
  timeLimitSec: number;
  initialPieces: ChessPieceState[];
  requiredLine: ChessScriptedMove[];
};

export const chessTacticsLevels: ChessTacticsLevel[] = [
  {
    id: "cta-1",
    title: "Objective 1: Hanging Queen Punish",
    objective: "Capture the unprotected queen in one precise move.",
    tacticalPattern: "Material Conversion",
    briefing:
      "Scan the board before moving. The first objective trains threat awareness: find the highest-value piece that is undefended and convert immediately.",
    hint:
      "Trace queen lines from your major pieces. If a direct path exists and the target has no protection, take it.",
    mentorDebrief:
      "Strong tactical players remove hanging pieces instantly and avoid overthinking obvious value wins.",
    timeLimitSec: 75,
    initialPieces: [
      { id: "wk", color: "w", type: "king", square: "g1" },
      { id: "wq", color: "w", type: "queen", square: "d1" },
      { id: "wr1", color: "w", type: "rook", square: "a1" },
      { id: "wb1", color: "w", type: "bishop", square: "c4" },
      { id: "wn1", color: "w", type: "knight", square: "f3" },
      { id: "wp1", color: "w", type: "pawn", square: "f2" },
      { id: "wp2", color: "w", type: "pawn", square: "g2" },
      { id: "wp3", color: "w", type: "pawn", square: "h2" },
      { id: "bk", color: "b", type: "king", square: "g8" },
      { id: "bq", color: "b", type: "queen", square: "d7" },
      { id: "br1", color: "b", type: "rook", square: "a8" },
      { id: "bb1", color: "b", type: "bishop", square: "e7" },
      { id: "bp1", color: "b", type: "pawn", square: "f7" },
      { id: "bp2", color: "b", type: "pawn", square: "g7" },
      { id: "bp3", color: "b", type: "pawn", square: "h7" },
    ],
    requiredLine: [
      {
        from: "d1",
        to: "d7",
        notation: "Qxd7",
        explanation:
          "Correct. You converted a hanging queen and gained decisive material without risk.",
      },
    ],
  },
  {
    id: "cta-2",
    title: "Objective 2: Fork Strike",
    objective: "Execute a knight fork that attacks king and queen together.",
    tacticalPattern: "Double Attack",
    briefing:
      "This objective builds tactical calculation. Find the knight jump that creates two threats at once so your opponent cannot save both targets.",
    hint:
      "Knight forks work when one jump attacks high-value pieces on different lines. Search forcing checks first.",
    mentorDebrief:
      "Forks are powerful because they compress two tactical goals into a single tempo move.",
    timeLimitSec: 80,
    initialPieces: [
      { id: "wk", color: "w", type: "king", square: "g1" },
      { id: "wq", color: "w", type: "queen", square: "d1" },
      { id: "wn1", color: "w", type: "knight", square: "e4" },
      { id: "wb1", color: "w", type: "bishop", square: "c2" },
      { id: "wp1", color: "w", type: "pawn", square: "f2" },
      { id: "wp2", color: "w", type: "pawn", square: "g2" },
      { id: "wp3", color: "w", type: "pawn", square: "h2" },
      { id: "bk", color: "b", type: "king", square: "h7" },
      { id: "bq", color: "b", type: "queen", square: "g8" },
      { id: "br1", color: "b", type: "rook", square: "f8" },
      { id: "bp1", color: "b", type: "pawn", square: "g7" },
      { id: "bp2", color: "b", type: "pawn", square: "h6" },
    ],
    requiredLine: [
      {
        from: "e4",
        to: "f6",
        notation: "Nf6+",
        explanation:
          "Perfect fork. Your knight attacks the king and queen in one move, forcing a winning trade.",
      },
    ],
  },
  {
    id: "cta-3",
    title: "Objective 3: King Shield",
    objective: "Neutralize the rook attack by interposing the right defender.",
    tacticalPattern: "Defensive Interposition",
    briefing:
      "Tactics are not only attacks. This objective trains emergency defense: stop direct pressure on your king before launching counterplay.",
    hint:
      "Look for a move that places a piece between your king and the attacking rook while preserving structure.",
    mentorDebrief:
      "Great decision-makers stabilize first, then counterattack. Safety before greed.",
    timeLimitSec: 85,
    initialPieces: [
      { id: "wk", color: "w", type: "king", square: "g1" },
      { id: "wq", color: "w", type: "queen", square: "d1" },
      { id: "wb1", color: "w", type: "bishop", square: "f1" },
      { id: "wr1", color: "w", type: "rook", square: "a1" },
      { id: "wp1", color: "w", type: "pawn", square: "f2" },
      { id: "wp2", color: "w", type: "pawn", square: "h2" },
      { id: "bk", color: "b", type: "king", square: "e8" },
      { id: "bq", color: "b", type: "queen", square: "d7" },
      { id: "br1", color: "b", type: "rook", square: "g8" },
      { id: "bp1", color: "b", type: "pawn", square: "f7" },
      { id: "bp2", color: "b", type: "pawn", square: "h7" },
    ],
    requiredLine: [
      {
        from: "f1",
        to: "g2",
        notation: "Bg2",
        explanation:
          "Correct defense. You built a king shield and interrupted the active rook pressure.",
      },
    ],
  },
  {
    id: "cta-4",
    title: "Objective 4: Diagonal Finisher",
    objective: "Find the forcing queen capture that closes the attack.",
    tacticalPattern: "Mate Net Conversion",
    briefing:
      "This objective rewards pattern memory. Calculate the diagonal route and commit only when the final square creates unavoidable threats.",
    hint:
      "Inspect the long diagonal from your queen. Capturing on the edge can break king shelter immediately.",
    mentorDebrief:
      "Elite players visualize destination impact before moving, not after moving.",
    timeLimitSec: 90,
    initialPieces: [
      { id: "wk", color: "w", type: "king", square: "g1" },
      { id: "wq", color: "w", type: "queen", square: "d3" },
      { id: "wb1", color: "w", type: "bishop", square: "c2" },
      { id: "wr1", color: "w", type: "rook", square: "e1" },
      { id: "wp1", color: "w", type: "pawn", square: "g2" },
      { id: "wp2", color: "w", type: "pawn", square: "h2" },
      { id: "bk", color: "b", type: "king", square: "h8" },
      { id: "br1", color: "b", type: "rook", square: "f8" },
      { id: "bp1", color: "b", type: "pawn", square: "g7" },
      { id: "bp2", color: "b", type: "pawn", square: "h7" },
    ],
    requiredLine: [
      {
        from: "d3",
        to: "h7",
        notation: "Qxh7#",
        explanation:
          "Direct conversion. The queen strike on h7 tears open king shelter and finishes the tactic.",
      },
    ],
  },
  {
    id: "cta-5",
    title: "Objective 5: Sacrifice Sequence",
    objective: "Execute a two-move tactical line with a forced enemy reply.",
    tacticalPattern: "Decoy and Back-Rank Finish",
    briefing:
      "Final objective: combine planning and precision. You must choose the correct sacrifice, absorb the forced response, and land the finishing rook move.",
    hint:
      "Step 1 drags the king off the back rank. Step 2 exploits the opened file immediately.",
    mentorDebrief:
      "Strong players think in sequences, not single moves. Build the line before touching the board.",
    timeLimitSec: 105,
    initialPieces: [
      { id: "wk", color: "w", type: "king", square: "g1" },
      { id: "wq", color: "w", type: "queen", square: "h5" },
      { id: "wr1", color: "w", type: "rook", square: "e1" },
      { id: "wb1", color: "w", type: "bishop", square: "d3" },
      { id: "wp1", color: "w", type: "pawn", square: "g2" },
      { id: "wp2", color: "w", type: "pawn", square: "h2" },
      { id: "bk", color: "b", type: "king", square: "g8" },
      { id: "bq", color: "b", type: "queen", square: "d8" },
      { id: "br1", color: "b", type: "rook", square: "f8" },
      { id: "bp1", color: "b", type: "pawn", square: "g7" },
      { id: "bp2", color: "b", type: "pawn", square: "h7" },
    ],
    requiredLine: [
      {
        from: "h5",
        to: "h7",
        notation: "Qh7+",
        explanation:
          "Excellent sacrifice. You force the king onto a vulnerable square and open the file.",
        autoReply: {
          from: "g8",
          to: "h7",
          notation: "Kxh7",
          explanation:
            "Forced response executed. The king captures, but now the e-file tactic is live.",
        },
      },
      {
        from: "e1",
        to: "e8",
        notation: "Re8#",
        explanation:
          "Conversion complete. The rook entry on e8 ends the sequence with decisive pressure.",
      },
    ],
  },
];

