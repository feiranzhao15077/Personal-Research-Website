# 建模展柜

## Mode
Experience. Visitors select a work from an inclined ring, then orbit its real three-dimensional model, zoom and inspect rendered details.

## Direction contract
THESIS: The `/models/` overview becomes a tilted circular model picker. Separated annular sectors carry supplied photographs and names; quiet anonymous sectors reserve future positions. Real three-dimensional inspection starts on the chosen work's detail route.

OWN-WORLD: Preserve the incumbent warm-white paper, deep blue, Chinese serif title, sans controls and rounded return button. Pale blue occupied sectors and paper-grey empty sectors have a restrained physical edge, within the same page ground.

STORY: Visitors see the supplied works, choose a sector and enter its real model. The selection page downloads photographs only. Metadata automatically supplies future works, six per ring with lightweight navigation between rings. Empty sectors have no labels, invented work or click action.

FIRST VIEWPORT: The existing return and personal-space navigation frame one large slightly inclined ring. The title and short instruction occupy its central hole; each occupied sector has an upright transparent model photograph and its name. Six separated sectors remain visible even with one supplied work.

FORM: User-specified inclined model turntable, code-led; no concept roll applies to this precise composition. Hover/focus strengthens the occupied sector and gently enlarges its image; click goes directly to the detail page. Phones retain readable names with no automatic turning.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Direction / scope
THESIS: an academically quiet but physically real glass cabinet within the incumbent warm-white and deep-blue website.

OWN-WORLD: existing Chinese serif headings, rounded deep-blue return controls and warm-white page ground. The WebGL canvas is transparent. This is an ordinary surface extension of that visual world.

STORY: two entirely clickable glass-cabinet entrances lead to the circular model selector at `/models/`; an occupied sector leads to `/models/[id]/`, which approaches the aircraft, fades the cabinet and offers close camera observation plus supplied high-resolution photographs. The homepage entrance occupies the Research Map's former lower-right Maxwell area. The personal entrance is stationary beside the title, outside the floating photo gallery.

FORM: actual GLB geometry, PBR materials, thin metal case edges, optically quiet glass, a square base, a circular turntable and two real overhead lamp meshes with SpotLights. The user's rejected image-on-plinth presentation is superseded.

## First viewport and interaction
The entrances frame the entire glass cabinet, both lamps and its base. Perspective fitting uses all eight case/base corners with visible margin, including when loading finishes before the first resize. Desktop rest slowly turns the platter; mouse hover or keyboard focus softly increases spotlight strength and brings rotation to a stop. Leaving restores the resting behavior unless the visitor has stopped the turntable. Compact/coarse-pointer screens keep lighting on.

The selector is an unrotating ring of six separated sectors, inclined with CSS perspective and `rotateX(26deg)`. SVG annular paths use outer radius 306, inner radius 157 and a 10-degree gap in a 720-unit frame; a 10-unit lower edge gives restrained depth. Filled positions use the supplied transparent `spaceCover` image and the real title. Reserved positions have no name, focus stop or action. Hover enlarges an occupied image to 1.045 times its resting size and lifts it 5px; focus outlines its sector. The central title and instruction remain upright. Phones use proportionally larger names; reduced motion keeps highlights while removing movement. Metadata supplies six works per group, with previous/next controls only when needed.

The entrance guide phrase is: “这些都是我用 Blender 完成的建模哦～点开展柜，还能看看不同视角和小细节！” The personal-space guide automatically uses the free upper-middle area and repositions after fonts settle; a visitor's manual placement takes priority.

Detail canvases use OrbitControls: drag to orbit, wheel or pinch to zoom, and right drag to pan. Front, top, rear, reset and turntable controls sit alongside the top return button, using its deep-blue rounded button treatment. The visible gesture description and duplicate lower toolbar are removed from details; canvas accessibility instructions remain. On narrow screens the action group scrolls horizontally beside the fixed return control. Controls bind to their stage by ID and remain disabled until loading succeeds. Arrow keys orbit, +/- zoom and Home resets. A camera drag or keyboard observation stops rotation. The detail page defaults to a still turntable; its approximately 1.4-second approach fades the case and hides the square base, leaving the aircraft and circular platter. Reduced motion skips the approach and automatic turning. The expandable “高清细节图” retains five-view selection, keyboard navigation and the accessible zoom viewer.

## Implemented material and type
The page uses the incumbent paper (`#f7f7f2`), deep blue (`#214f73`) and dark text. The canvas clears with zero alpha so the surrounding page supplies its ground; the base and platter are actual geometry. Supplied studio photographs keep their warm ground (`#f8f6f2`). Lighting changes real material response and shadow, with soft three-dimensional beam geometry.

