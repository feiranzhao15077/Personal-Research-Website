# F-22 integration and release — 2026-10-05

Scope: add latest supplied F-22 and review the existing site before its authorized production deployment.

## Changes

- F-22 aft revision 4, separately rendered transparent cover, eight supplied still views, compressed desktop/mobile/entrance models.
- Independent root rotation, weapon-bay toggle and once-through takeoff. Original Blender/GLB files preserved.
- Seven models grouped 4 / 3 with occupied sectors spread across each ring; no second-ring loading flash; selected-group return retained.
- Mobile function keys wrap beside return; underside orbit enabled; hovering no longer cancels active detail rotation.
- Bounded silhouette samples improve normal camera occupancy; full expanded/motion bounds retain component visibility. Desktop refinement no longer changes the current camera before swapping the mesh.

## Verification

- Production build: 16 routes; approved identity/CV gate and source/dist public-content scans passed.
- Internal link scan: no failures.
- Astro check: zero errors, warnings, hints.
- Browser inspection: F-22 root/hinge animation, takeoff completion/return, desktop/mobile layout, ring selection/return, representative existing animated model, home/personal-space/research routes. Screenshots stored here after the confirmation round.

No additional automated test suite was run.

## Production deployment
- Deployed successfully to https://zhaofeiran.pages.dev/ (deployment https://e8acd93e.zhaofeiran.pages.dev).
- Production model selector and F-22 detail returned HTTP 200; F-22 desktop model loaded, eight image views available, no horizontal overflow.
- Guide API availability endpoint returned available=true; no billed chat request was made.
- Production screenshot: f22-production.png. Deployment log: deploy.log.
