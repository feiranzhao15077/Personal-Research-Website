disposition: ship

Current disposition covers the two scored fixes only. The original five-section review below is retained as pre-fix evidence; the post-fix verdict at the end supersedes its open findings.

Fresh delegated reviewer; file-only review, no browser or implementation edits. This is the precisely pinned, code-led 3D replacement: no approved comp or QUALITY BAR card was supplied; comp reproduction, concept-roll seed and whole-site design drift are outside this pass. Interaction and build results are the parent's recorded evidence, supported by the sampled source, rather than independently replayed here.

## persistence

Pass. PRODUCT.md and `.impeccable/surfaces/model-cabinet.md` exist; the revised surface contract explicitly supersedes the rejected image presentation. The named 11 captures were all opened and are valid for their claimed surfaces: `desktop-home-entry.png`, `desktop-space-entry.png`, `desktop-collection.png`, `desktop-lit-orbit.png`, `desktop-detail.png`, `desktop-orbit.png`, `desktop-photos.png`, `mobile-home-entry.png`, `mobile-space-entry.png`, `mobile-collection.png`, `mobile-detail.png`. Most desktop files are 1265×712, the photo dialog is 1280×720; mobile viewport files are 375×811 and the full-page detail is 375×920. Their proportions and contents are consistent with the reported 1280×720 / 390×844 viewports; the full-page detail includes its document top. No required image is absent, blank or mislabeled. The supplied detector file is `[]`; the parent reports successful typecheck, build and public-content scan. No second detector or test pass was run.

## fidelity

| Element | State | Findings / evidence |
| --- | --- | --- |
| TYPE | match | Quiet Chinese serif headings, restrained body copy and deep-blue controls keep the established identity in both viewport classes. |
| MATERIAL | match | Actual GLTFLoader-loaded aircraft, physical glass planes, three-dimensional case edges, circular platter, two lamp meshes and SpotLights are present in `src/lib/model-stage-runtime.ts`. The collection, changed lit camera, detail and front orbit captures show real volume and supplied surface detail. |
| GROUND | match | Transparent WebGL clear blends into the existing page; code retains `#f7f7f2` stage ground and `#f8f6f2` photographic ground. Warm personal-space ground and the academic page field remain coherent in the captures. |
| Entrance placement and navigation | match | Homepage map entrance and stationary personal-space introduction entrance are present on desktop/mobile, above the moving gallery. `ModelCabinetEntrance.astro` makes each whole entrance a link to `/models/`. |
| Complete closed-case framing | contradicted | In `desktop-collection.png` the nearest cabinet-base corner extends below the canvas and is visibly cut at the toolbar boundary. Both desktop entrance captures and both mobile entrance captures also flatten/cut the nearest lower corner against the stage boundary. The mobile collection and changed lit orbit show that a complete case can fit; they do not resolve the default and entrance framing. This contradicts the entrance promise to show the whole case. |
| Detail approach | adaptation | `desktop-detail.png`, `desktop-orbit.png` and `mobile-detail.png` lead with the aircraft and turntable after the case disappears, as the surface's First viewport explicitly requests. The close desktop platter crop is consistent with this approved approach. |
| Orbit, zoom and lamp interaction | match | Changed lit collection and front detail captures support a changed observation camera. OrbitControls, pointer-start rotation stop, keyboard orbit/zoom/reset, damped spotlight strength and reduced-motion handling are implemented. Actual pointer drag, keyboard arrows and photographic dialog operation were recorded by the parent. Static captures alone do not establish transition timing or measured frame rate. |
| Retained high-resolution photographs | match | Mobile detail exposes the five-view 3840×2160 section; `desktop-photos.png` shows the original cockpit/nose view inside the existing zoom dialog. The detail template retains independent view selection and supplied image assets. |
| Personal-space heading legibility | contradicted | `desktop-space-entry.png` shows the reading companion covering the first character of “个人空间”. The parent confirms this was automatic placement in a fresh tab, with no companion drag or keyboard movement. It materially obscures incumbent content in the requested entrance surface. Mobile personal space remains clear. |
| Content truth and future models | match | Supplied J-16 provenance preserves the stated 643,309 / 215,778 triangles and material extensions; no fictional work is displayed. Collection ordering and individual routes derive from the models collection, and supplied GLB paths are passed through metadata. The newly generalized preparation script was reported by the parent; it was not separately audited. |

## ceiling

The pinned physical depth, transparent cabinet, circular turntable and two actual lamps are reached. Complete default cabinet framing is still below the surface's explicit requirement. No external quality-card comparison or new visual direction is warranted for this local replacement; no other material craft-floor finding was observed on the changed surface.

## material_fixes

1. **Whole-case promise:** in `src/lib/model-stage-runtime.ts` (`distances`, `initialCamera`, cabinet/reset camera target), fit the closed cabinet including pedestal/underside and its nearest perspective corner, with visible margin inside the actual stage aspect ratio; use cabinet bounds/projection or an equivalent complete fit instead of the current fixed 4.4/3.15 estimates. Apply the shared fit to both entrance variants and the default desktop collection; keep the approved close viewer approach.
2. **Preserve heading legibility:** in `src/lib/reader-guide-safe-space.ts` (`guideRestingPoint`, occupied-space ranking), protect the personal-space title from automatic companion placement and provide a free candidate when the edge candidates overlap it; do not allow a smaller heading collision to win merely because an image occupies a larger area. Recompute through `src/lib/reader-guide-position.ts` after the settled personal-space layout if necessary. The desktop title, cabinet entrance and gallery controls must stay unobstructed.

## keep

Keep the genuine supplied 3D model/PBR materials, quiet glass and lamp behavior, circular turntable, actual camera controls, both approved entrances, original photographs, metadata extension path, warm-white/deep-blue identity and unrelated research/gallery content; this review authorizes no deployment or broader redesign.

## verdict

The same 11 screenshot paths were reopened after the fix batch. Updated collection captures include their document tops; the mobile detail is a viewport capture as explicitly revised in the return packet. Evidence is valid. This is a scoring pass on the two prior material fixes, with no browser, detector, code edit or new surface audit.

1. **resolved — complete closed-case framing.** Both desktop and mobile entrance captures now show the nearest cabinet-base corner in full with visible space above the plaque/stage boundary. `desktop-collection.png` and `mobile-collection.png` show complete cabinet/base silhouettes separated from the toolbar; `desktop-lit-orbit.png` retains a complete changed camera view. The original clipping is no longer visible. Detail recaptures retain the aircraft and approved close observation treatment.
2. **resolved — personal-space heading legibility.** In `desktop-space-entry.png` the companion rests in the clear upper middle gap; “个人空间”, the introductory sentence, cabinet entrance and gallery controls are unobstructed. `mobile-space-entry.png` retains its clear heading and reserved bottom guide strip. The prior automatic overlap is no longer visible.

No material regression introduced by this fix batch is visible in the supplied recaptures; the photo dialog and model surfaces remain present.

## remaining

clear. This ship verdict covers the scored fixes only, not a new whole-surface approval or deployment authorization.

disposition: ship
