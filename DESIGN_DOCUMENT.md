# Daraverse Mobile Design Specification

## Summary
This document defines the screenshot-inspired visual and interaction design for Daraverse in React Native. The app opens on a dedicated `HomeHub` and wires users into five main pages: `STEM`, `Missions`, `Mentorship`, `Projects`, and `Achievements`.

## Reference Direction
1. Tone: soft, playful, premium, youth-friendly, STEM-forward.
2. Layout feel: airy spacing, large rounded cards, pastel surfaces, clean iconography.
3. Color behavior: warm neutral background, orange primary CTA, pastel semantic colors.
4. Imagery style: illustrated character/scene cards with rounded media blocks.
5. UI emphasis: prominent circular CTA buttons, gentle shadows, minimal chrome.
6. Brand adaptation: Daraverse content and labels replace storybook content while keeping the same visual DNA.
7. Fidelity rule: emulate style patterns, do not clone assets one-to-one.

## Product IA and Navigation Wiring
### Root Flow
```text
Launch
-> HomeHub
-> MainTabs(initialTab?: MainTabKey)
```

### Main Tabs
1. `STEM`
2. `Missions`
3. `Mentorship`
4. `Projects`
5. `Achievements`

### Navigation Rules
1. App start destination is `HomeHub`.
2. `HomeHub` contains quick links to all five main pages.
3. Entering a page from `HomeHub` opens `MainTabs` with `initialTab` set to that page.
4. Bottom tabs remain persistent across the main tab root screens.
5. Each tab has its own stack navigator for detail screens.
6. Header home icon from any tab root returns user to `HomeHub`.
7. `Trivia` and `Community` are implemented as experiences inside `Missions`, not standalone top-level tabs.
8. Certificates are represented under `Achievements`.

### Tab Stack Ownership
1. `STEMStack`: track details, lesson details, challenge details.
2. `MissionsStack`: mission list, mission detail, mission player, mission reflection.
3. `MentorshipStack`: mentor list, mentor profile, session booking, session detail.
4. `ProjectsStack`: project board, project detail, submission, portfolio item detail.
5. `AchievementsStack`: badge gallery, badge detail, certificate status, milestone timeline.

## Important Public APIs / Interfaces / Types
### Navigation Route Contracts
```ts
export type MainTabKey =
  | 'STEM'
  | 'Missions'
  | 'Mentorship'
  | 'Projects'
  | 'Achievements';

export type RootStackParamList = {
  HomeHub: undefined;
  MainTabs: { initialTab?: MainTabKey } | undefined;
};

export type MainTabsParamList = {
  STEM: undefined;
  Missions: undefined;
  Mentorship: undefined;
  Projects: undefined;
  Achievements: undefined;
};
```

### Tab Stack Contracts
```ts
export type STEMStackParamList = {
  STEMHome: undefined;
  STEMTrackDetail: { trackId: string };
  STEMLessonDetail: { lessonId: string };
};

export type MissionsStackParamList = {
  MissionsHome: undefined;
  MissionDetail: { missionId: string };
  MissionPlayer: { missionId: string };
  MissionReflection: { missionId: string };
};

export type MentorshipStackParamList = {
  MentorshipHome: undefined;
  MentorProfile: { mentorId: string };
  SessionBooking: { mentorId: string };
};

export type ProjectsStackParamList = {
  ProjectsHome: undefined;
  ProjectDetail: { projectId: string };
  ProjectSubmission: { projectId: string };
};

export type AchievementsStackParamList = {
  AchievementsHome: undefined;
  BadgeDetail: { badgeId: string };
  CertificateDetail: { certificateId: string };
};
```

