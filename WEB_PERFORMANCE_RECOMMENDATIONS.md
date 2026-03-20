# Web Image Performance Recommendations

## Baseline Findings (Current State)

- Exported web build contains about `225 MB` of PNG assets in `dist`.
- Biggest contributors:
  - `public/UI_Assets/New Assets` -> about `59.96 MB` across 26 files.
  - `public/Avatars` -> about `26.97 MB` across 18 files.
  - `public/AvatarThumbnails` -> about `14.6 MB` across 19 files.
  - `assets/badges` -> about `6.15 MB` across 10 files.
- Several single PNGs are very heavy (`4.6 MB` to `5.7 MB` each), especially Mr. Okafor assets.
- Avatar thumbnails are still large (many around `0.7 MB` to `1.0 MB`) and are rendered in grids.
- Multiple first-run screens load large images early (registration/profile/home hero, mission visuals).

## Why Web Feels Slow

1. High total image payload and very large individual PNG files.
2. Large images loaded on initial screen renders before user interaction.
3. Avatar selection surfaces render many images at once.
4. Heavy mission visuals are preloaded too aggressively for web startup.
5. Cache policy can be improved for repeat visits.

## Prioritized Plan

### Phase 1: Fast Wins (Immediate)

1. Reduce first paint image pressure on web:
   - Keep full-size avatar rendering on web for visual fidelity.
   - Defer rendering of non-critical avatar options in registration.
2. Reduce splash preload pressure:
   - Preload only critical CyberQuest assets on splash screen.
   - Remove artificial preload delays and keep splash duration deterministic.
3. Add strong static cache headers on Netlify for hashed assets.

### Phase 2: Asset Optimization (High Impact)

1. Convert heavy PNG story visuals to WebP/AVIF where possible.
2. Regenerate avatar thumbnails to true thumbnail dimensions and lower compression targets.
3. Create size budget thresholds:
   - Thumbnail target: <= `80 KB`
   - Hero image target: <= `250 KB`
   - Full character art target: <= `500 KB` (web variants)

### Phase 3: Structural Improvements

1. Move runtime-app images out of `public/` into app asset folders to avoid duplicated export copies.
2. Add lazy rendering patterns for image-heavy lists and secondary sections.
3. Add build-time asset report and CI budget checks to prevent regressions.

## Implementation Progress

- [x] Baseline audit and hotspot identification.
- [x] Phase 1 code updates completed (registration avatar deferral, splash preload trim, cache headers).
- [x] Phase 2 asset conversion pipeline started with automated PNG optimization script.
- [x] Phase 3 structural optimization in progress (runtime assets migrated from `public` to `assets`, CI asset budgets enforced).

## Latest Result Snapshot

- Avatar display on web remains full-size in key profile/home/registration views.
- `public/AvatarThumbnails`: `14.6 MB` -> `0.29 MB`.
- `public/UI_Assets/New Assets`: `59.96 MB` -> `12.81 MB`.
- `assets/badges`: `6.15 MB` -> `1.94 MB`.
- Optimizer pass scanned 70 PNG files and saved about `71.75 MB`.
- Runtime app media moved out of `public/`, removing duplicate raw copy in web export.
- Current CI build metrics:
  - Dist total: `57.91 MB`
  - PNG total: `44.32 MB`
  - JS total: `4.06 MB`
  - Largest PNG: `1.84 MB`
