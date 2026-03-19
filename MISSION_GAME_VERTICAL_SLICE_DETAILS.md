# Mission Game Vertical Slice Details

## Scope
This vertical slice replaces quiz-only interaction for:
- `chess-tactics-m1` (Chess Tactics Arena)
- `sudoku-sprint-m1` (Sudoku Sprint)

Both now run as direct 2D interaction games inside the existing `MissionGame` route and still complete through the same mission progression flow (`completeMission` -> `MissionReflection`).

---

## Chess Tactics Arena (2D Tactical Board)

### Core loop
1. Briefing screen explains controls, penalties, and scoring.
2. Player enters Objective 1-5 with a live timer and board state.
3. Player taps a white piece, then taps a legal destination.
4. Move is checked against the scripted objective line:
   - Correct move advances the line.
   - Wrong tactical choice resets board to objective start.
5. Objective result screen shows stars, score, and tactical feedback.
6. Session report aggregates all objective outcomes.

### Objective design
- `cta-1` Hanging queen conversion (`Qxd7`)
- `cta-2` Knight fork (`Nf6+`)
- `cta-3` Defensive interposition (`Bg2`)
- `cta-4` Diagonal finisher (`Qxh7#`)
- `cta-5` Two-step sacrifice sequence (`Qh7+`, forced `Kxh7`, then `Re8#`)

### Input and board rules
- Real board coordinates (`a1` to `h8`)
- Legal movement by piece type:
  - King, Queen, Rook, Bishop, Knight, Pawn
- Captures supported
- Threat visualization from enemy attacks
- Hint overlays show expected `from -> to` square for active step

### Penalties and assist
- Wrong tactical choice:
  - Objective resets to initial board
  - `-8s` timer penalty
- Manual board reset:
  - `-6s` timer penalty
- Hint usage:
  - `-5s` timer penalty
  - adds hint penalty in scoring formula

### Chess scoring
- Base objective score: `220`
- Time bonus: `secondsRemaining * 2`
- Penalties:
  - `wrongMoves * 30`
  - `hintsUsed * 25`
  - `resetsUsed * 15`
- Min solved objective score: `80`
- Objective max score: `220 + (timeLimitSec * 2)`
- Stars:
  - `3`: no hints, <=1 wrong move, strong remaining time
  - `2`: low mistakes/hints
  - `1`: solved with heavier penalties

---

## Sudoku Sprint (2D Logic Grid)

### Core loop
1. Briefing screen explains timed elimination mechanics and combo system.
2. Player enters Objective 1-3 with live timer and score HUD.
3. Player taps a grid cell and picks a number from keypad.
4. Entry is validated against the solution:
   - Correct entry is committed and combo increases.
   - Wrong entry is rejected, combo breaks, time is deducted.
5. Objective result shows logic quality metrics.
6. Session report aggregates all objective outcomes.

### Objective design
- `ss-1`: 4x4 row/column elimination
- `ss-2`: 4x4 box-pressure sprint
- `ss-3`: 6x6 (2x3 boxes) logic run

### Grid behavior
- Dynamic board sizing based on objective (`4x4`, `6x6`)
- Fixed cells are non-editable
- Selected cell, related row/col/block, and conflicts are highlighted
- Number pad auto-scales to objective size

### Penalties and assist
- Wrong entry:
  - rejected (not placed)
  - combo reset
  - `-6s` timer penalty
  - conflict flash on affected cells
- Hint:
  - auto-fills a valid empty cell
  - combo reset
  - `-4s` timer penalty
- Clear cell:
  - clears selected editable value
  - combo reset

### Sudoku scoring
- Base objective score: `240`
- Placement score: gained on each correct entry
  - `18 + min(4, combo) * 14`
- Time bonus: `secondsRemaining * 3`
- Penalties:
  - `mistakes * 28`
  - `hintsUsed * 35`
- Min solved objective score: `90`
- Objective max score:
  - `240 + (timeLimitSec * 3) + (fillableCells * 60)`
- Stars:
  - `3`: no mistakes, no hints, strong remaining time
  - `2`: low mistakes/hints
  - `1`: solved with heavier penalties

---

## Mission Integration

### Routing behavior
- `MissionGameScreen` now branches:
  - `chess-tactics-m1` -> `ChessTacticsArenaVerticalSlice`
  - `sudoku-sprint-m1` -> `SudokuSprintVerticalSlice`
  - All other missions still use existing quiz implementation

### Completion behavior
Both vertical slices submit:
- `sessionScore`
- `sessionMaxScore`

Through existing flow:
1. `completeMission({ missionId, score: sessionScore })`
2. `navigation.navigate("MissionReflection", { missionId, sessionScore, maxScore: sessionMaxScore })`

This preserves badges, streak updates, mission progress, and reflection flow.