### Shared Component Contracts
```ts
type AppHeaderProps = {
  title?: string;
  showHomeAction?: boolean;
  onPressHome?: () => void;
  showNotification?: boolean;
};

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onVoicePress?: () => void;
};

type CategoryChipProps = {
  label: string;
  tone: 'pastelBlue' | 'pastelGreen' | 'pastelPurple' | 'pastelPeach';
  isActive?: boolean;
  onPress: () => void;
};

type FeatureCardProps = {
  title: string;
  subtitle?: string;
  durationLabel?: string;
  imageUri: string;
  onPress: () => void;
  ctaLabel?: string;
};

type ProgressCardProps = {
  label: string;
  value: string;
  helperText?: string;
};

type PrimaryFABProps = {
  icon: 'play' | 'resume' | 'plus';
  onPress: () => void;
  accessibilityLabel: string;
};

type BottomTabBarProps = {
  activeTab: MainTabKey;
  onTabPress: (tab: MainTabKey) => void;
};
```

## Visual System (Tokens)
### Color Tokens
| Token | Value | Usage |
|---|---|---|
| `colors.bg.canvas` | `#F6F3ED` | Global app background |
| `colors.bg.surface` | `#FFFCF7` | Cards and elevated surfaces |
| `colors.bg.soft` | `#EFE7D7` | Hero/header blob areas |
| `colors.text.primary` | `#1F1E1B` | Headings and primary text |
| `colors.text.secondary` | `#5F5B54` | Metadata and support text |
| `colors.text.inverse` | `#FFFFFF` | Text on strong CTA |
| `colors.cta.primary` | `#FF8A3D` | Primary circular actions |
| `colors.cta.primaryPressed` | `#F27627` | Pressed CTA state |
| `colors.border.soft` | `#E5DDCF` | Inputs and card borders |
| `colors.status.success` | `#2E9F6E` | Success states |
| `colors.status.warning` | `#F0A92C` | Warning states |
| `colors.pastel.blue` | `#DCE9FF` | Category and tag surfaces |
| `colors.pastel.green` | `#DDF5E7` | Category and tag surfaces |
| `colors.pastel.purple` | `#EADCFD` | Category and tag surfaces |
| `colors.pastel.peach` | `#FBE3D2` | Category and tag surfaces |

### Typography Tokens
| Token | Spec | Usage |
|---|---|---|
| `type.display.lg` | `Baloo2-Bold 32/38` | Hero heading |
| `type.display.md` | `Baloo2-SemiBold 24/30` | Section heading |
| `type.heading.sm` | `Baloo2-SemiBold 20/26` | Card heading |
| `type.body.md` | `Nunito-Regular 16/24` | Body copy |
| `type.body.sm` | `Nunito-Regular 14/20` | Supporting text |
| `type.label.md` | `Nunito-SemiBold 14/18` | Buttons, chips, tabs |
| `type.meta.xs` | `Nunito-SemiBold 12/16` | Metadata and timers |

Font fallback: `System` sans-serif if custom fonts are unavailable.

### Spacing Tokens
Use fixed spacing scale: `4`, `8`, `12`, `16`, `20`, `24`, `32`.

### Radius Tokens
Use radius scale: `12`, `16`, `20`, `24`, `32`.
Card default radius: `24`.
Pill/chip default radius: `20`.
Circular CTA radius: `999`.

### Shadow Tokens
| Token | Spec |
|---|---|
| `shadow.soft` | `0 4 16 rgba(31, 30, 27, 0.08)` |
| `shadow.card` | `0 8 20 rgba(31, 30, 27, 0.10)` |
| `shadow.fab` | `0 10 24 rgba(255, 138, 61, 0.30)` |

### Motion Tokens
| Token | Duration | Curve | Use |
|---|---|---|---|
| `motion.fast` | `120ms` | `ease-out` | Press state feedback |
| `motion.base` | `220ms` | `ease-out` | Card/state transitions |
| `motion.page` | `280ms` | `ease-in-out` | Screen transitions |
| `motion.stagger` | `50ms` step | `ease-out` | Sequential card reveal |

## Core Components
### AppHeader
1. Left slot supports back or home action.
2. Center contains page title.
3. Right slot supports notifications/settings/search.
4. Safe-area aware and consistent height across screens.

