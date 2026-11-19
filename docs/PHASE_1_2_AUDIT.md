# Phase 1 and 2 repository audit — 19 November 2026

## Scope and evidence

Reviewed the local source, Saturday specification, phase gates, content validator, event/session engine, three-room React UI, production output, and the connected public GitHub repository `Monalisa-256/ai-service-house`. At the original audit, GitHub contained Phase 1 only. The later archive extraction succeeded: GitHub `main` head observed for this review was `83a976b99763f2c7bbc693ab82616533e78ca92c`, with `index.html` and the Phase 2 package present. The updated `.github/workflows/extract.yml` listens for any root-level `*.zip` and removes the archive after extracting it. The changes in this new package remain local until its ZIP is uploaded.

## Findings resolved in this package

| Finding | Resolution | Verification |
|---|---|---|
| Guided mode allowed repeated actions through the session API. | The engine now permits one intervention per guided briefing/library pass and one timeout after the service counter's fixed lookup/proposal reference. | Engine test rejects a second guided action. |
| The counter reference displayed options but no actual proposal. | The reference now proposes one verified Tuesday time and labels it `not_booked`; the timeout clears it. | Engine and DOM interaction tests. |
| Replay process captions followed the reveal flag instead of the selected snapshot. | Process text now derives from the displayed snapshot. | DOM replay test. |
| Full development content was bundled into the public browser app. | `saturday-public.json` is a deterministic projection without staff-only or external document bodies/passages. Build checks the projection and scans JS assets for restricted markers. | `npm run check` and production asset scan. |
| The Saturday unavailable tool response in the scenario specification was missing from the encoded fixtures. | Added the dated unavailable fixture and semantic read-only check event. | Engine test confirms no slots or booking, and rejects a mismatched fixture date. |
| Source/tool context was too terse for inspection. | Added full-answer disclosure, eligibility explanation, exact tool request, checked time, and a clearer case folder. | DOM tests and source review. |

Changing the content fixture incremented `contentVersion` to `2026-11-19.3`, so older stored runs reset safely rather than replaying against changed content.

## Gate status

| Gate | Status | Evidence or remaining work |
|---|---|---|
| Phase 1 deterministic Saturday invariants | Passed | `npm run check`: 16 engine tests, content validation, replay and eligibility assertions. |
| Phase 1 source and tool fixture integrity | Passed for authored content | Exact passages, effective dates, public/staff access, Saturday unavailable and Tuesday outcomes validated. Natural-language support still deserves human editorial review. |
| Phase 2 2D route and interaction implementation | Implemented and DOM tested | Three routes, prediction/reveal, before/after, evidence, tool, replay, reset, experiment controls, persistence behavior exercised. |
| Phase 2 keyboard and screen-reader path | Implemented, manual check open | Native radio/buttons/links/details, heading focus, live status, skip link, visible focus, reduced-motion toggle. Test with actual screen readers and mobile devices. |
| Phase 2 rendered-browser verification | Open | Browser smoke script exists; Chromium launch was denied by this workspace sandbox before any page opened. Run `npm run dev` then `npm run test:browser` on a normal Chromium machine. |
| Phase 2 observed learner review and copy revision | Open | Recruit representative novice phone, laptop, and keyboard/screen-reader learners; use the script in `PHASE_2_IMPLEMENTATION.md`. Do not claim observed feedback without sessions. |
| GitHub publication | Open | Upload the new root-level ZIP to the public repo; the updated workflow accepts any ZIP name. Verify the new traceability document, updated UI, and `npm run check` on `main`. |

No 3D production should expand until the observed learner and assistive-technology reviews have addressed misunderstandings. The open checks require human participation or a browser environment; they cannot be completed by static code review.
