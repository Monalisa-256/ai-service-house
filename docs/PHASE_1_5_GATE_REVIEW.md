# Phases 1–5 verification packet

**19 November 2026.** This is an evidence ledger, not a claim that an unobserved learner or device study passed. Run `npm ci && npm run check` from the repository root. To run the rendered browser smoke on a normal machine, start `npm run dev` in another terminal and run `npm run test:browser`.

| Gate | Current evidence | Decision |
|---|---|---|
| Phase 1 scenario integrity | Validator, deterministic replay, support, role, and tool invariant tests pass. | Automated gate green. Editorial review remains a human decision. |
| Phase 2 three-space HTML path | DOM tests cover routes, prediction, evidence, proposal, persistence, replay, reset, keyboard-native controls, and reduced-motion toggle. | Implementation green; rendered browser, screen-reader and observed-learner checks open. |
| Phase 3 asset contract | Three Blender masters, raw/optimized GLBs, hash/count manifest, named clips, skinned worker, Three GLTFLoader parse tests. | Asset gate green; phone/laptop frame time and GPU behavior unmeasured. |
| Phase 4 parity contract | Scene view comes from the same scenario state as HTML. Motion controls cannot dispatch scenario events. The 2D source/tool panels remain mounted. | Automated checks green; visual cue boundaries, fallback, AT, and learner explanations open. |
| Phase 5 authored core | Five room scripts, source and cache/index fixtures, five evaluation cases, eight-event recovery trace, assessments, narration/captions, optional subtopic matrix compiled into inspected cards, dependency rules, final rubric, dated provider register. Five visitor-facing 2D case studies exercise the core beats. | Implementation/validator gate green; educator/editorial approval and observed understanding open. |

## Reproducible manual gate

Use the representative novice phone, keyboard/screen-reader laptop, and modest integrated-graphics laptop profiles in `PHASE_0_FOUNDATION.md`. Record device model, OS/browser, viewport, WebGL support, time to 2D usability, time to first 3D frame, frame-time distribution during each clip, memory proxy, failures, and heat/battery notes. Test standard and reduced motion, failed GLB URL, disabled WebGL, route switches, and replay during a clip. Preserve the exact observation and timestamp; do not replace them with a Blender render or a simulated browser result.

Observe at least one learner from each defined profile completing briefing, library, and counter without coaching. Ask them to identify the decisive current passage, explain why reranking cannot restore a missing candidate, and say whether the Tuesday proposal was booked. Record their own words, hesitation, and assistive-technology barriers. Revise wording/sequence, then retest the misunderstood step. Agree a numeric threshold with the reviewers before the study; this repo does not invent one after observing outcomes.

The editor and technical reviewer should check every optional row in `PHASE_5_INSPECTION_MATRIX.md` against the canonical document text, public/staff boundary, fictional chronology, and claim-support rule. Mark each card accepted or revised. Platform entries in `content/platforms.json` require a dated official-link recheck before publication. Only then mark the Phase 4 go/no-go and Phase 5 editorial gate green.

## Known constraints

This sandbox launches Vite on `127.0.0.1`, but local Chromium exits before opening a page because its process singleton cannot create a socket (`Operation not permitted`). The deployed site was inspected in a cloud browser: WebGL was disabled there, the 3D boundary reported unavailability, and the 2D lesson remained visible. This verifies only that fallback, not GPU motion or performance. The browser script is present for a normal local or CI runner. The optional Three/R3F chunk is about 257 KB gzip in the prior build, so device timing and code splitting remain performance decisions. The five further rooms have visitor-facing 2D studies; their Blender/3D production belongs to Phase 6.
