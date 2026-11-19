import { explain, inspectPassage, type Content, type State } from './scenario.ts';

export type DiagnosticTrace = {
  scenarioId: string; contentVersion: string; targetDate: string; roleId: string; strategyId: string;
  candidates: { id: string; source: string; published: string }[];
  omittedFromContext: string[];
  claims: { id: string; status: string; evidence: string[] }[];
  tool: { fixtureId: string | null; status: string; proposedSlot: string | null };
  bookingStatus: string; explanation: string[];
};

/** Public-safe trace: it never includes inaccessible passage text or staff records. */
export function diagnosticTrace(content: Content, state: State): DiagnosticTrace {
  return {
    scenarioId: state.scenarioId, contentVersion: state.contentVersion, targetDate: content.targetDate,
    roleId: state.roleId, strategyId: state.strategyId,
    candidates: state.retrievalIds.map(id => {
      const passage = inspectPassage(content, state, id);
      if (!passage) throw new Error(`Ineligible candidate in trace: ${id}`);
      return { id, source: passage.title, published: passage.published };
    }),
    omittedFromContext: state.retrievalIds.filter(id => !state.contextIds.includes(id)),
    claims: state.claims.map(c => ({ id: c.id, status: c.status, evidence: [...c.passageIds] })),
    tool: { fixtureId: state.tool.fixtureId, status: state.tool.status, proposedSlot: state.tool.proposedSlot },
    bookingStatus: state.bookingStatus, explanation: explain(content, state)
  };
}

export function compareTraces(before: DiagnosticTrace, after: DiagnosticTrace): { changed: string[]; explanation: string[] } {
  if (before.scenarioId !== after.scenarioId || before.contentVersion !== after.contentVersion) throw new Error('Cannot compare different scenario versions');
  const changed: string[] = [];
  for (const key of ['roleId', 'strategyId', 'candidates', 'omittedFromContext', 'claims', 'tool', 'bookingStatus'] as const) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changed.push(key);
  }
  return { changed, explanation: after.explanation };
}
