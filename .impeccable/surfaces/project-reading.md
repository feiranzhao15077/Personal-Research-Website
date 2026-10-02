# Project detail reading

Mode: Read. Scope: the four existing research detail routes, sharing `src/pages/projects/[slug].astro`.

The user approved a modest layout refinement: fluent reading, less wasted blank space, no crowded text. Preserve the warm white/deep blue academic language, text, project data, metrics, figures, evidence boundaries and existing expand/viewer affordances. Preview locally before deployment.

Assessment: desktop sections inherited about 94px padding at each end, while phone sections used 68px. A large title-only column left empty space beside long interpretations. Hero summary, lead and metadata stacked into a tall first screen. EMvision's intended single-column figure selector did not match its markup, and 700px was too narrow a breakpoint for dense evidence pairs. The mobile floating return button covered captions.

Spatial thesis: use a common left reading edge in a 1040px frame. Put section headings above content; retain the 720px text measure and body line spacing. Use 48–64px section padding on desktop and 40px on phones, with tighter intervals inside groups. Metadata is an auxiliary desktop column and a compact block after the intro on smaller screens. Existing brief text remains visible but does not compete with the project title.

Dense EMvision figures use a wide single column; EM-Trace's tall processing diagram uses a narrower single-column figure sequence. LowAlt-MD and QuadControl-Lab retain paired figures on wide screens. At 900px and below evidence and figures become single columns. Intrinsic image proportions are preserved, and original-image access remains available.

Phones retain a constant return control in a reserved bottom strip, with a 44px target and safe-area padding. No animation or dependency is added. Reading content stays usable without JavaScript, including the return link's home fallback.

## Local implementation evidence

Implemented in the shared project template and route-only `project-reading.css`. At 1440px each project hero measures 414px, compared with about 677px before refinement. All four routes were inspected at 320, 390, 768, 1024 and 1440px with no horizontal overflow; phone return targets measure 44px. Desktop EMvision figures now occupy a 920px column. Captures and width measurements are saved in `.impeccable/review/project-reading-layout/`.

The static build, content/hash validation, public privacy scan and release-identity gate passed. The bounded layout detector returned zero findings; the finish review of representative desktop and phone captures found no material layout issue. This pass is available in local preview and has not been deployed.
