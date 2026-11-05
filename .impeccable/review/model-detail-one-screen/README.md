# One-screen model detail refinement — 2026-10-05

## Scope
All seven model detail routes share the updated template. Loading posters now use centred `object-fit: contain` framing. The viewer fills remaining viewport height; the lower expandable gallery and detail footer are removed. A short top button switches between the preserved 3D model and a photo panel. Entrances and the selector keep their existing behavior.

## Bounded verification
- Astro typecheck: 72 files, zero errors, warnings or hints.
- Layout detector: `[]`.
- Production build: 16 routes; public-content scan passed. No test suites added or run.
- Desktop 1440 × 900: full aircraft visible; document dimensions 1440 × 900; poster bounds equal the viewer surface and use `contain`.
- Mobile 390 × 844: model/photo modes occupy one page; guide dock reserved. The first inspection found thumbnail intrinsic sizing widening the photo panel. Set its grid item and stack to `min-width: 0`; one confirmation showed a 354.4px panel within the 390px viewport and document height 844px.
- Actual interactions: photo switch, next view, native high-resolution viewer open/close, Escape returning to the model, and sector click into the production detail route.
- Screenshots: `desktop-model.png`, `desktop-photos.png`, `mobile-model.png`, `mobile-photos.png`, `production.png`.

## Deployment
Cloudflare Pages production branch `main`, project `zhaofeiran`.
Immutable URL: https://1c02902b.zhaofeiran.pages.dev
Production: https://zhaofeiran.pages.dev/models/
Temporary local browser tab closed; responsive viewport override reset. No Git commit or push.
