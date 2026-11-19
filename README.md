# The AI Service House

An educational, fictional simulation of AI application decisions. Phase 1 contains exact versioned Saturday documents, deterministic events and claims, content validation, guided and experiment sessions, safe replay/import, diagnostic traces, and focused tests. It has no website, real model, calendar, or personal data yet.

## Run

Requires Node.js 22.18+ for TypeScript type stripping. No packages are required for this phase.

```sh
npm run check
npm run inspect
```

`inspect` prints a compact event → state → explanation trace. `docs/` contains the PRD, architecture, learning foundation, scenario specification, stack, and phase plan.

See [Phase 1 implementation notes](docs/PHASE_1_IMPLEMENTATION.md) for the content review workflow and deliberate limits of the simulation.

The case is entirely invented. An opening-hours claim never proves appointment availability; a returned slot never proves a booking. See [the scenario specification](docs/SATURDAY_VERTICAL_SLICE.md).
