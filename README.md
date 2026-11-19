# The AI Service House

A human-scale educational simulation of how an AI service answer depends on context, retrieval, and tool evidence. Phase 2 is a fully usable HTML and 2D three-space vertical slice. The Riverside center, documents, visitor, dates, and calendar are fictional. No appointment can be booked.

## Run locally

Requires Node.js 22.18+.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. Visit `#/briefing`, `#/library`, and `#/service-counter`. A static deployment on Vercel uses `vercel.json` and the Vite `dist` output.

```sh
npm run check
npm run inspect
```

`npm run test:browser` runs a three-route smoke path with a local Chromium installation (after starting `npm run dev`). This workspace sandbox prevents Chromium from launching, so this is provided for an ordinary local or CI environment.

`check` validates exact source excerpts, runs deterministic engine and DOM interaction tests, checks TypeScript, and builds the production site. The browser receives a verified public-only content projection; restricted fixture text is excluded from built assets. The site uses semantic HTML and CSS; no WebGL or external AI/calendar service is needed. A web-font request is optional and falls back to system fonts when unavailable.

## Learning flow

1. Predict what a controlled change will do.
2. Reveal one change in the guided room.
3. Compare the reference and changed states, inspect source passages and tool evidence, and replay snapshots.
4. Open an experiment fork to combine only validated changes: current notice in/out of context, current/hours-only retrieval, and the two Tuesday calendar fixtures. A verified time may be proposed, never booked.

Each room keeps its run when switching routes or reloading. Reset affects only the current room. State is saved in the browser's local storage against the content version; a failed or old save resets safely. The prototype observation log is in memory for the current tab and does not send data anywhere.

See [Phase 2 implementation and learner review](docs/PHASE_2_IMPLEMENTATION.md) for the interaction map, accessibility checks, review script, and remaining exit gate. Earlier specifications remain in `docs/`.
