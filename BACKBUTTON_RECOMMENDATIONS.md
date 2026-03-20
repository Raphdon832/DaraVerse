# Back Button Recommendations

## Problem
- Current back behavior mostly uses `goBack()`, which depends on navigation history.
- This causes inconsistent outcomes:
  - Users can land on unrelated previous pages.
  - Deep links may produce confusing or broken back paths.
  - Flows feel unpredictable across tabs and sub-pages.

## Recommended Back Model
- Use **intent-based back navigation** instead of history-based navigation.
- Define deterministic destinations by screen role:
  - Tab home screens (`MissionsHome`, `STEMHome`, `ProjectsHome`, `MentorshipHome`, `AchievementsHome`) should go to `HomeHub`.
  - Detail screens should go to their feature home/list screen.
  - Sub-detail screens should go to their immediate parent detail/list.
  - Deep-link-safe fallbacks should always exist.

## Navigation Rules
- `MissionsHome` -> `HomeHub`
- `MissionDetail` -> `MissionsHome`
- `MissionGame` -> `MissionDetail`
- `MissionReflection` -> `MissionDetail`

- `STEMHome` -> `HomeHub`
- `STEMCategory` -> `STEMHome`

- `ProjectsHome` -> `HomeHub`
- `ProjectDetail` -> `ProjectsHome`
- `ProjectSubmission` -> `ProjectDetail`

- `MentorshipHome` -> `HomeHub`
- `MentorshipStories` -> `MentorshipHome`
- `MentorshipStoryDetail` -> `MentorshipStories`
- `MentorshipStoryTrivia` -> `MentorshipStoryDetail`

- `AchievementsHome` -> `HomeHub`
- `BadgeDetail` -> `AchievementsHome`
- `CertificateDetail` -> `AchievementsHome`

## Implementation Approach
- Add a centralized helper module for back targets (`src/navigation/backNavigation.ts`).
- Replace direct `goBack()` usages in header back actions with deterministic helper calls.
- Keep this as the default pattern for new screens.

## Why This Is Better
- Predictable: users always know where back leads.
- Deep-link-safe: no reliance on prior in-app history.
- Maintainable: route targets defined in one place.

## Phase Plan
- Phase 1 (current): core learner journeys across Missions, STEM, Projects, Mentorship, Achievements.
- Phase 2: admin/support flows (`AddMentor`, story admin/editor, profile/settings overlays, notifications).
- Phase 3: unsaved-change guards for editors/forms and optional breadcrumb-aware back labels.
