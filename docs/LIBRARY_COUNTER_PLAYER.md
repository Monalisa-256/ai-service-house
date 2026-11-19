# Library and service-counter visual lessons

**Status:** implemented prototype, 19 November 2026. These routes extend the briefing lesson player without changing the canonical Saturday fixtures.

| Route | Five beats | Observable boundary |
|---|---|---|
| `#/library/1` through `/5` | scope, current candidates, narrowed retrieval, reranking, restored retrieval | A passage can remain a current public record while absent from candidates. Reranking cannot add it. |
| `#/service-counter/1` through `/5` | request, typed result, proposal, timeout, action boundary | A read-only lookup and proposed time never create a booking. A timeout removes fresh availability. |

Each beat derives its answer and status from `sliceSnapshot`, which applies the same `scenario.ts` transitions as the detailed workbench. The SVG scene is a presentation of resolved state. Replay, pause, scrub, skip, or disabling motion cannot change the case. The optional 3D view receives `sceneView` from the same snapshot and is lazy loaded. Exact public passages and the authored tool response remain in HTML when 3D is unavailable. Twenty recorded MP3s cover the briefing and new five-step lessons plus the five later rooms; transcripts are visible beside playback.

The new routes support keyboard links, motion controls, evidence inspection, a screen-reader description of the diagram, and an explicit reduced-motion preference. `#/library-classic` and `#/service-counter-classic` retain the earlier detailed guided and experiment controls. The advanced view is a separate route, so a learner moving between the focused player and workbench starts from each route's own authored state rather than a shared unsaved intervention.

`npm run check` validates authored data, scenario invariants, MP3/script hashes, DOM interactions, TypeScript, and public bundle boundaries. Browser and device sessions remain necessary to assess visual comprehension, speech playback in target browsers, and real GPU performance. The remaining five rooms have not yet been converted to the visual player.
