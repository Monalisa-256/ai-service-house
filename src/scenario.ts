import { readFileSync } from 'node:fs';

export type Document = { id: string; title: string; published: string; effectiveFrom: string; effectiveTo: string | null; audience: 'public' | 'staff' | 'external'; status: 'current' | 'superseded'; supersededBy?: string };
export type Passage = { id: string; documentId: string; text: string; tags: string[] };
export type ToolFixture = { date: string; status: 'ok' | 'timeout'; slots: string[]; checkedAt: string };
export type Content = {
  schemaVersion: string; scenarioId: string; contentVersion: string; fictionalNow: string; targetDate: string; question: string;
  roles: Record<string, { permissions: string[] }>;
  documents: Document[]; passages: Passage[]; strategies: Record<string, string[]>;
  toolFixtures: Record<string, ToolFixture>; explanations: Record<string, string>;
  learning: { objectives: string[]; scenes: string[]; predictionIds: string[]; cueIds: string[] };
};
export type Event =
  | { type: 'REMOVE_CONTEXT_PASSAGE'; passageId: string }
  | { type: 'RESTORE_CONTEXT' }
  | { type: 'SET_RETRIEVAL_STRATEGY'; strategyId: string }
  | { type: 'SET_ROLE'; roleId: string }
  | { type: 'CHECK_TUESDAY_SLOTS'; fixtureId: string }
  | { type: 'PROPOSE_SLOT'; slot: string }
  | { type: 'REQUEST_PASSAGE'; passageId: string };
export type Claim = { id: string; text: string; passageIds: string[]; status: 'supported' | 'unverified' };
export type State = {
  scenarioId: string; contentVersion: string; roleId: string; strategyId: string;
  removedContextIds: string[]; requestedPassageIds: string[];
  retrievalIds: string[]; contextIds: string[]; claims: Claim[];
  appointmentStatus: 'suspended' | 'unverified'; bookingStatus: 'not_booked';
  tool: { status: 'none' | 'ok' | 'timeout'; slots: string[]; proposedSlot: string | null; fixtureId: string | null };
  explanationIds: string[]; cueIds: string[]; eventCount: number;
};

export function loadContent(path = new URL('../content/saturday.json', import.meta.url)): Content {
  return JSON.parse(readFileSync(path, 'utf8')) as Content;
}

function docFor(content: Content, passageId: string): Document {
  const passage = content.passages.find(p => p.id === passageId);
  if (!passage) throw new Error(`Unknown passage: ${passageId}`);
  const doc = content.documents.find(d => d.id === passage.documentId);
  if (!doc) throw new Error(`Missing document: ${passage.documentId}`);
  return doc;
}

export function eligible(content: Content, passageId: string, roleId: string): boolean {
  const doc = docFor(content, passageId);
  const permissions = content.roles[roleId]?.permissions;
  if (!permissions) throw new Error(`Unknown role: ${roleId}`);
  if (doc.status !== 'current' || content.targetDate < doc.effectiveFrom || (doc.effectiveTo && content.targetDate > doc.effectiveTo)) return false;
  return doc.audience === 'public' && permissions.includes('read_public') || doc.audience === 'staff' && permissions.includes('read_staff');
}

function derive(content: Content, input: Omit<State, 'retrievalIds' | 'contextIds' | 'claims' | 'appointmentStatus' | 'bookingStatus' | 'explanationIds'>): State {
  const retrievalIds = content.strategies[input.strategyId].filter(id => eligible(content, id, input.roleId));
  const contextIds = retrievalIds.filter(id => !input.removedContextIds.includes(id));
  const has = (id: string) => contextIds.includes(id);
  const claims: Claim[] = [
    { id: 'reception-hours', text: 'Reception is open Saturday, 21 November, 09:00–12:00.', passageIds: has('p-hours-1') ? ['p-hours-1'] : has('p-notice-2') ? ['p-notice-2'] : [], status: has('p-hours-1') || has('p-notice-2') ? 'supported' : 'unverified' },
    { id: 'appointment-status', text: has('p-notice-1') ? 'Application-help appointments are suspended Saturday, 21 November.' : 'Saturday application-help appointment availability cannot be verified from this context.', passageIds: has('p-notice-1') ? ['p-notice-1'] : [], status: has('p-notice-1') ? 'supported' : 'unverified' }
  ];
  const explanationIds = [has('p-notice-1') ? 'baseline' : input.removedContextIds.includes('p-notice-1') ? 'notice_removed' : 'retrieval_miss'];
  if (input.tool.status === 'ok') explanationIds.push('tool_ok');
  if (input.tool.status === 'timeout') explanationIds.push('tool_timeout');
  if (input.requestedPassageIds.some(id => !eligible(content, id, input.roleId))) explanationIds.push('access_denied');
  return { ...input, retrievalIds, contextIds, claims, appointmentStatus: has('p-notice-1') ? 'suspended' : 'unverified', bookingStatus: 'not_booked', explanationIds };
}

