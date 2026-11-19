# The AI Service House

An educational, fictional simulation of AI application decisions. Phase 1 contains the versioned Saturday case, deterministic event engine, validation, replay, and focused tests. It has no website, real model, calendar, or personal data yet.

## Run

Requires Node.js 22.18+ for TypeScript type stripping. No packages are required for this phase.

```sh
npm run check
npm run inspect
```

`inspect` prints a compact event → state → explanation trace. `docs/` contains the PRD, architecture, learning foundation, scenario specification, stack, and phase plan.

The case is entirely invented. An opening-hours claim never proves appointment availability; a returned slot never proves a booking. See [the scenario specification](docs/SATURDAY_VERTICAL_SLICE.md).
