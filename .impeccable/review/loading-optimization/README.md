# Filled-ring and loading optimization — 2026-10-05

## Delivered
- Seven equal occupied sectors, no reserved blank position or pagination.
- Responsive WebP hero signature, portrait and drone; unchanged source copies and image provenance retained.
- Reusable GSAP quickTo pointer motion, one input update per animation frame, separate float and tilt transforms; no document-wide mouse tween creation. Pause passive hero motion offscreen, during scroll locks, and when hidden.
- Compact/coarse-pointer devices skip the blocking hero intro and passive drone animation. Desktop welcome retained.
- Decorative model entrances initialize near the viewport after 160ms dwell and an idle opportunity, with cancellation while passing, hidden or intro-locked. Viewer loading and controls retain priority. Entrance-only render budget reduced.
- Guide collision scan reads each content rectangle once instead of reading two sets of bounds.

## Evidence
Largest default variants of the three hero assets: 933,694 bytes before, 24,854 bytes after (97.3% smaller). Responsive browsers may select smaller variants. See image-metrics.json and hero-provenance.json. These are asset sizes, not field loading-time or FPS claims.

Build: 16 routes, release gate and public-content scan passed. Typecheck: 72 files, zero errors, warnings and hints. Layout detector: []. Bounded browser checks: desktop hero images and composition; no initial model mount; offscreen hero paused; entry subsequently loaded and rendered; mobile scroll unlocked, no pending intro or horizontal overflow; seven model links and zero empty sectors.

Deployment: https://9d7cd0c9.zhaofeiran.pages.dev (production https://zhaofeiran.pages.dev/). Primary-domain selector confirms seven occupied sectors and zero blanks; homepage uses the new WebP resources.