Chinese serif headings use the existing Georgia / Noto Serif CJK SC / Songti SC / SimSun stack. Entrance headings are medium weight at 1.6–2rem; detail titles reach 4.2rem through their responsive scale. The selector's central title uses `clamp(1.7rem, 3.1vw, 2.55rem)` on desktop; occupied sector names use 30 SVG units, increased to 36 on phones. The entrance plaque says “个人建模作品” at 1.15–1.3rem, weight 600, replacing the separate aircraft name and software line. Body and control text use the incumbent sans stack. Return controls retain the deep-blue fill, rounded shape (2rem radius) and minimum 44px height; keyboard focus remains visible.

**Real geometry rule.** Entrances and details lead through real aircraft/cabinet geometry and light. Transparent posters support loading and failure. The selector uses supplied transparent photographs to identify works; the full renders remain in the expandable photograph section.

**Complete case rule.** Entrances fit the glass, lamps and base inside the stage with margin. Detail observation follows its approved close approach. The selector displays annular geometry rather than a second WebGL cabinet.

**Real collection rule.** Add only supplied works with truthful metadata and assets. New YAML fills the selector and generates individual routes; the first `order` record supplies both entrances. Anonymous reserved sectors do not claim future models or provide actions. Further models wait for actual material.

## Assets and runtime
J-16, J-20 V3 with flat canards, the R-04 radar car, and the EO-01 SAR satellite are the user's Blender/Cycles models. Web GLBs use +Y up, +Z forward, metre units and a wheel-ground origin, with model-only geometry and embedded PBR textures. The J-20 source pack retains its old J16 directory name and a `j16-lite.glb` filename; it is imported as a separate J-20 record with a +90-degree Y-axis orientation wrapper in web derivatives. Source files remain unchanged. The runtime centres the horizontal bounds, limits the longest horizontal edge to 2.24 scene units and height to 1.18, and places the lowest point on the platter. Tall-model viewing centres and distances adapt to the displayed bounds. Future models need matching axes and a sensible model origin.

Web derivatives live at `public/models/j16/j16.glb` and `j16-lite.glb`, approximately 9.53 / 3.62 MiB. The 643,309 / 215,778 triangles remain; each file retains 32 meshes, materials and embedded textures. Preparation compresses colour textures to WebP at quality 92, normals losslessly, and geometry through Meshopt medium with 16-bit position/UV and 12-bit normal quantisation. Transmission, clearcoat and IOR extensions survive; source GLBs and the Blender project stay original. `.impeccable/model-assets/j16.json` records preparation provenance; `src/assets/models/j16/source.json` records supplied photographic provenance.

The additional entrance-only `j16-preview.glb` is approximately 2.04 MiB with 53,752 triangles, simplified from source lite with ratio 0.16 / error 0.004. Its colour textures use 768px WebP quality 86 and non-colour textures 512px lossless WebP; Meshopt uses 14-bit position/UV and 10-bit normals. The two standard/lite derivatives above remain unchanged. The preparation command accepts `--preview-only` to rebuild this derivative independently.

The generic preparation command and YAML fields are documented in `docs/MODEL_CABINET.md`. Optional `model3d.preview` serves the entrances, falling back to lite. Detail stages first use `model3d.mobile`; desktop detail subsequently loads and precompiles `model3d.desktop`, retaining the lite image and camera state during refinement. Save-Data and 2g connections skip refinement. The renderer mounts within 700px of the viewport and pauses offscreen or in a hidden tab. Posters remain until the first compiled model frame has rendered. Current caps are DPR 1.25 compact / 1.65 desktop, 30fps entrance/compact / 60fps interactive desktop, and 512px entrance/compact / 1024px interactive desktop shadow maps. The selector loads only 640px WebP `spaceCover` derivatives, without a GLB or WebGL runtime.

### Final audit completion — 2026-10-06

The one-screen “细节图” entry is a native full-resolution image link before enhancement. Once initialized, it becomes an accessible same-screen toggle with Enter/Space operation and Escape return; modified clicks retain native navigation. All seven details keep this fallback. Initial scripts, including HTML modulepreloads and static imports, retain a 50 KiB gzip cap. Deferred dependencies are counted separately in a 250 KiB total allowance only for the homepage, personal space and model details; the model runtime cannot be part of the initial graph. The model selector remains under 50 KiB total. These are bundle regression limits, not measured load times.

Both lamps illuminate, with one shadow-casting spotlight on every device. Shadow maps update for model installation or turntable movement, rather than camera/light-intensity changes. Aircraft self-shadow reception is disabled to avoid flickering acne, while opaque parts still cast a contact shadow onto the platter; camera and shadow depth ranges are tightened. Thin cabinet panes use transparent reflection instead of five scene-refraction passes. The source aircraft canopy retains its PBR transmission.

