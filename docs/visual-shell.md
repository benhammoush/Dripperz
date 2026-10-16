# Phase 3 visual shell

## Provisional acceptance baseline

The owner approved a source-first baseline on 2026-10-16: desktop 1440×900,
tablet 768×1024 and mobile 390×844. Acceptance is a localhost walkthrough of
layout and identity, not pixel-exact comparison. Live desktop inspection remained
on “Loading Experience” with failed legacy resources. The mobile browser capture
was invalid (an unrelated page); neither capture establishes visual fidelity.
Usable representative reference captures remain outstanding.

Source references: legacy `src/Phase_3.tsx`, `src/Phase_3_Mb.tsx` and `src/theme.tsx`.
Tokens: black `#000000`, cyan `#0694c1`, white, Goldman typography, cyan glows,
rounded desktop panels, full-width mobile panels and magenta mobile glitch accents.
The new shell uses a single semantic page, shared navigation targets and normal
document flow instead of legacy absolute page positioning. Later features have
explicit placeholders, not invented promises or unverified historical figures.

Review recognizable typography, color, borders/glows, title, marquee, responsive
navigation and section order at the three viewports. Check no horizontal overflow,
keyboard focus/skip link, mobile Escape behavior, pause/resume and reduced motion.
Decorative effects pause offscreen and in hidden tabs and clean up observers and
listeners on unmount; no observer support yields a static fallback. All assets
are served locally. No legacy secrets, gates or service integrations are copied.

## Asset provenance and publication scope

- `public/branding/dripperz-mark.png`: copied unchanged from legacy
  `src/md/unknown.png`, the mark used by Phase 3's navigation. The owner confirmed
  logo/branding publication rights on 2026-10-16. This does not cover collection
  artwork, models or private documents.
- `public/fonts/Goldman-Regular.ttf`: unmodified Goldman regular from
  <https://github.com/google/fonts/tree/main/ofl/goldman>, obtained 2026-10-16.
  Copyright 2018 The Goldman Project Authors; SIL Open Font License 1.1,
  distributed alongside the font as `public/fonts/OFL.txt`. No external font
  request or new runtime dependency is required.

This milestone does not change hosted acceptance/recovery identities or authorize
publication or deployment. Keep the existing release evidence untouched.
