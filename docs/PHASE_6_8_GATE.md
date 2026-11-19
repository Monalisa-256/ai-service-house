# Phases 6–8 production and release gate

**Status: release candidate in source, not a verified public release. Reviewed 19 November 2026.** This document separates reproducible checks from device and learner evidence that has not been collected. The current production alias was observed on an older Git commit, so this source package is not the live site.

## Phase 6 production inventory

All eight rooms have editable Blender masters, optimized room GLBs, a skinned service worker, named event clips, an HTML causal path, source/fixture inspection, replay/reset, a learning check, and optional speech narration. The five later rooms use `ExtendedScenePanel` to display a 3D staff action tied to an already applied event. Their 2D state tables and exact fixture descriptions stay mounted when 3D is hidden or loading. The briefing visual player has its own five-step SVG route; the library and counter retain their earlier three-space workbench layout. The final diagnostic at `#/challenge` asks eight layered questions and scores the five categories of the authored nine-point rubric. The other three questions are explanations, not scored rubric criteria.

The five later rooms' optional inspection cards are authored interventions and observations. They are **not** live combinatorial simulations or additional event reducers. Compatible combined operations are restricted to the validated recovery sequence. No card or animation performs an actual booking or exposes the staff rota body.

| Room | Optimized GLB | Named clips | Primary visible intervention |
| --- | ---: | ---: | --- |
| Briefing | 50,884 B | 3 | Remove selected notice. |
| Library | 55,768 B | 1 | Narrow candidates. |
| Service counter | 45,356 B | 1 | Calendar timeout. |
| Records | 48,424 B | 1 | Activate current notice. |
| Workshop | 47,964 B | 1 | Serve stale cache. |
| Test room | 48,528 B | 1 | Run candidate evaluation. |
| Security | 47,992 B | 1 | Inject hostile source; deny access. |
| Operations | 65,740 B | 8 | Incident and bounded recovery steps. |

The eight optimized room files total **410,656 B**; a room loads only its own model. Source totals, hashes, skin, nodes, materials, triangles, and clips are in `assets/manifest.json`. This is a transfer-size measurement, not a device-frame-time result. The shared optional Three.js module is approximately 257 KB gzip in the local production build; it loads only when a 3D view is requested in the new later-room panel.

## Phase 7 evidence and open review

`npm run check` validates exact public content, extended rules, the public-only bundle, deterministic engine tests, DOM tests, TypeScript, and production compilation. `test/scene.test.ts` parses every GLB through Three.js and checks that each later room's named clip actually moves its prop. The browser smoke script covers the earlier guided path and visual player, but Chromium could not be launched in this restricted workspace. There has been **no observed learner session, assistive-technology session, phone/laptop GPU profile, or pre/post causal assessment** in this turn. Therefore Phase 7's human and device exit checks are open.

Review with at least a modest phone and laptop, keyboard-only and a screen reader, and representative beginner and Engineer learners. Before the sessions, the team should choose numeric success and performance thresholds. Record task completion, incorrect inferences about booking, passage identification, retrieval miss diagnosis, abandonment, and any voice interference. Test 2D with WebGL blocked and an asset request failed. The key question is whether each motion improves explanation of the exact source and action boundary.

## Issue log

| ID | Severity | State | Finding / next action |
| --- | --- | --- | --- |
| P7-01 | Gate | Open | Run observed learner sessions and revise unclear concepts. |
| P7-02 | Gate | Open | Record phone/laptop entry time, frame behavior, memory, and chosen quality tier. |
| P7-03 | Gate | Open | Perform keyboard and screen-reader review of all eight routes and final challenge. |
| P7-04 | Gate | Open | Run browser smoke with Chromium outside the restricted workspace, including failed GLB delivery. |
| P7-05 | Content | Open | Educator review of every optional inspection card; cards are authored observations rather than stateful simulations. |
| P7-06 | Design | Open | Migrate library, counter, and five later rooms from workbench pages to the focused visual lesson-player grammar after learner review of the briefing prototype. |

## Phase 8 operating procedure

1. Run `npm ci`, `npm run check`, and `npm run test:browser` with a locally reachable Vite server. Verify HTML fallback, all eight hashes, the challenge, and the public fixture exclusion.
2. Record the source commit and run `npm run release:manifest`. Keep the generated `release-manifest.json` with the release ZIP and deployment record. It includes SHA-256 for tracked code, content, and assets.
3. Deploy the reviewed Git commit to a Vercel preview, inspect HTTPS and each room asset URL, then promote it only after the Phase 7 gates close. The public alias should not be assumed to match the local source until its deployment SHA is checked.
4. For rollback, use Vercel's previous immutable deployment and restore the matching versioned content package; rerun the Saturday acceptance checks. A broken 3D asset must leave the HTML case study usable.
5. Assign named owners before launch: content and platform documentation, technical deployment and rollback, Blender asset optimization, and accessibility review. Review platform links on each release and on a scheduled editorial cycle. These owner assignments are currently open.

The platform drawer was checked against official provider pages on 19 November 2026; OpenAI and Google links were updated to their current documentation destinations. This check does not replace a release-day review. Vercel's [deployment](https://vercel.com/docs/deployments) and [rollback](https://vercel.com/docs/deployments/rollback-production-deployment) documentation describes immutable deployments and rollback. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) covers keyboard operation and motion controls; conformance requires observed review beyond DOM tests.