### Home Greeting Block
1. Avatar + personalized greeting text.
2. Supports learner name and streak summary.
3. Surface style: rounded rectangle with soft background.

### SearchField
1. Rounded full-width input.
2. Left icon for search.
3. Optional right circular voice action.
4. Placeholder examples: "Search missions, STEM topics, mentors".

### CategoryChip
1. Pastel background with icon and label options.
2. Active chip uses higher contrast and subtle border.
3. Horizontal scroll behavior on narrow screens.

### FeatureCard
1. Rounded media block on top.
2. Title, metadata (duration, level, score impact).
3. Floating circular CTA on lower-right.
4. Supports mission cards, mentor spotlight cards, and project templates.

### ProgressCard
1. Compact modules for streak, score, and completion.
2. Works in grid or horizontal rail.
3. Includes trend hints ("+2 this week").

### PrimaryFAB
1. Circular orange action button.
2. Icon-only by default; optional short label for accessibility mode.
3. Elevated shadow and pressed state color shift.

### BottomTabBar
1. Exactly five tabs: `STEM`, `Missions`, `Mentorship`, `Projects`, `Achievements`.
2. Active state uses orange icon and higher-contrast label.
3. Inactive state uses muted text/icon color.
4. Minimum touch target is `44x44`.

### StatusBadge
1. Reusable for mission levels and achievement state.
2. Tones: neutral, success, warning, highlight.
3. Small pill with icon optional.

## Screen Blueprints
### HomeHub
Purpose: personalized launch screen that routes users to all five main pages.

Layout blocks:
1. `AppHeader` with learner greeting and notification icon.
2. `SearchField` with optional voice action.
3. `QuickLinksRow` with five large pills/cards:
   - `Go to STEM`
   - `Go to Missions`
   - `Go to Mentorship`
   - `Go to Projects`
   - `Go to Achievements`
4. `Continue Learning` card showing last active item.
5. `Recommended Missions` horizontal card rail.
6. `Progress Snapshot` using `ProgressCard` trio.

Primary actions:
1. Tap quick link to open `MainTabs` at corresponding tab.
2. Tap recommendation to open mission detail in `MissionsStack`.
3. Tap progress block to open `Achievements`.

### STEM
Purpose: structured STEM learning tracks and concept progression.

Layout blocks:
1. Header + search/filter chips by topic and difficulty.
2. Continue-learning rail for paused lessons.
3. Topic tracks grid (Coding, Robotics, Data, Cyber Safety, Science Labs).
4. Concept cards with short summaries and estimated duration.

Primary actions:
1. Start or resume track.
2. Filter by level and topic.
3. Open lesson detail.

### Missions
Purpose: story-driven mission feed and mission player entry.

Layout blocks:
1. Header with mission status filter (`New`, `In Progress`, `Completed`).
2. Hero mission card with urgent scenario text.
3. Mission list with play/resume circular CTA.
4. Embedded modules:
   - `Trivia Challenge` card linked to mission context.
   - `Community Pulse` card for peer reactions and guided prompts.
5. Reflection prompt cards for completed missions.

Primary actions:
1. Play/resume mission.
2. Enter mission-linked trivia.
3. Join mission discussion prompt.

### Mentorship
Purpose: discover mentors and schedule guidance sessions.

Layout blocks:
1. Mentor spotlight card.
2. Mentor category chips (Cyber, Engineering, Leadership, Career).
3. Upcoming session cards.
4. Booking CTA and mentor profile cards.

Primary actions:
1. View mentor profile.
2. Book session.
3. Join upcoming mentorship session.

### Projects
Purpose: hands-on application and portfolio growth.

Layout blocks:
1. Active project board with status tags.
2. Suggested project templates.
3. Submission timeline and review status.
4. Portfolio highlights rail.

Primary actions:
1. Start project template.
2. Continue active project.
3. Submit project artifact.

