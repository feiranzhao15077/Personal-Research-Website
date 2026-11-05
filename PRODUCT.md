# Personal Research Website

<!-- impeccable:product-schema 1 -->

## Platform
Web, including desktop, tablet and mobile.

## Purpose
赵斐然的个人科研主页。首次访问者应能理解研究身份、研究方向、项目关系及证据边界，并访问公开资料。

## Stack
Astro static generation, plain CSS, GSAP animations and deferred Three.js model rendering. Cloudflare Pages hosts the site; a Pages Function provides server-side DeepSeek answers. The deployed site is https://zhaofeiran.pages.dev/.

## Confirmed constraints
- Research names, metrics, evidence boundaries, CV and identity stay grounded in supplied material.
- Research pages retain their readable warm white and deep blue academic language.
- Core links and content remain available on mobile and through the keyboard.
- Creative changes are previewed locally first; deployment follows an explicit user request.

## Personal space
The user requested a distinct space for freer personal work and life records, reached from About. The confirmed concept is vivid color and floating cards moving right to left. The approved layout is a shallow gallery arc with a larger central card and smaller, clearly separated side cards; mobile shows one full card with side peeks. Dragging changes speed and direction; clicking opens a card. The deployed gallery contains eighteen supplied photographs with reviewed captions. Future content slots must remain honest about unavailable work.

The confirmed opening uses a child's broad felt-tip drawing: a tiny boy in a vast grassland is approached in a slow opening shot, with a brief close-up of the flame and star in his hands. A rocket grows directly from the fire with the boy already in its window, then flies through forty named knowledge planets, gathers their light and enters the gallery through a meteor. There is no return shot or boarding action. It runs for about 23 seconds on the first eligible entry per tab session, with pause, skip and replay controls. Reloads and return navigation in that session skip the opening; a fresh tab session plays again, ignoring the former persistent record. Reduced motion bypasses automatic playback and offers a still scene on replay. This playback rule is deployed.

## Research detail reading

The user approved tighter project-detail layouts with fluent reading and comfortable text spacing. The four deployed routes share headings above readable content, a compact desktop introduction with auxiliary metadata, and figure widths chosen for complexity. Phones prioritize stable single-column reading and a constant return control in a reserved bottom strip. The refinement preserves all research text, evidence and original figures.

## Reader guide

The user selected Petdex's deepseek酱 character by fightingshine for a reading companion. Curated guidance is available on the research homepage, project routes and Coursework. On 2026-10-02 the user also approved connecting real DeepSeek answers: the deployed implementation uses a Cloudflare Pages Function with a server-only key and knowledge generated from public project records. It supports recent conversation context, cancellation, retry and starting over. A real production response was confirmed during the final-site audit. Research content and the separate personal-space experience stay intact.

The companion is draggable on desktop and responds to selected content with reviewed first-person speech. Desktop placement seeks a quiet outer margin; hovering or keyboard-focusing a Research Map card temporarily puts an illustrated prone pose on its top edge. Prompts respond after an 80ms mouse dwell, with immediate keyboard/touch access. Manual placement takes priority until reset. Phones dock the small entrance in a reserved bottom strip to keep the reading area clear, without dragging or card-to-card movement. This behavior is deployed.

## Model cabinet

The user approved a quiet, real three-dimensional glass cabinet in the existing warm-white and deep-blue academic language. An entirely clickable cabinet replaces the Research Map's lower-right Maxwell panel; a stationary entrance sits beside the personal-space title, outside its moving photo gallery. Both lead to `/models/`, a slightly inclined circular model picker. All seven supplied works appear on one ring, with one separated annular sector per work and no blank slots or pagination. Hover gently enlarges a picture, and click enters the corresponding real model. At `/models/[id]/`, the camera approaches the model and the cabinet fades away, leaving the model and circular turntable for close observation.

The first exhibited work is the user's J-16 Blender/Cycles model, loaded from real GLB geometry with its supplied PBR materials. The cabinet has thin metal edges, a square base, a circular turntable and two overhead lamps. Hover or keyboard focus softly lights it and pauses its slow turn; leaving restores the resting behavior. Phones keep the lamps lit and use the lighter model. Orbit, zoom, pan, preset views and keyboard controls support inspection; reduced motion skips automatic rotation and the approach animation. Transparent posters support loading and failure. Detail pages occupy one viewport with no downward content section; the top “细节图” control switches to supplied renders in the same screen, with thumbnails and an accessible zoom viewer. “查看模型” restores the model with its camera preserved. Without JavaScript, the native “细节图” link opens the first full-resolution render directly.

The collection also contains the user's J-20 V3 static model with flat canards and R-04 radar car, each with separate standard/lite GLBs and supplied renders. The ring uses their transparent covers and real names. Tall models fit the cabinet height with adapted inspection framing. Detail view controls share the top return button's treatment. Original engineering files and input packs are preserved, and local-source provenance remains in internal maintenance records.

Entrance guidance uses the approved phrase: “这些都是我用 Blender 完成的建模哦～点开展柜，还能看看不同视角和小细节！” Real future works are added through the separate `models` YAML collection, paired desktop/mobile GLBs and local photographs. The collection and detail routes derive from metadata; both entrances show the first work by `order`. Only supplied real works are collected, independently from research evidence.

Both entrance plaques say “个人建模作品” in a larger size. Entrances load a dedicated lightweight preview model and keep their transparent poster until the first real frame; details show lite first, with the desktop detail refining to the standard model in the background. Cabinet glass uses inexpensive transparent reflection, and a single cached contact-shadow pass avoids aircraft self-shadow flicker. This refinement passed its local typecheck/build and bounded previews, recorded in `.impeccable/review/model-cabinet-optimization/`.

The ring selector uses small WebP derivatives of supplied transparent `spaceCover` photographs and loads no GLB. Its sector count derives from the number of real works. The return button and personal-space navigation remain, with keyboard focus visible on occupied sectors. The original selector review is recorded in `.impeccable/review/model-selector/`; later single-ring and one-screen revisions are deployed and documented in `docs/MODEL_CABINET.md`.

The original 3D implementation passed typecheck, build and public-content scan. Its finish review records `ship` after resolving complete cabinet/base framing and the automatic reading-companion overlap on the personal-space title. Historical evidence is in `.impeccable/review/model-cabinet-3d/`; the earlier image-presentation review is superseded. The cabinet is deployed. Maintenance instructions are in [docs/MODEL_CABINET.md](docs/MODEL_CABINET.md).

SAR satellite EO-01 is the fourth model, with its two supplied GLB animations. The selector uses a transparent render of the original Blender model. Detail controls add a compact decomposition/assembly toggle beside the return and view controls; exploded components remain independently inspectable. Original model files are preserved.

The cabinet contains seven supplied Blender works: J-16, J-20, F-22 Raptor, R-04 radar car, EO-01 SAR satellite, RQ-4 Global Hawk and QX-450 quadrotor, all on the same ring. F-22 uses aft revision 4, eight still views, and separate rotation, weapon-bay and takeoff controls. Its combined clip splits only the root turntable quaternion; component hinge rotations remain in the appropriate animation. Return navigation opens the single model overview and preserves the entrance origin. Mobile controls wrap alongside the return button. Transparent covers are separate renders of original models; source projects remain untouched.