## Local delivery — 2026-10-04
Typecheck completed with zero errors, warnings and hints. The clean `.scratch/release-check` build and public-content scan passed; the recorded detector result is `[]`. A fresh finish reviewer records `ship`, with complete case/base framing and personal-space heading legibility marked resolved. The 11 desktop/mobile captures and `finish-review.md` are in `.impeccable/review/model-cabinet-3d/`. These records are the completed bounded review; this documentation pass does not repeat it.

Local preview used `http://127.0.0.1:4326/models/`. No deployment or commit was made. Publishing follows the user's explicit request and the README's existing release convention. `.impeccable/review/model-cabinet/` belongs to the superseded image presentation. Pre-existing whole-site design/documentation drift and unrelated experiments remain outside this extension.

The subsequent entrance-label/loading/shadow refinement passed a separate zero-diagnostic typecheck, clean build and public-content scan. Bounded loading, entry, detail refinement/orbit and mobile captures live in `.impeccable/review/model-cabinet-optimization/`. This small change did not repeat a whole-site audit or fresh reviewer pass and remains local only.

The circular-selector refinement passed typecheck, clean build and its public-content scan, with detector result `[]`. The final 1440 × 900 desktop/default and focus captures plus 390 × 844 mobile capture are in `.impeccable/review/model-selector/`. Actual detail entry and return are recorded in `interaction.md`; future group controls were code-reviewed because only one work exists. Fresh finish review disposition is `ship`, with no material fixes. Documentation was completed in the current thread after the documenter agent became unavailable, preserving incumbent global design artifacts and supplied raster provenance. No deployment or commit was made.

SAR satellite EO-01 is the fourth model, with its two supplied GLB animations. The selector uses a transparent render of the original Blender model. Detail controls add a compact decomposition/assembly toggle beside the return and view controls; exploded components remain independently inspectable. Original model files are preserved.

The first ring now holds six supplied Blender works: J-16, J-20, R-04 radar car, EO-01 SAR satellite, RQ-4 Global Hawk and QX-450 quadrotor. The two UAVs retain their combined demonstration clips; independent rotation/assembly controls bind quaternion and translation tracks separately. RQ-4 has eight still views and QX-450 five. Transparent covers are separate renders of the original models; source projects remain untouched. Future works automatically use the next six-position ring group.
# 2026-10-05 collection extension

Seven real works, including F-22 aft revision 4. Balance ring groups and occupied positions; show F-22 in the first group. Preserve the last group on detail return. Short control labels: weapon bay, takeoff, rotation. Mobile controls remain visible by wrapping beside the return button. Rotation and component motion bind separately; model motion completes at the supplied starting pose. Inspect underside without restricting the orbit at the floor. Keep standard/lite refinement visually continuous. Independent render covers and model derivatives never overwrite Blender sources.

## 2026-10-05 single-ring revision
The user replaces pagination with one overview containing all seven works. Eight separated sectors share one inclined ring, with one anonymous reserve position. Each real work keeps its full title, native model link, and restrained hover/focus enlargement. Sector angles follow collection size (minimum eight); imagery fits the narrower sectors. Remove group navigation and saved-group return hashes. The ring expands up to 820px while respecting viewport height; mobile keeps all models on the same ring.

## 2026-10-05 filled ring and loading refinement
The user removes the reserved position. All seven supplied works occupy equal sectors of one ring, without blank slots. Image sizing follows the seven-sector angle. Decorative entrances mount only near the viewport (80px), after a short dwell and idle opportunity; passing quickly cancels queued initialization. Posters and links remain usable. Viewer stages still mount immediately near the viewport (220px). Entrance DPR is capped at 1 compact / 1.25 desktop; resting rendering uses 20 / 24fps, 128px environment maps, and 256px compact shadows. Detailed inspection retains its existing resolution and animation controls.

## 2026-10-05 one-screen model details
Detail routes now occupy one dynamic viewport, with a compact title and the real model filling the remaining height. Remove the detail footer and expandable lower photo section. Loading posters fit wholly inside the viewer with `object-fit: contain`, centred with safe padding; entry-only case/disc decorations are absent from viewer posters. Detail posters load eagerly, while entrance posters stay lazy.

The short top control “细节图” swaps the model for a photograph panel in the same workspace; “查看模型” restores the preserved camera and model state. Model-specific controls hide while viewing photographs. Retain view selection, captions, previous/next buttons, arrow-key navigation and the existing accessible zoom viewer. Escape inside the photo panel restores the model and focuses the switch. Photo images and the thumbnail strip fit the narrow grid; only the thumbnail strip scrolls horizontally. Phones reserve the existing reader-guide dock. Short viewports reduce secondary copy and display text-only thumbnail choices. Bounded desktop/mobile checks, typecheck and production build records live in `.impeccable/review/model-detail-one-screen/`.
