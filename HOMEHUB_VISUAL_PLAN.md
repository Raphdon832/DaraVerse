# Home Hub Visual Improvements Plan

## Visual Recommendations

### 1. Stronger Above-the-Fold Focus
- **Reduce Avatar Hero Height:** Decrease the hero section height from `360` down to around `220-240`. This will ensure that primary actions appear immediately without requiring the user to scroll.
- **Prioritize Key Actions:** Keep only the top 2 priorities visible first, such as `Continue Learning` and `Today's Plan`.
- **Integrate Progress Indicator:** Instead of having a separate heavy block for progress, integrate a compact progress indicator (like a weekly percentage ring or bar) directly inside the hero section.

### 2. Reduce "Card Fatigue" and Flattened Hierarchy
- **Level A (Hero / Primary CTA):** Use a bold gradient or high-contrast surface.
- **Level B (Interactive Modules):** Use a solid, elevated card.
- **Level C (Passive Info/History):** Use subtle, low-contrast containers.

### 3. Improve Visual Rhythm and Section Flow
- **Alternate Module Density:** Switch between dense strips and airy blocks to avoid scrolling fatigue (e.g., dense strip -> airy block -> dense strip).
- **Better Section Order:** Reorganize the screen to keep high-intent actions first and push passive content down:
  1. **Hero** (`Continue Learning` + progress micro-summary)
  2. **Today's Plan** (Timeline style rows showing max 2 tasks above fold)
  3. **Quick Actions** (Horizontally scrollable pills instead of a 2x2 tile grid for a cleaner scan line)
  4. **Mentor Live** (Horizontal cards)
  5. **Momentum block** (Merge Weekly Goal & Snapshot into a single horizontal rail)
  6. **For You**
  7. **Recent Activity** (Compact list rows)

### 4. Concrete UI Specs to Standardize
- **Shape System:** Use `28-32` radius for the Hero, `18-20` for standard cards, and `999` (fully rounded) for chips/buttons. Avoid mixing large radii like `24`, `30`, and `32` in the same viewport as it creates visual noise.
- **Color Strategy:** Keep one dominant accent per session based on the theme. Pastels should act as support, while neutral surfaces handle content-heavy sections. Reserve vibrant colors specifically for statuses and Call to Actions (CTAs).
- **Typography & Details:** Use section titles at `18/22` (weight `800`) and card titles at `16/20` (weight `700`). Increase the contrast of secondary text to avoid washed-out grays on tinted cards. Add a subtle bottom gradient overlay on the Avatar Showcase so text/CTA can sit on it legibly.
- **Motion:** Limit entrance animations to the first mount only and remove perpetual float loops on core content to prevent them from competing with CTAs. Provide subtle physical feedback on presses (e.g., scale `0.97` + slight opacity shift).

---

## Execution Steps

1. **Update Hero Section (Avatar Showcase & Continue Learning)**
   - Find the Avatar showcase container and reduce its height from `360` to `240`.
   - Update the "Edit Theme" button to a low-emphasis icon button.
   - Adjust `Continue Learning` card to be the visual anchor with a high-contrast surface.

2. **Reformat Quick Actions**
   - Extract the `Quick Actions` section.
   - Change it from a 2-column pastel block grid to a horizontal scrollable list of pill-shaped `999` radius buttons to save vertical space.

3. **Reformat Today's Plan**
   - Convert tasks into a timeline-style row with left status markers and right CTA chips.
   - Show only the top 2 tasks and provide a "See More" if applicable, or just slice.

4. **Combine Weekly Goal & Snapshot into 'Momentum'**
   - Take the "Weekly Goal" section and the "Progress Snapshot" (4 tiles).
   - Merge them into a single section with a progress bar at the top with 3 micro-stats below it.

5. **Reformat Recent Activity**
   - Convert Recent Activity cards into compact timeline rows with tighter vertical spacing and smaller icons.

6. **Reorder the HomeHub layout**
   - Ensure the `ScrollView` wraps the components in this specific order:
     - Hero (Avatar + Continue Learning)
     - Today's Plan
     - Quick Actions (Pill Rail)
     - Mentor Live
     - Momentum Block (Weekly progress + stats)
     - For You (Recommendations)
     - Recent Activity

7. **Review & Polish**
   - Apply typography refinements.
   - Clean up spacing tokens (`spacing.xl` vs `spacing.lg`).
   - Check contrast and adapt card surface colors for Level A, B, and C hierarchy.