### Achievements
Purpose: recognition center for badges, certificates, and milestones.

Layout blocks:
1. Header summary (`Total badges`, `Certificates earned`, `Current streak`).
2. Badge gallery grouped by mission and STEM tracks.
3. Certificate status section with download/share actions.
4. Milestone timeline and progress indicators.

Primary actions:
1. View badge detail.
2. Open certificate detail/download.
3. Navigate to recommended next challenge.

## Interaction and Motion
1. Card press state: scale to `0.98` with `motion.fast`.
2. Chip press state: shade darkens by `6%`, then returns.
3. Page transitions: fade plus slight upward translate (`8px` to `0px`) using `motion.page`.
4. Floating CTA press: lift shadow reduces briefly, icon scales to `0.95`.
5. Scroll behavior: sticky section headers on long feeds where content sections repeat.
6. Loading states: skeleton cards matching final dimensions.
7. Empty states: illustrated placeholder + one primary action.
8. Error states: concise copy + retry CTA + fallback navigation action.

## Accessibility and Responsiveness
1. Minimum touch target for all interactive elements: `44x44`.
2. Body text minimum size: `14`.
3. Contrast target: WCAG AA equivalent for text on pastel surfaces.
4. Dynamic type support for heading and body styles without clipping.
5. VoiceOver/TalkBack labels required for all icon-only buttons.
6. Respect reduced-motion setting by disabling non-essential stagger animation.
7. Support narrow phones (`320dp`) and large phones with adaptive spacing.
8. Preserve key CTA visibility above fold on common phone heights.

## Test Cases and Scenarios
1. Navigation: `HomeHub` quick links open the corresponding tab in `MainTabs`.
2. Tab persistence: all five tabs remain available on tab root screens.
3. Route integrity: route names and params match defined TypeScript contracts.
4. Visual parity: rounded cards, warm neutral background, orange circular CTA, pastel surfaces.
5. Content mapping: `STEM`, `Missions`, `Mentorship`, `Projects`, `Achievements` are first-class pages.
6. Achievement mapping: both badges and certificates render under `Achievements`.
7. Missions mapping: mission-linked trivia and community cards appear inside `Missions`.
8. Responsive behavior: no overlap or clipping at small and large phone widths.
9. Accessibility behavior: touch target and screen-reader labels validated across components.

## Implementation Handoff Notes
1. Navigation library assumption: React Navigation with `NativeStack` + `BottomTabs`.
2. Build order:
   - Implement token constants.
   - Implement shared components.
   - Implement `HomeHub`.
   - Implement each tab root screen.
   - Implement detail screens per stack.
3. Keep tab labels exactly:
   - `STEM`
   - `Missions`
   - `Mentorship`
   - `Projects`
   - `Achievements`
4. Ensure Home icon behavior is consistent on every tab root header.
5. Keep animation lightweight for lower-end devices.
6. Use placeholder illustration assets until branded final assets are delivered.

## Assumptions and Defaults
1. Project root is `d:\Daraverse-Native`.
2. This spec emulates screenshot style, not exact visual duplication.
3. `HomeHub` is a dedicated landing dashboard.
4. `Trivia` and `Community` remain embedded under `Missions`.
5. Certificates are represented inside `Achievements`.

## Acceptance Checklist
- [ ] `DESIGN_DOCUMENT.md` exists at project root.
- [ ] All required sections are present and complete.
- [ ] HomeHub-to-five-page wiring is explicitly documented.
- [ ] Persistent bottom tabs are specified and named correctly.
- [ ] Public route/interface/type contracts are included.
- [ ] Visual tokens for color, typography, spacing, radius, shadow, and motion are defined.
- [ ] Screen blueprints exist for HomeHub, STEM, Missions, Mentorship, Projects, Achievements.
- [ ] Accessibility and responsive rules are documented.
- [ ] Test scenarios cover navigation, mapping, visual parity, responsiveness, and accessibility.
