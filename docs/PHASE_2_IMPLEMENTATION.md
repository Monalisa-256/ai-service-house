# Phase 2 — HTML and 2D learning slice

## Purpose and boundaries

The central question is: “Can I come this Saturday to get help with my application?” It contains two distinct activities: reception is open 09:00–12:00 for general information, while application-help sessions need an appointment and are suspended on the target Saturday. The fictional date is 21 November 2026 in the Africa/Kampala timezone. Tuesday's simulated slots are a separate next-step example. The website never calls a live model or books a service.

The visitor sees a human setting through familiar desks, a case folder, original source excerpts, and a calendar record. Dots and lines in the 2D process panel depict information flow, not a humanoid AI. The visual hierarchy carries across the future 3D version: question → prediction → one intervention → visible process → causal explanation → source inspection → replay.

## Three spaces

| Space | Reference | Guided visitor action | Observable result | Explanation |
|---|---|---|---|---|
| Briefing | Current notice is in selected context; Saturday application-help is suspended. | Predict, then remove the entire current notice from this answer's context. | The notice remains in records and retrieval candidates, but disappears from context; appointment availability becomes unverified. | Reception hours cannot establish an appointment schedule. A record outside the selected context cannot support this answer. |
| Library | Current hybrid search retrieves the notice. | Predict, then narrow search to hours-only. | The notice is absent from candidates and context; appointment status is unverified. | Reranking can reorder a candidate set but cannot insert an unseen document. |
| Service counter | A reference Tuesday lookup returns two possible times and proposes one without booking. | Predict, then replay a simulated timeout. | Fresh availability becomes unknown; no proposal and no booking. | A tool result, a proposal, and a completed booking are different states. |

The counter reference lookup and one proposal are preloaded as the scene's fixture. The learner controls exactly one change in each guided pass. Experiment mode copies the run and offers only validated controls. The scenario engine enforces content versions, role eligibility, exact event payloads, and replay invariants.

## Information and interaction architecture

- The left route rail provides three permanent spaces and marks a room after its learning check is answered correctly. A route change does not reset the other rooms.
- The persistent question banner anchors the same case in every room.
- Prediction choices use a native radio group. Revealing is disabled until a choice is recorded. After reveal, the choice freezes and the explanatory feedback appears.
- Before/after cards show the status, whether the decisive notice is in context, and the immutable `Not booked` state. The process list shows the intermediate stage. The trace explanation names the causal reason.
- The browser imports `content/saturday-public.json`, a checked projection that excludes staff-only and external document bodies. The production bundle is scanned for restricted fixture markers. The optional task-brief inspector separates the authorized instruction from response fields. The source panel quotes exact eligible passages, with separate labels for `IN CONTEXT`, `CANDIDATE ONLY`, and `NOT RETRIEVED`. It highlights the decisive suspension sentence and explicitly tests an invalid hours citation.
- The tool panel shows the exact read-only request and checked time, requested date, simulated response, returned options, proposed time, and booking. It is visible in every room to preserve the distinction.
- Replay displays stored snapshots without mutating the run. Reset rebuilds the reference fixture for that room. Local storage persists each room's validated run and prediction; imported snapshots are recomputed from trusted content.
- A compact in-site glossary defines the terms learners need for these three rooms. The observation log records route, prediction, post-reveal learning check, intervention, replay, reset, fork, and preference actions with sequence numbers. It is ephemeral and contains no visitor name, address, or external analytics identifier.

## Research grounding

The implementation follows W3C guidance on [native radio-group keyboard behavior](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), [programmatic status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), and [reduced motion](https://www.w3.org/WAI/WCAG22/Techniques/css/C39). It uses native controls, a polite status region, and both a browser preference and local switch. These are design decisions informed by the standards, not a claim of audited WCAG conformance. Vercel's [Vite guidance](https://vercel.com/docs/frameworks/frontend/vite) informs the static build settings; hash routing avoids a server rewrite.

## Accessibility and motion

The site has a skip link, landmark navigation, one route heading that receives focus on route change, native links/buttons/radios/details, visible keyboard focus, descriptive source text, and an atomic polite status announcement for interaction results. Information is expressed in words as well as color and symbols. The responsive layout stacks at narrow widths without changing reading order. The motion setting persists locally and honors `prefers-reduced-motion`; the content works without animation or WebGL. Typography falls back without a network font.

Manual verification still needs a screen reader pass in at least one desktop browser and one mobile device. In particular, confirm the focus announcement after route changes, the radio group label, the reveal status, details/summary behavior, and the observation log's readability.

## Verification status

The content validator, 16 deterministic engine tests, four interaction tests in jsdom, public-content and bundle checks, strict TypeScript check, and Vite production build pass. A Playwright Core browser smoke script covers all three routes, persistence, replay, reset, and mobile overflow; Chromium could not launch inside this restricted workspace because process socket creation was denied. Run it in a normal Chromium environment with `npm run dev` running. The jsdom tests exercise prediction, all three routes, retained state, reset and clear, skip-link route preservation, replay, learning feedback, status text, and motion toggle. No visual/browser or screen-reader pass is claimed here.

## Small observed learner review — required before expanding 3D

This gate requires actual observation; automated tests are not a substitute. Suggested participants: a novice service visitor on a phone, an AI-curious learner on a laptop, and a screen-reader or keyboard-first learner. Avoid real personal data. Ask each to think aloud while they:

1. Answer the Saturday question before interacting.
2. Complete the briefing and point to the decisive passage.
3. Complete the library and explain why reranking cannot recover the notice.
4. Complete the counter and say whether a Tuesday time was booked.
5. Switch routes, replay, and reset one room; explain what was retained.

For each participant, note their device and assistive setup, prediction, evidence they used, any hesitation or misinterpretation, route and focus problems, and a brief answer to the three exit questions. Record wording changes with before/after text and rationale. Do not present this review as complete until observed sessions occur. The current copy anticipates confusion by repeating the reception/session distinction, labeling the decisive passage, and spelling out the lookup/proposal/booking boundary; those choices must be tested with learners.

## Acceptance checks

- [x] Three navigable 2D spaces using semantic HTML; no WebGL dependency.
- [x] One learner-controlled guided intervention per room and bounded experiment controls.
- [x] Exact readable source and tool panels, before/after comparison, replay, and per-room reset.
- [x] Persistent validated case runs across routes and reloads.
- [x] Keyboard-capable native controls, screen-reader labels/status, reduced-motion preference implemented; manual assistive-technology review remains open.
- [x] No real booking, calendar connection, personal data, or analytics infrastructure.
- [ ] Observe a small learner review and revise wording/sequence from findings.
- [ ] Complete manual screen-reader and mobile device review before 3D production expands.
