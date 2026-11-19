# The AI Service House — Phase 0 Foundation and Review Record

**Status:** approved design baseline for the next production phase, subject to prototype learner validation · 19 November 2026. “Approved” here records the product decisions made in this design pass; it does not claim external stakeholder sign-off or measured learning outcomes. Companion to the revised PRD and `LEARNING_OBJECTIVES.md`.

## 1. Research-informed decisions

The fictional **Riverside Community Services Center** passes the coverage test. It provides a public service question, dated and conflicting source versions, staff-only records, a calendar, a potential action, evaluation cases, a hostile page, and a stale-index incident without real personal data. The center is a teaching fixture, not a real organization. This domain is less likely than a clinic to invite the site to give medical advice, while preserving the engineering mechanisms we need.

The primary audience is a beginner who may have used AI but has never built an AI system. The optional Engineer view serves developers and technical learners without requiring code literacy for the guided path. The 3D art direction is **stylized editorial people in a recognizably contemporary service center**, with ordinary paper, furniture, signs, and terminals. Human figures represent the visitor, staff, reviewers, and operators; they never personify an AI model. The model and application are shown through inputs, evidence, tool requests, statuses, and outputs. This is a narrative metaphor, and the interface states its limits.

The guided route is the primary path; the map permits direct entry. Target **24 minutes**: orientation 2, eight core beats at about 2 each, final diagnosis 4, and transitions/reflection 2. These are authoring budgets to test on a prototype. No learner should be rushed by a timer, and optional inspection is self-paced. An educator could pause after any beat. The 24-minute version teaches one causal distinction per space; it cannot fully cover every subtopic in that time. All subtopics remain available in an organized deep-dive layer and are included in the complete product scope.

### Terminology and the ambiguous question

The visitor says, **“Can I come this Saturday to get help with my application?”** This can mean (a) visit reception for general information or (b) attend a staffed application-help session. The site explicitly recognizes both. In the fixed case, Saturday 21 November 2026, reception is open 09:00–12:00, but application-help appointments are suspended. The canonical answer says the visitor **can come for general information** and **cannot count on an application-help session** that Saturday. If the visitor wants a later session, the assistant may check Tuesday availability, present a proposal, and clearly say no booking is completed.

Use **reception** for the general desk, **general information** for its walk-in service, **application-help session** for the appointment-based service, **slot** for observed calendar availability, **proposal** for an offered option, and **confirmed booking** only after a successful authorized write. Avoid “visit booked” for a lookup or proposal. Do not call the center's form assistance legal advice, application approval, or eligibility adjudication.

## 2. Coverage test across all eight spaces

| Space | Existing fixture | Observable core action → causal explanation | Optional inspection subtopics |
|---|---|---|---|
| Briefing desk | Hours, service page, current notice | Remove notice from context → supplied evidence no longer establishes Saturday appointment status. | Instruction hierarchy, examples, output schema, token budget, injection comparison. |
| Records room | v1/v2 notice, sample questions | Activate current notice → correct effective date changes eligible evidence. | Provenance, sampling, cleaning, label disagreement, quality axes, privacy, splits, retention. |
| Reference library | Public passages and index | Narrow search misses notice → reranker cannot restore absent candidate. | Chunking, keywords, embeddings, hybrid search, vector metadata, citations, abstention. |
| Service counter | Tuesday calendar fixtures | Lookup then timeout → availability becomes unknown; no booking occurs. | Typed tools, workflow vs agent, state, memory, approval, idempotency, step budgets. |
| Experience workshop | Cached Saturday answer | Update notice while cache stays live → stale answer appears despite quick response. | API contracts, streaming UX, latency distribution, cost, reliability, concurrency. |
| Test room | Normal and dated-case suite | Run candidate version → aggregate gain hides Saturday regression. | Rubrics, human review, graders, failure taxonomy, red-team cases. |
| Security checkpoint | Staff-only rota and hostile public copy | Replay poisoned source as public user → application access gate blocks rota. | Hallucination, output validation, abuse controls, least privilege, retention. |
| Operations room | Versioned index and rollout | Deploy index missing v2 → alert, containment, fix, and affected-slice verification. | Traces, metrics, feedback, drift, incident roles, rollback. |

