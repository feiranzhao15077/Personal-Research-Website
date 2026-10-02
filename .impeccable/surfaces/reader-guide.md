# Reader guide

Mode: Read. A local extension of the existing research website, preserving its warm paper, deep blue, readable typography, research text, evidence and routes.

The user selected Petdex No. 3547, deepseek酱 by fightingshine, and approved reviewed reading prompts and free-form questions. On 2026-10-02 they explicitly approved connecting DeepSeek. The current local implementation sends questions through a Cloudflare Pages Function, using a server-only key and public project knowledge generated at build time. It supports recent conversation context, cancellation, retry and a new conversation. A real model response has been confirmed locally; this new implementation has not yet been published. Earlier preview outcomes below are historical.

The character automatically chooses a quiet outer margin on desktop, separate from the existing return control. It breathes and blinks at rest, waves on greeting or opening, briefly jumps on a topic change and uses the review frames while guiding. The first desktop greeting is short and dismissible once per tab session. Phones retain the small closed entrance without an unsolicited greeting. The panel is nonmodal and can close with its button, Escape or an outside click; character motion can pause and the character can minimize.

Build-time content comes from the current project collection, identity and approved material entries. Curated explanatory text directs readers to research relationships, source figures, protocols and limitations. It introduces no numerical claim. The personal-space gallery and its opening retain their own layout and behavior and do not mount this research guide.

The sourced transparent 1536 × 1872 atlas is optimized to 768 × 936 WebP at build time and loaded after the first paint. The original attribution and source URLs are recorded in `src/assets/guide/source.json` and linked from the guide. Frame counts follow the selected pet's state viewer. CSS stepped frames and a small controller implement the character; Pages Functions now provide its question backend while the research routes remain static.

The guide hides during the homepage opening, native figure dialogs and hidden tabs, respects reduced motion and keeps its readable prompts available independently of its animation. Desktop and mobile panels fit within the viewport and scroll internally when needed.

## Drag and contextual speech

The character can move by mouse or touch drag; arrow keys also move it and Home or “自动选位” resumes automatic placement. Movement is limited to the viewport, uses one transform write per animation frame, and remembers the chosen position within the tab session. A drag does not open the panel. The panel and speech choose available space around the character, including below it when placed near the top.

Short reviewed first-person prompts appear after a pointer pause over selected content, on keyboard focus, or on touch. The homepage CAD model uses the user's requested SolidWorks introduction. Other prompts cover the four project cards, Maxwell equations, the engineering sketch, original research figures, evidence, Coursework, CV, GitHub and the personal-space entrance. They preserve existing project boundaries and do not use a model service. A `data-guide-hint` attribute can supply future reviewed prompts without changing the controller. Speech is dismissible with its close button or Escape, remains reachable by pointer and does not intercept the content's original actions.

The existing guide artwork, colors, static routes and question preview are unchanged. No new dependency or deployment was introduced.

## Local preview outcome

- Astro typecheck: 0 errors and 0 warnings; the pre-existing ResearchMap unused-variable hint remains.
- Static build, content/hash validation, release identity and public-content scans passed.
- A bounded browser pass at 1280 × 720, 390 × 844 and 320 × 700 confirmed readable guide/question panels, no page horizontal overflow, disabled question sending and Escape closing. The panel stacking order was raised above the fixed navigation so its heading and close control stay accessible.
- Captures are in `.impeccable/review/reader-guide/`: desktop-read, desktop-question, mobile-read and mobile-question.
- No dependency, AI request, commit, push or deployment was added. This records the local preview outcome before publication.
- Drag extension: typecheck and static build passed. The bounded desktop/mobile inspection confirmed actual dragging without an accidental panel open, the requested CAD prompt, viewport-contained panels after moving the guide, keyboard reset and no horizontal page overflow at 390px and 320px. Captures: `draggable-desktop.jpg` and `draggable-mobile.jpg`.

## Quick prompts and card-top perching

Mouse dwell is now 80ms and keyboard/touch prompts have no added dwell. A 420ms departure grace period lets the reader move into the dismissible speech bubble. Moving between cards switches the prompt without first returning the character to her resting spot.

On desktop/tablet wider than 700px, each Research Map card can temporarily host the character in a genuine prone pose, with a short first-person prompt above the card. If the card is too close to the navigation or outside the viewport, the character stays at the edge instead. The pose never changes saved manual coordinates or intercepts the project link. A 210ms arrival animates only the character; text is readable immediately. Paused/reduced-motion visitors get the final pose directly. Phones use the small standing character and the same prompts without flying between cards.

Automatic placement scores the visible text, links, figures and navigation against a few outer-margin candidates, retains a safe current spot and recalculates only after scrolling settles (140ms). This is a best-effort gap choice, not a guarantee for every possible page composition. Dragging pins the user's position until Home or “自动选位”; perching remains temporary. Dragging still writes only one transform per frame.

`deepseek-perch.png` is an AI-generated derivative of the selected character, not an official Petdex frame. Its provenance is recorded in `src/assets/guide/source.json`; Astro produces a 400px transparent WebP (~28KB), loaded after the initial paint along with the atlas. No new dependency or model request in the website.

Outcome: typecheck passed (0 errors/warnings, same existing ResearchMap hint); static build and its content/hash, privacy and release gates passed. One bounded preview pass confirmed desktop mouse perching, keyboard prompts, independent-branch perching, drag without panel opening, Escape returning to the edge, and contained mobile panels without horizontal page overflow at 390px/320px. Captures: `perched-desktop.jpg` and `quick-guide-mobile.jpg`. Local preview only; no commit, push or deployment.

## Audit fixes and connected questions · 2026-10-02

Phones now dock the entrance in a reserved bottom strip, beside the project return control; desktop dragging and perching remain. The user authorized real DeepSeek answers in this turn. A Cloudflare Pages Function keeps the key server-only, grounds answers in generated public project records and provides recent context, cancellation and retry. One real project question returned successfully in the local browser. Current typecheck has no errors, warnings or hints, and the static build succeeds. New regression coverage is added but has not been run. See `.impeccable/review/site-audit-2026-10-02/fixes.md`; publication is pending.

