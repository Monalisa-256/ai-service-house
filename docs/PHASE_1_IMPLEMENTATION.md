# Phase 1 implementation and content review

**Status:** implemented and verified scenario foundation, 19 November 2026. This document describes what the repository actually does; the product documents in this directory describe later phases.

## Implemented contracts

- `content/saturday.json` holds exact fictional document bodies, verbatim passages, publication/effective dates, source audience, versions, a developer task instruction, retrieval fixtures, tool fixtures (including Saturday unavailable, Tuesday options, and Tuesday timeout), explanations, and learning metadata.
- `src/validate.ts` checks references, duplicate IDs, dates, exact passage occurrence, roles, canonical fixture shape, tool response constraints, explanations, and visual cue IDs. It is a content integrity check, not a general natural-language fact checker.
- `src/scenario.ts` computes eligibility before retrieval, selected context, claim support, an authored answer, simulated tool status, and explanation IDs. It checks a citation against an authored claim-to-passage mapping. A public role cannot inspect staff-only text. No booking write event exists.
- `src/session.ts` restricts guided actions by concept space, forks experiment runs, holds snapshots, exports bounded event logs, and replays imported logs against the trusted versioned content. It does not trust imported snapshots.
- `src/public-content.ts` creates and verifies a public-only projection for the Phase 2 browser build, leaving restricted fixture records in the full development content.
- `src/trace.ts` produces a public-safe diagnostic trace and compares candidate, context, claim, and tool changes.
- `src/inspect.ts` prints an example event sequence. Phase 2 supplies the UI; the engine itself has no external model, live calendar connection, authentication, or production telemetry.

## Content review workflow

1. **Author:** update document body and passage text together; give each item a stable ID and effective interval. Increment `contentVersion` when an outcome-relevant fixture changes.
2. **Technical review:** confirm roles, temporal eligibility, tool states, claim mappings, and explanations. Test the canonical case and every changed intervention.
3. **Learning review:** read the answer and explanation without looking at code. Check that one changed cause is visible, the prediction is answerable from displayed evidence, and the human metaphor does not claim to show literal AI computation.
4. **Accessibility/content review:** check that every future scene cue has a text/2D equivalent and that source and status labels are unambiguous.
5. **Gate:** run `npm run check`, inspect an event trace with `npm run inspect`, and record any new edge case. The automated checks do not replace human review of natural-language support.

## Boundaries and planned extensions

The retrieval strategies are fixed candidate fixtures, not a vector search algorithm. Citation checking is a reviewed mapping for this fictional case, not an entailment model. `bookingStatus` is always `not_booked`, because the vertical slice stops before a simulated write. A current notice removed from the **context** stays in records and retrieval; a narrow retrieval strategy can omit it from **candidates**. These are separate causal interventions. The `stale-index` candidate fixture intentionally includes a superseded passage, which eligibility filtering rejects; a later operations lesson can model a broken filter as an explicit incident scenario.

Phase 2 adds a 2D HTML learning interface over these contracts. Before extending to all eight spaces, we should model operational incidents, evaluation datasets, cache behavior, and approval workflows in separate versioned fixtures with their own tests. Do not infer them from animation.