Each row has a distinct change and a distinct explanation. The same fictional date, role, source versions, and action status must remain consistent. None requires a real model, appointment, identity, or patient record. The complete inventory remains in the PRD; “optional” means outside the short guided pass, not dispensable from the full educational product.

## 3. Core beat structure and pacing contract

Each space's core beat has: a one-sentence question; a visible baseline; a prediction before change; one visitor action; a changed outcome; an exact evidence panel; a concise causal explanation; and a link to inspect related mechanisms. Aim for a short animation that can be skipped or scrubbed. The visitor can answer before the scene moves. Incorrect predictions trigger informative feedback explaining the mistaken inference, without a failure screen or shaming language. The final challenge changes the wording and combines evidence from multiple spaces.

The 24-minute budget is plausible only with one core beat per space. If observed sessions exceed it, first simplify narration, transitions, and repeated instruction. Do not cut the evidence panel or remove accessibility controls to meet a stopwatch target. Time is subordinate to comprehension.

## 4. Representative learner and device profiles

These are **research recruitment profiles**, not stereotypes or claims about the population. Recruit people matching these conditions and observe real behavior; do not treat simulated personas as user evidence.

| Profile | Starting point | Prototype question | Device/context |
|---|---|---|---|
| Curious beginner | Uses AI tools, no coding or ML vocabulary | Can they distinguish an open desk from a bookable service? | Mid-range Android phone, portrait touch, variable connection. |
| Web developer new to AI | Understands APIs but not retrieval/evaluation | Can they locate a failure at the correct layer? | Ordinary laptop, keyboard and trackpad, desktop browser. |
| Educator or facilitator | Teaches a mixed-ability group | Can they pause, replay, and explain a scene without hidden context? | Laptop/projector or large display; sound may be off. |
| Keyboard or screen-reader user | Uses non-pointer navigation or spoken output | Can they complete every prediction and evidence inspection without canvas interaction? | Laptop with keyboard and screen reader; 2D route. |
| Motion-sensitive or low-bandwidth learner | Prefers reduced motion or cannot load large assets | Does the lesson remain complete without travel animation or GLB assets? | Phone or laptop with reduced motion, 2D route, constrained network. |

Minimum prototype matrix: a modest Android phone, a recent iPhone-class phone, an integrated-graphics laptop, keyboard-only desktop browser, and a screen-reader configuration. Exact hardware, browsers, and network profiles should be recorded when recruiting; do not assume a device label proves performance. Test touch target reach, portrait layout, WebGL failure, asset delay, and switching to 2D mid-run. Results from a small formative study guide revisions but do not establish general effectiveness.

## 5. Content style principles

1. **Plain language first:** “The notice was not included in the assistant's context” before “context assembly.” Define a technical term at first use and make the term clickable thereafter.
2. **One claim, one inspectable basis:** link factual fictional claims to exact passages and dates; link platform claims to dated official documentation. Mark unsupported claims directly.
3. **Name the state:** use `unknown`, `suspended`, `proposed`, `confirmed`, `failed`, and `superseded` consistently. Avoid a green checkmark that could mean several things.
4. **Use explicit time and scope:** show “Saturday, 21 November 2026” and “application-help appointments,” not bare “Saturday is closed.”
5. **Describe a causal change:** “The hours page remained, but the current notice left the selected context, so the assistant could no longer establish appointment status.” Avoid attributing intention or understanding to the model.
6. **Separate fact from analogy:** caption human action as “illustrates selection” when necessary; label numerical scores and costs as illustrative.
7. **Respect uncertainty:** “I cannot verify” is a meaningful result. A retrieved page or high similarity does not automatically prove a claim.
8. **Feedback teaches:** after a wrong prediction, show which assumption failed and invite replay. Do not use points or speed as proxies for mastery.
9. **Consistent source labels:** public/current, public/superseded, staff-only, external/untrusted, and simulated tool output appear in both visual and text views.
10. **No real-world advice:** the fictitious application-help service explains its own example forms only; the site does not advise on actual applications or eligibility.

## 6. Accessibility and inclusive representation principles

Provide the same objectives, facts, controls, predictions, and explanations in semantic HTML/2D as in 3D. The 3D view may add spatial intuition, but it cannot hold exclusive information. All controls work by keyboard; focus order follows the lesson, not the camera. A screen reader receives a concise state-change announcement and can inspect the passage and explanation. The canvas should not flood assistive technology with decorative mesh names. Human characters vary in appearance and role without relying on appearance to convey authority. Labels and context establish their responsibilities.

