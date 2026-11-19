# The AI Service House — Delivery Phases

**Status:** planning draft · 19 November 2026. This plan follows `HUMAN_SCALE_AI_ENGINEERING_PRD.md`, `ARCHITECTURE.md`, `SATURDAY_VERTICAL_SLICE.md`, and `TECH_STACK.md`. It orders decisions and deliverables; durations and staffing are intentionally estimates to set after the first prototype. A phase is complete only when its exit checks pass.

## Guiding sequence

We establish the exact learning story, prove the simulation and human-scale visual language in one slice, then expand the validated pattern to eight concept spaces. The deterministic simulation and accessible 2D route remain usable independently of 3D asset loading. Each phase leaves a reviewable product increment.

| Phase | Focus | Main deliverable | Exit decision |
|---|---|---|---|
| 0 | Product and content alignment | Approved case and learning contract | Does one story support all eight spaces? |
| 1 | Scenario and content system | Versioned fixtures and validated rules | Can the Saturday case be replayed consistently? |
| 2 | Interface and 2D vertical slice | Working three-space educational path | Can learners understand the causal changes? |
| 3 | Human-scale 3D prototype | Briefing desk with character and props | Does 3D add clarity on target devices? |
| 4 | Integrated three-space slice | Briefing, library, and service counter in 3D/2D | Are state, motion, and evidence synchronized? |
| 5 | Complete eight-space content | Exact scripts and fixtures for remaining spaces | Does the whole journey stay coherent? |
| 6 | Eight-space production | Complete guided experience and experiment mode | Can visitors learn and explore every concept? |
| 7 | Validation and refinement | Tested, accessible release candidate | Do observed learners meet the objectives? |
| 8 | Release and stewardship | Published experience and maintenance process | Can the team keep it accurate and reliable? |

## Phase 0 — Set the product contract

**Work:** Review the community services center setting, audience, human-scale art direction, and eight learning distinctions. Resolve the fictional service terminology and the ambiguity in “Can I come this Saturday?” Decide whether the first guided pass aims for roughly 20–30 minutes, then identify which subtopics are core beats and which are optional inspection. Define representative learner profiles and devices for prototype review.

**Outputs:** approved PRD revision; one-page learning objectives and concept map; glossary of terms used across rooms; draft content style and accessibility principles; exact definition of “educational simulation” and visible labels.

**Exit checks:** the case naturally supports all eight spaces; no room depends on real personal information; each concept has an observable visitor action and a causal explanation; the team agrees that the AI itself is depicted through process and evidence, while human figures depict real-world roles. If the story fails coverage, revise it now, before producing art.

## Phase 1 — Build the scenario and content foundation

**Work:** Encode the Saturday fixtures from `SATURDAY_VERTICAL_SLICE.md`: exact passages, dates, effective intervals, roles, retrieval candidates, tool responses, claims, explanation IDs, and semantic events. Implement the pure TypeScript reducer, selectors, event log, snapshot replay, guided restrictions, experiment fork, and validation of content references. Establish a content review workflow and versioning rules.

**Outputs:** versioned content package; schema validator; deterministic scenario engine; CLI or simple development inspector showing event → state → explanation; focused tests for the documented invariants.

**Exit checks:** baseline answer has exact support; removal from context yields *unverified* without retiring the notice; hours-only retrieval misses the notice; public role cannot receive staff-only content; Tuesday timeout never produces a booking claim; replaying an event log yields the same state. No 3D runtime is needed to pass this gate.

## Phase 2 — Prove the learning interaction in HTML and 2D

**Work:** Build the site shell, case folder, briefing/library/service-counter routes, readable source and tool panels, prediction prompts, before/after comparison, replay, and reset. Render the 2D equivalent of each event with semantic HTML. Keep guided mode to one controlled intervention per beat. Add an experiment fork with only the validated Saturday combinations.

**Outputs:** a complete, visually designed three-space vertical slice in 2D; keyboard and screen-reader paths; reduced-motion setting; content and interaction instrumentation for prototype observation, without requiring analytics infrastructure.

**Exit checks:** a learner can complete all three scenes without WebGL, identify the decisive passage, explain the retrieval miss, and distinguish a proposed slot from a booking. Switching routes and replaying do not lose the case. Revise wording and sequence based on a small observed learner review before 3D production expands.

## Phase 3 — Validate 3D art and animation

**Work:** Model one contemporary briefing desk in Blender, plus one rigged human figure, a question card, notice cards, tray, clock, and room shell. Author named clips for receiving, placing, and removing a card. Export GLBs; inspect rigs, clip names, pivots, and materials; measure uncompressed and optimized assets. Implement the R3F/Three.js scene, cue scheduler, pause/scrub/skip, fixed camera, reduced-motion presentation, and asset-load fallback.

**Outputs:** a working 3D briefing scene tied to the existing scenario state; editable Blender masters; export conventions; asset manifest and optimization report; device performance notes.

**Exit checks:** removing the notice changes the state immediately and plays the correct motion; interrupting a clip never changes facts; the evidence panel remains readable; the scene works on representative modest phone and laptop hardware at a measured acceptable quality; 2D remains available if WebGL or an asset fails. If 3D obscures the lesson or performs poorly, simplify the scene and asset strategy before advancing.

## Phase 4 — Integrate the three-space vertical slice

**Work:** Add the reference library and service counter using the shared character/prop kit. Show candidate lists, source eligibility, reranking, claim support, typed calendar request/response, timeout, and proposal boundary. Coordinate transitions across rooms without making animation completion a scenario event. Add exact compare views and Engineer inspection panels.

**Outputs:** a polished three-space guided path and controlled experiment mode, with 3D and 2D parity; a reusable room template, scene view model, and cue contract; documented asset and performance budgets based on measurements.

