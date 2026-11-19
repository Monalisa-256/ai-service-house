# The AI Service House

**Experience direction update:** The briefing desk now opens as a five-step visual lesson player with a central human-scale diagram, step guide, status, timeline, exact evidence drawer, and motion controls. [Read the reference audit and redesigned lesson-player contract](docs/EXPERIENCE_REDEFINITION.md). The other seven spaces retain their earlier workbench presentation while their visual lessons are authored.

A human-scale educational simulation of how an AI service answer depends on context, retrieval, tool evidence, source quality, application delivery, evaluation, security, and operations. The first three rooms have animated human-scale 3D scenes and complete HTML evidence. Five further studies have controlled 2D interventions, replay, assessments, and optional concept cards. The Riverside center, documents, visitor, dates, and calendar are fictional. No appointment can be booked.

## Run locally

Requires Node.js 22.18+.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. `#/briefing/1` through `#/briefing/5` are the visual lesson; `#/briefing-classic` keeps the detailed workbench. Visit `#/library`, `#/service-counter`, `#/records`, `#/workshop`, `#/test-room`, `#/security`, and `#/operations` for the other spaces. A static deployment on Vercel uses `vercel.json` and the Vite `dist` output.

```sh
npm run check
npm run inspect
```

`npm run test:browser` runs the visual player and existing three-route smoke path with a local Chromium installation (after starting `npm run dev`). This workspace sandbox prevents Chromium from launching, so this is provided for an ordinary local or CI environment.

`check` validates exact source excerpts, runs deterministic engine and DOM interaction tests, checks TypeScript, and builds the production site. The browser receives a verified public-only content projection; restricted fixture text is excluded from built assets. The site uses semantic HTML and CSS; no WebGL or external AI/calendar service is needed. A web-font request is optional and falls back to system fonts when unavailable.

## Learning flow

1. Predict what a controlled change will do.
2. Reveal one change in the guided room.
3. Compare the reference and changed states, inspect source passages, candidate order, task brief, response fields, and tool evidence. Answer a post-reveal learning check and replay snapshots.
4. Open an experiment fork to combine only validated changes: current notice in/out of context, current/hours-only retrieval, and the two Tuesday calendar fixtures. A verified time may be proposed, never booked.

Each room keeps its run when switching routes or reloading. Reset affects only the current room; Clear saved case resets all rooms. State is saved in the browser's local storage against the content version; a failed or old save resets safely. A glossary and post-reveal checks support the three learning distinctions. The prototype observation log is in memory for the current tab and does not send data anywhere.

See [Phase 2 implementation and learner review](docs/PHASE_2_IMPLEMENTATION.md) for the interaction map, accessibility checks, review script, and remaining exit gate. Earlier specifications remain in `docs/`.

## 3D art and extended content

The first three rooms open their 3D scene alongside the lesson. The optional module loads an optimized GLB with a skinned service worker and a named clip; fixed camera, pause, scrub, skip, reduced motion, and asset/WebGL fallbacks leave the 2D evidence usable. Hide the view to avoid WebGL. Editable Blender masters, export script, asset manifest, and measured file-size report are in `assets/` and `scripts/`. See [Phases 3–4 implementation](docs/PHASE_3_4_IMPLEMENTATION.md).

The five further room scripts, fixed evaluation cases, dependency rules, final diagnostic rubric, and dated provider documentation drawer are authored as Phase 5 content and displayed as accessible case studies. The optional inspection matrix compiles into `content/inspection-cards.json`; run `npm run sync:inspection` after changing it. See [Phase 5 authoring status](docs/PHASE_5_AUTHORING.md). The five further rooms do not yet have 3D art; that remains Phase 6 production.
