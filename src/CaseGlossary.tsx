const terms = [
  ['Task brief','The application-level instruction defining the assistant’s job and boundaries.'],
  ['Source provenance','Where a record came from, its version, date, and eligibility.'],
  ['Candidate','A passage returned by initial retrieval before selection or reranking.'],
  ['Selected context','The passages actually supplied to this answer step.'],
  ['Tool result','A typed response from a simulated read-only calendar call, not a booking.'],
  ['Cache','A stored result that may be stale after its source or index changes.'],
  ['Critical slice','A subset whose failure can block release despite an improved aggregate score.'],
  ['Permission','The rule that blocks staff-only data from a public answer.'],
  ['Rollout containment','Holding expansion while an affected case is diagnosed and repaired.'],
  ['Confirmed booking','An authorized completed write and confirmation. This simulation has no booking write.']
] as const;
export function CaseGlossary() { return <details className="glossary"><summary>Glossary of case terms <span aria-hidden="true">＋</span></summary><dl>{terms.map(([term,meaning])=><div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl></details>; }