export function initialState(content: Content): State {
  return derive(content, { scenarioId: content.scenarioId, contentVersion: content.contentVersion, roleId: 'public', strategyId: 'current-hybrid', removedContextIds: [], requestedPassageIds: [], tool: { status: 'none', slots: [], proposedSlot: null, fixtureId: null }, cueIds: [], eventCount: 0 });
}

export function transition(content: Content, state: State, event: Event): State {
  if (state.scenarioId !== content.scenarioId || state.contentVersion !== content.contentVersion) throw new Error('Scenario version mismatch');
  const next = { ...state, removedContextIds: [...state.removedContextIds], requestedPassageIds: [...state.requestedPassageIds], tool: { ...state.tool, slots: [...state.tool.slots] }, cueIds: [] as string[], eventCount: state.eventCount + 1 };
  switch (event.type) {
    case 'REMOVE_CONTEXT_PASSAGE':
      if (!content.passages.some(p => p.id === event.passageId)) throw new Error(`Unknown passage: ${event.passageId}`);
      if (!next.contextIds.includes(event.passageId)) throw new Error('Passage is not in current context');
      next.removedContextIds.push(event.passageId); next.cueIds = ['notice_removed']; break;
    case 'RESTORE_CONTEXT': next.removedContextIds = []; break;
    case 'SET_RETRIEVAL_STRATEGY':
      if (!(event.strategyId in content.strategies)) throw new Error(`Unknown strategy: ${event.strategyId}`);
      next.strategyId = event.strategyId; next.cueIds = ['search_narrowed']; break;
    case 'SET_ROLE':
      if (!(event.roleId in content.roles)) throw new Error(`Unknown role: ${event.roleId}`);
      next.roleId = event.roleId; break;
    case 'CHECK_TUESDAY_SLOTS': {
      if (!content.roles[next.roleId].permissions.includes('check_slots')) throw new Error('Slot lookup not authorized');
      const fixture = content.toolFixtures[event.fixtureId];
      if (!fixture || fixture.date !== '2026-11-24') throw new Error('Invalid Tuesday tool fixture');
      next.tool = { status: fixture.status, slots: [...fixture.slots], proposedSlot: null, fixtureId: event.fixtureId };
      next.cueIds = [fixture.status === 'timeout' ? 'calendar_timeout' : 'slot_checked']; break;
    }
    case 'PROPOSE_SLOT':
      if (next.tool.status !== 'ok' || !next.tool.slots.includes(event.slot)) throw new Error('Slot was not verified by the current tool result');
      next.tool.proposedSlot = event.slot; break;
    case 'REQUEST_PASSAGE':
      if (!content.passages.some(p => p.id === event.passageId)) throw new Error(`Unknown passage: ${event.passageId}`);
      next.requestedPassageIds.push(event.passageId); break;
    default: { const unreachable: never = event; throw new Error(`Unhandled event: ${JSON.stringify(unreachable)}`); }
  }
  return derive(content, next);
}

export function replay(content: Content, events: readonly Event[]): State {
  return events.reduce((state, event) => transition(content, state, event), initialState(content));
}

export function explain(content: Content, state: State): string[] {
  return state.explanationIds.map(id => content.explanations[id]);
}
