# Daraverse Building Plan

## Product Overview
Daraverse is a story-driven, gamified learning universe for young learners with a strong focus on girls in STEM. It combines interactive missions, skill-building tracks, mentorship access, projects, and achievement recognition to build digital literacy, STEM confidence, and leadership.

## Core Product Principles
1. Learning by doing inside story scenarios with stakes.
2. Rewards and progression through points, badges, and certificates.
3. Personalized learner experience through greetings and adaptive learning moments.
4. Accessibility support, including low-bandwidth delivery options like downloadable mission PDFs.

## Main App Pages (Home-Driven)
Home contains navigation to five first-class pages:
1. `STEM`
2. `Missions`
3. `Mentorship`
4. `Projects`
5. `Achievements`

Onboarding flow:
1. `Registration` screen appears first for new app state.
2. Learner enters name and selects avatar from a thumbnail grid.
3. Selected avatar is saved and user is routed to `HomeHub`.

Supporting mapping rules:
1. `Achievements` includes both badges and certificates.
2. `Trivia` and `Community` are represented inside `Missions` experiences.

## Segment Intent
### STEM
1. Topic tracks, guided lessons, and challenge-based progression.
2. Connects directly to mission performance and project readiness.

### Missions
1. Story episodes with decisions, quizzes/trivia, puzzle actions, and reflection.
2. Includes mission-linked trivia and mission-linked community experiences.
3. Primary narrative example: `Dara and the CyberQuest - The Missing Files`.

### Mentorship
1. Learners discover mentors and book guidance sessions.
2. Unlocks and teasers can be tied to mission outcomes and badge progress.

### Projects
1. Practical application tasks that turn learning into visible output.
2. Portfolio-friendly submissions and progress tracking.

### Achievements
1. Badge gallery, milestone timeline, and certificate tracking.
2. Proof layer for learners, mentors, parents, and schools.

## Mission Reference: Dara and the CyberQuest
Theme: Cybersecurity, critical thinking, leadership under pressure  
Target: Ages 10-16  
Playtime: 15-20 minutes  
Mode: In-app interactive flow + downloadable PDF option

Expected outcomes:
1. Identify phishing attempts and risky digital behavior.
2. Apply account safety actions.
3. Demonstrate calm leadership choices in a crisis.
4. Unlock mission-linked achievement and next-journey teaser.

## Standard Mission Structure
1. Episode intro with urgency and context.
2. First decision point.
3. Skills challenge (trivia/puzzle/action).
4. Consequence and coaching feedback.
5. Escalation phase.
6. Resolution with score and reward.
7. Reflection moment.
8. Next mission or mentorship teaser.

## Implementation Blueprint (React Native)
### Architecture
1. Root flow: `Launch -> Registration -> HomeHub -> MainTabs`.
2. Persistent bottom tabs: `STEM`, `Missions`, `Mentorship`, `Projects`, `Achievements`.
3. Each tab owns a dedicated stack navigator for detail screens.
4. Header home action on each tab root returns to `HomeHub`.

### Public Navigation Types
1. `RootStackParamList`
2. `MainTabKey`
3. `MainTabsParamList`
4. `STEMStackParamList`
5. `MissionsStackParamList`
6. `MentorshipStackParamList`
7. `ProjectsStackParamList`
8. `AchievementsStackParamList`

### Shared UI Contracts
1. `AppHeader`
2. `SearchField`
3. `QuickLinkCard`
4. `FeatureCard`
5. `ProgressCard`

## Visual Direction (Screenshot-Inspired)
1. Warm neutral base background.
2. Orange circular CTA accents.
3. Pastel category and card surfaces.
4. Large rounded cards and soft shadows.
5. Minimal chrome, clean icons, and spacious layout rhythm.

## Accessibility and Experience Rules
1. Touch target minimum: `44x44`.
2. Keep text contrast legible on pastel surfaces.
3. Dynamic type support for key content.
4. Provide loading, empty, and error states on major screens.
5. Keep transitions lightweight for low-end device performance.

## Execution Status
Current implementation status:
1. Expo TypeScript React Native app scaffolded.
2. Navigation and tab/stack structure implemented.
3. Global app state added for mission progress, project progress, badges, and certificates.
4. `HomeHub` and five main root screens implemented with live state-driven content.
5. Mission flow implemented end-to-end:
   - `MissionDetail`
   - `MissionPlayer` with decision scoring
   - `MissionReflection` with saved learner reflections
6. Project flow implemented:
   - `ProjectDetail`
   - `ProjectSubmission` with state updates
7. Achievement flow implemented with badge and certificate progress/detail screens.
8. Registration plus avatar selection flow implemented.
9. `HomeHub` now renders the selected full avatar directly under search before lower sections.
10. STEM trivia module implemented with five categories:
    - Coding
    - AI Literacy
    - Cybersecurity
    - Data Skills
    - Robotics/Climate Tech
11. Each STEM category now has:
    - summary
    - how-to-play instructions
    - play flow with randomized trivia session
12. Registration now captures learner age and assigns an age bracket:
    - 0-7
    - 8-10
    - 11-13
    - 14-16
    - 17+
13. STEM trivia questions are now tailored to the learner age bracket.
14. STEM trivia progress and badges are wired into the Achievements system.
15. Design specification documented in `DESIGN_DOCUMENT.md`.

## Next Build Steps
1. Persist app state to local storage and hydrate on app launch.
2. Replace in-code catalogs with backend APIs and authenticated learner profiles.
3. Expand mission player with richer branching consequences and retry analytics.
4. Add mentorship scheduling backend integration.
5. Build full project portfolio timeline with artifact uploads.
6. Add low-bandwidth PDF mission delivery path.
