# STEM Trivia Expansion Spec (Pre-Implementation)

## Purpose
Define the implementation requirements for the STEM section update before coding.

## Required STEM Categories
The STEM page must expose exactly these five category buttons/pages:
1. Coding
2. AI Literacy
3. Cybersecurity
4. Data Skills
5. Robotics/Climate Tech

## UX Flow
1. User opens `STEM` tab.
2. User sees the five category buttons listed above.
3. User taps a category to open that category page.
4. Category page shows:
   - Game summary (what the game covers)
   - How-to-play instructions
   - `Play` button
5. User taps `Play` to start a randomized trivia session for that category.
6. After session completion, score and progress are saved and badge/achievement rules are evaluated.

## Category Page Content Requirements
Each category page must contain:
1. Category title and short visual header.
2. `About this game` section:
   - What learners will practice
   - Why it matters in real life
3. `How to play` section:
   - Number of questions per session
   - How points are awarded
   - How badges are unlocked
4. Primary `Play` CTA button.

## Question Bank Requirements
1. Each category must include at least 100 unique questions.
2. Total minimum question count across STEM trivia: 500 questions.
3. Questions must be presented randomly, not sequentially.
4. Session question selection must be sampled from a shuffled pool.
5. No duplicate question should appear within the same session.
6. Recommended session length: 10 questions per run.
7. Question types: multiple-choice with one correct answer.

## Age Personalization Requirements
1. Registration must capture learner age.
2. System must map age to bracket:
   - `0-7`
   - `8-10`
   - `11-13`
   - `14-16`
   - `17+`
3. STEM trivia must select questions from the learner's age bracket pool.
4. Each category must have at least 100 questions per age bracket.

## Randomization Rules
1. At session start, randomize category pool and select session questions.
2. Persist a `recentlySeenQuestionIds` list per category.
3. Avoid repeating recently seen questions across consecutive sessions until practical.
4. Fallback behavior:
   - If unseen pool is too small, refill from full bank and continue random selection.

## Data Model Requirements
Add STEM trivia domain types:
1. `StemCategoryId = "coding" | "ai_literacy" | "cybersecurity" | "data_skills" | "robotics_climate_tech"`
2. `TriviaQuestion`:
   - `id: string`
   - `categoryId: StemCategoryId`
   - `prompt: string`
   - `options: string[]`
   - `correctOptionIndex: number`
   - `explanation: string`
   - `difficulty: "easy" | "medium" | "hard"`
   - `tags: string[]`
3. `StemTriviaSession`:
   - `sessionId: string`
   - `categoryId: StemCategoryId`
   - `questionIds: string[]`
   - `answers: Record<string, number>`
   - `score: number`
   - `startedAtIso: string`
   - `completedAtIso?: string`
4. `StemTriviaProgress` per category:
   - `sessionsPlayed: number`
   - `bestScore: number`
   - `averageScore: number`
   - `recentlySeenQuestionIds: string[]`

## Navigation Updates Required
Update `STEMStack` routes to include dedicated category and trivia screens:
1. `STEMCategory: { categoryId: StemCategoryId }`
2. `STEMTriviaPlayer: { categoryId: StemCategoryId }`
3. `STEMTriviaResult: { categoryId: StemCategoryId; score: number; total: number }`

## Achievement and Badge Wiring Requirements
STEM trivia must be integrated with existing badge/achievement state.

### Badge Rules
Add STEM trivia badges:
1. `coding-quiz-starter` -> complete first Coding session.
2. `ai-literacy-starter` -> complete first AI Literacy session.
3. `cybersecurity-starter` -> complete first Cybersecurity session.
4. `data-skills-starter` -> complete first Data Skills session.
5. `robotics-climate-starter` -> complete first Robotics/Climate Tech session.
6. Category mastery badge per category -> score >= 80% in at least 3 sessions of that category.
7. Optional all-category badge -> complete at least one session in all five categories.

### Achievement Screen Integration
1. New STEM badges must appear in `Achievements` badge gallery.
2. Badge detail view must support STEM trivia badge metadata and unlock condition text.
3. Trivia completions must contribute to overall learner progress summary.

### Certificate Integration
1. Keep current certificate logic intact.
2. Add STEM trivia progression as a future-compatible metric (tracked now, can become rule input later).

## Content Storage Plan
Question bank source files:
1. `src/data/stemTrivia/coding.json` (>=100)
2. `src/data/stemTrivia/ai-literacy.json` (>=100)
3. `src/data/stemTrivia/cybersecurity.json` (>=100)
4. `src/data/stemTrivia/data-skills.json` (>=100)
5. `src/data/stemTrivia/robotics-climate-tech.json` (>=100)

Metadata index file:
1. `src/data/stemTrivia/index.ts` exports combined maps and lookup helpers.

## State Management Plan
Extend app context state to include:
1. `stemTriviaProgressByCategory`
2. `activeStemTriviaSession`

Add app actions:
1. `START_STEM_TRIVIA_SESSION`
2. `SUBMIT_STEM_TRIVIA_ANSWER`
3. `COMPLETE_STEM_TRIVIA_SESSION`
4. `UPDATE_STEM_BADGE_UNLOCKS`

## Scoring Rules
1. Correct answer: +10 points
2. Incorrect answer: +0 points
3. Session score percentage = `score / (questionCount * 10) * 100`
4. Save:
   - raw score
   - percentage
   - completion timestamp

## Validation and Acceptance Criteria
1. STEM tab shows exactly five required category buttons.
2. Each category opens a dedicated page with summary, how-to-play, and play button.
3. Each category has at least 100 questions in data.
4. Trivia questions are random and non-sequential.
5. No duplicate question appears in a single session.
6. Session completion updates progress state and appears in achievements context.
7. STEM trivia badges unlock correctly and display in Achievements.
8. App compiles and navigation type checks pass after implementation.

## Out of Scope (This Phase)
1. Remote backend content management for question banks.
2. Multiplayer trivia modes.
3. Voice-based trivia interaction.
4. Adaptive AI-generated questions.
