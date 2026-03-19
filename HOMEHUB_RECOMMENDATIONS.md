# Home Hub Visual Recommendations (V2)

## Design Goal
Make the Home Hub feel like a premium "mission control" screen: focused, energetic, and easier to scan in 3 seconds.

---

## What Should Change First

1. **Stronger Above-the-Fold Focus**
- Keep only 2 priorities visible first: `Continue Learning` + `Today's Plan`.
- Reduce avatar hero height from `360` to around `220-240` so actions appear immediately.
- Add a compact progress indicator inside hero (weekly % ring or bar), not a separate heavy block.

2. **Stop Card Fatigue**
- Right now most modules use similar rounded soft cards, which flattens hierarchy.
- Use 3 surface levels only:
  - **Level A (Hero / Primary CTA):** bold gradient or high-contrast surface.
  - **Level B (Interactive modules):** solid elevated card.
  - **Level C (Passive info):** subtle, low-contrast containers.

3. **Visual Rhythm and Density**
- Alternate module density: dense strip -> airy block -> dense strip.
- Replace some full cards with compact rows/chips (`Recent Activity`, `Quick Actions`) to reduce scrolling fatigue.

---

## Better Section Order (Visual + Behavioral)

1. Hero (`Continue Learning` + progress micro-summary)
2. Today's Plan (max 2 items above fold, third collapses under "See more")
3. Quick Actions (horizontal pill row, not 2x2 tile grid)
4. Mentor Live (horizontal cards)
5. Progress Snapshot (single horizontal rail)
6. For You
7. Recent Activity (compact timeline)

Reason: this order keeps high-intent actions first and pushes passive/history content down.

---

## Concrete UI Specs

### 1) Typography
- Section titles: `18/22`, weight `800`.
- Card titles: `16/20`, weight `700`.
- Supporting text: `13/18`, weight `500-600`.
- Metadata (time, counters): `11/14`, weight `600`.
- Increase contrast of secondary text (avoid washed-out gray on tinted cards).

### 2) Shape System
- Hero radius: `28-32`
- Standard card radius: `18-20`
- Chip/button radius: `999`
- Remove mixed large radii where not needed (`24` + `30` + `32` in same viewport feels noisy).

### 3) Color Strategy
- Keep one dominant accent per session (theme primary).
- Pastels should be support, not base for every module.
- Use neutral surfaces for content-heavy sections (`Plan`, `For You`, `Activity`) and reserve color for status + CTAs.
- Dark mode: raise text contrast by ~15-20% for subtitle/meta tokens.

### 4) Spacing Rhythm
- Section top spacing: `20-24`
- Internal card padding: `14-16`
- Row gaps inside lists: `8-10`
- Keep horizontal rails edge-to-edge with consistent inset; avoid changing inset rules between sections.

### 5) Motion
- Keep entrance animation only on first mount.
- Remove perpetual float loops on core content (constant motion competes with CTA focus).
- Press feedback: scale `0.97` max + subtle opacity shift.
- Celebration banner: slide/fade once, auto-dismiss in 2.2-2.8s.

---

## Home Hub Redesign Moves (Component by Component)

1. **Avatar Showcase**
- Reduce height.
- Add a subtle bottom gradient overlay so text/CTA can sit on it if needed.
- Keep "Edit Theme" control, but convert to a low-emphasis icon button.

2. **Continue Learning Card**
- Make this the visual anchor.
- Add one progress line (e.g., "Step 2 of 5") beneath subtitle.
- CTA button should be wider and higher contrast than all other buttons.

3. **Quick Actions**
- Replace 2-column pastel blocks with horizontally scrollable pills:
  - `Start Trivia`
  - `Ask Mentor`
  - `Submit Project`
  - `Achievements`
- Result: cleaner scan line and less visual bulk.

4. **Today's Plan**
- Use timeline-style rows with left status marker + right CTA chip.
- Show only top 2 tasks by default.

5. **Weekly Goal + Snapshot**
- Merge into one "Momentum" module:
  - Progress bar at top
  - 3 micro stats below
  - one short insight sentence
- Eliminates duplicate progress storytelling.

6. **Recent Activity**
- Convert to compact list rows (smaller icon, tighter vertical spacing).
- Cap to 4 rows and use "View all activity" link.

---

## Priority Delivery Plan

### Phase 1 (High Impact, 1 day)
- Shrink hero.
- Reorder sections.
- Convert Quick Actions to pill rail.
- Merge Weekly Goal + Snapshot into one momentum block.

### Phase 2 (Polish, 1-2 days)
- Apply typography and spacing scale cleanup.
- Reduce card/surface repetition.
- Tighten motion behavior and celebration timing.

### Phase 3 (Final quality pass)
- Contrast/accessibility checks across themes.
- Small-screen pass (no cramped chips/buttons).
- Visual consistency pass for icon size, radius, and shadow.

---

## Success Criteria

- A learner can identify the next action within 2 seconds.
- First screen scroll depth decreases.
- Tap-through on `Continue Learning` and `Today's Plan` increases.
- No section feels visually interchangeable with another.