Use text labels in addition to color, adequate contrast and scalable text, captions/transcripts for any narration, and a non-audio path. Respect `prefers-reduced-motion` and offer an explicit setting to stop camera travel and non-essential character motion. Pause, replay, and scrub are available without requiring precise dragging. A fixed-camera and 2D route remain accessible during asset failure or slow download. Research grounding: CAST UDL 3.0 calls for multiple means of engagement, representation, and action/expression; W3C WCAG 2.2 addresses non-text alternatives, keyboard operation, captions, and interaction-triggered motion. These sources guide requirements, but a conformant implementation needs testing, not just this document. [CAST](https://udlguidelines.cast.org/) · [W3C non-text](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) · [keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard) · [captions](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded) · [motion](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)

## 7. Exact meaning of “educational simulation”

An **educational simulation** here is a deterministic, authored model of observable application decisions. Given a specified fictional case version and visitor event sequence, it resolves the same eligibility, evidence, response status, tool fixture, and explanation. It deliberately simplifies real AI behavior to isolate causes. Human movement and 3D geography are a visual analogy; they are not a literal depiction of model inference, vector dimensions, or a production service. No live appointment, staff record, or user identity is involved. If a future live-model lab exists, it is a separate mode with variable results and separate privacy/cost controls.

| Visible label | When it appears | Meaning |
|---|---|---|
| **Fictional case** | Entry and persistent case information | Riverside, records, people, and dates are invented for teaching. |
| **Simulated result** | Calendar, tool, evaluation, cache, deployment, incident outputs | The result comes from authored fixtures/rules, not a live service. |
| **Illustrative view** | 3D embedding map, spatial document handoff, cost/metric display | The visual explains a relationship without literally reproducing the computation or a measured value. |
| **Source evidence** | Passage inspector | Exact fictional text supports the adjacent fictional claim, subject to date and scope. |
| **Unverified** | Missing or conflicting relevant evidence | The case does not establish the claim; it is not proof of the opposite. |
| **Proposed — not booked** | Slot selection and action review | No successful booking event occurred. |
| **Live experiment** | Only if a future separate lab is built | Results may vary and have distinct data handling; absent from the core product. |

The entry can say: **“Explore a fictional service center. Change one part of its AI-assisted workflow and see why the answer changes. All records and actions are simulated.”** Every tool-result panel repeats “Simulated result.” The embedding map carries “Illustrative projection.” A proposed appointment carries “Not booked.” These labels are part of the interface contract, not footnotes.

## 8. Exit-check record

| Phase 0 exit check | Result and evidence | Remaining validation |
|---|---|---|
| Story covers eight spaces | **Pass at design level:** coverage matrix above has a fixture, action, and explanation for each. | Test whether visitors find the story intuitive. |
| No real personal data dependency | **Pass by design:** all records, names, rota details, calendar outputs, and user roles are fictional. | Review assets and authored copy before release. |
| Observable action and causal explanation | **Pass at specification level:** one core beat per space is defined. | Build and observe the interactions. |
| AI/process versus human roles | **Pass as art-direction rule:** humans depict real-world roles; inputs, evidence, and status depict system behavior. | Check that actual animation does not contradict this. |
| 24-minute guided route | **Target set, not verified.** | Measure with representative learners. |
| Accessible equivalence | **Requirement set, not verified.** | Test functional 2D and assistive-tech routes. |

**Decision:** the story passes Phase 0's *design* coverage gate; proceed to exact fixtures and prototype work under the stated validation conditions. This record does not imply that a built product or learner study has passed its later gates.

## 9. Research notes

The product uses a prediction before reveal and a causal explanation afterward because feedback and retrieval practice can support learning and transfer; the specific effectiveness of this implementation remains an empirical question. The 2D route and varied navigation follow UDL's multiple means of representation and action. The human-scale metaphor should connect prior knowledge to an unfamiliar system, but it must be checked for misconceptions—particularly “the clerk is the AI” and “open means bookable.” [National Academies, *How People Learn II*](https://nap.nationalacademies.org/catalog/24783/how-people-learn-ii-learners-contexts-and-cultures) · [EEF feedback](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/Feedback) · [CAST UDL 3.0](https://udlguidelines.cast.org/)