**Exit checks:** all `SATURDAY_VERTICAL_SLICE.md` acceptance fixtures pass in both presentations; a public visitor never sees rota contents; the old notice is marked superseded; a missing retrieval candidate cannot appear after reranking; a slot proposal always says `not_booked`. Observed visitors can explain at least one failure in each space. This is the **go/no-go gate** for producing the remaining five spaces.

## Phase 5 — Author the full eight-space journey

**Work:** Complete exact source fixtures, rules, scripts, assessment questions, narration, captions, and 2D equivalents for the records room, experience workshop, test room, security checkpoint, and operations room. Extend the common case with data contamination, cache invalidation, evaluation regressions, a hostile source, permissions, rollout, and stale-index incident. Specify how a visitor's case folder moves between spaces and which changes fork rather than overwrite earlier snapshots.

**Outputs:** reviewed content package covering every PRD subtopic; dependency map between interventions; rubric for the final diagnostic challenge; a platform comparison drawer based on dated official sources.

**Exit checks:** all eight spaces agree on the same fictional dates, source versions, roles, and action states; every outcome has a traceable rule or authored fixture; every factual platform claim is sourced and dated; no combination in experiment mode silently invents an outcome. Content review happens before full art production for each space.

## Phase 6 — Produce the full experience

**Work:** Build the remaining rooms from the reusable asset kit and add their specific human actions. Implement guided progression, optional deep dives, compatible experiment controls, causal change reporting, glossary, and final challenge. Load assets per room and preserve useful HTML during 3D loading. Keep scene-specific changes in content and adapters wherever possible rather than duplicating scenario logic.

**Outputs:** complete eight-space website with beginner and Engineer views, 3D/2D routes, captions/transcripts, case folder, comparison, replay, reset, and final diagnostic exercise.

**Exit checks:** every concept in the PRD has a visible event, a visitor control, an inspected consequence, and a learning check; all rooms honor case-state invariants; no 3D motion implies authorization or success the engine has not established; combined experiments explain interacting causes or reject unsupported combinations.

## Phase 7 — Verify learning, accessibility, and performance

**Work:** Run engine/content/browser checks, keyboard and assistive-technology sessions, reduced-motion and 2D parity review, device performance profiling, and observed learner sessions. Compare pre/post causal questions and inspect errors and abandonment points. Refine scenes that look impressive but do not improve understanding. Audit the fictional source claims and platform comparison links immediately before release.

**Outputs:** release candidate; issue log with resolved critical defects; accessibility findings and fixes; device measurements and chosen quality tiers; learner-test findings with content revisions.

**Exit checks:** representative learners can diagnose the final Saturday failure and articulate the eight distinctions; core tasks work without 3D, pointer, or motion; no critical content contradiction, unsupported claim, access leak, or misleading action state remains; performance is acceptable on the agreed device set. Exact numeric success thresholds should be set with the team before testing, not invented after seeing results.

## Phase 8 — Release and maintain

**Work:** Deploy the static core over HTTPS; verify asset delivery, fallback, links, and monitoring for page failures and load performance. Publish a clear simulation label and source notes. Establish owners for content accuracy, technical operations, asset optimization, and accessibility. Schedule reviews of platform-specific copy because vendor capabilities and terminology change. Define rollback of both code and versioned content packages.

**Outputs:** public or agreed-access release; release manifest identifying code/content/assets; operating checklist; content update and incident process; a prioritized backlog informed by learner observations.

**Exit checks:** a release can be reproduced and rolled back; broken 3D delivery still leaves a usable 2D lesson; content changes run through schema, scenario, and learning review; the team can correct a stale or inaccurate platform statement without reauthoring the fictional scenario.

## Dependencies and parallel work

The critical path is **product contract → canonical fixtures/rules → 2D causal interaction → 3D proof → three-space validation → full content → room production → learner validation → release**. Asset-kit exploration may begin while the scenario engine is built, but final animation should use approved scene scripts. The remaining rooms' writing can proceed while the vertical slice is tested, provided the Saturday facts and shared contracts remain stable. Accessibility and content review begin in Phase 0 and recur at every gate; they are not postponed to Phase 7.

## Risks and response

| Risk | Early signal | Response |
|---|---|---|
| The 3D world distracts from evidence | Learners recall gestures but cannot cite a passage | Reduce camera motion and place exact evidence earlier in the HTML panel. |
| Content combinations become incoherent | Experiment mode needs many ad hoc exceptions | Narrow compatible controls, expose dependency rules, reject unsupported states. |
| Character assets are costly | Slow scene entry, high GPU time or memory | Reuse rigs, simplify materials/meshes, reduce simultaneous characters, test texture choices. |
| 3D and 2D diverge | Different text or outcomes in the same run | Render both from one scene view model; test cross-view parity. |
| Simulation is mistaken for real AI behavior | Learners infer guarantees from a scripted outcome | Label fixtures and authored outcomes; teach the boundary explicitly. |
| Vendor comparison becomes stale | Broken or changed documentation claims | Isolate and date provider-specific copy; assign an update owner. |
| A booking appears completed prematurely | UI animation or language outruns the engine | Enforce explicit action-status variants and review all proposal/confirmation states. |

## Milestone review packet

At each phase gate, present: a working artifact or exact content fixture, the relevant state/event trace, a 2D and 3D comparison where applicable, accessibility findings, device measurements when relevant, unresolved risks, and a decision to proceed or revise. This avoids treating a visual demo as proof of educational correctness.

**Immediate next task:** Phase 0 review of the unifying case and learning contract, followed by Phase 1 encoding of the already specified Saturday fixtures. The first coded milestone should be a deterministic answer and explanation that can be replayed without a 3D scene.
