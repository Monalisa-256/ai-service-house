import { readFileSync } from 'node:fs';

export type Document = { id: string; title: string; published: string; effectiveFrom: string; effectiveTo: string | null; audience: 'public' | 'staff' | 'external'; status: 'current' | 'superseded'; supersededBy?: string; body: string };
export type Passage = { id: string; documentId: string; text: string; tags: string[] };
export type ToolFixture = { date: string; status: 'ok' | 'timeout'; slots: string[]; checkedAt: string };
export type Content = {
  schemaVersion: string; scenarioId: string; contentVersion: string; fictionalNow: string; targetDate: string; question: string;
  service: { center: string; reception: string; applicationHelp: string; timezone: string };
  instructions: { id: string; role: 'developer'; text: string }[];
  roles: Record<string, { permissions: string[] }>;
  documents: Document[]; passages: Passage[]; strategies: Record<string, string[]>;
  toolFixtures: Record<string, ToolFixture>; explanations: Record<string, string>;
  learning: { objectives: string[]; scenes: string[]; predictionIds: string[]; cueIds: string[] };
};
export type Event =
  | { type: 'REMOVE_CONTEXT_PASSAGE'; passageId: string }
  | { type: 'REMOVE_DOCUMENT_FROM_CONTEXT'; documentId: string }
  | { type: 'RESTORE_CONTEXT' }
  | { type: 'SET_RETRIEVAL_STRATEGY'; strategyId: string }
  | { type: 'SET_ROLE'; roleId: string }
  | { type: 'CHECK_TUESDAY_SLOTS'; fixtureId: string }
  | { type: 'PROPOSE_SLOT'; slot: string }
  | { type: 'REQUEST_PASSAGE'; passageId: string };
export const eventTypes = ['REMOVE_CONTEXT_PASSAGE', 'REMOVE_DOCUMENT_FROM_CONTEXT', 'RESTORE_CONTEXT', 'SET_RETRIEVAL_STRATEGY', 'SET_ROLE', 'CHECK_TUESDAY_SLOTS', 'PROPOSE_SLOT', 'REQUEST_PASSAGE'] as const;
export type Claim = { id: string; text: string; passageIds: string[]; status: 'supported' | 'unverified' };
export type EvidenceCheck = { claimId: string; passageId: string; supported: boolean; reason: 'supports_claim' | 'not_in_context' | 'not_eligible' | 'wrong_topic' };
export type Answer = { text: string; appointmentStatus: 'suspended' | 'unverified'; bookingStatus: 'not_booked'; sourceIds: string[]; nextStep: string };
export type State = {
  scenarioId: string; contentVersion: string; roleId: string; strategyId: string;
  removedContextIds: string[]; requestedPassageIds: string[];
  retrievalIds: string[]; contextIds: string[]; claims: Claim[];
  appointmentStatus: 'suspended' | 'unverified'; bookingStatus: 'not_booked';
  answer: Answer;
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

function derive(content: Content, input: Omit<State, 'retrievalIds' | 'contextIds' | 'claims' | 'appointmentStatus' | 'bookingStatus' | 'answer' | 'explanationIds'>): State {
  const retrievalIds = content.strategies[input.strategyId].filter(id => eligible(content, id, input.roleId));
  const contextIds = retrievalIds.filter(id => !input.removedContextIds.includes(id));
  const has = (id: string) => contextIds.includes(id);
  const claims: Claim[] = [
    { id: 'reception-hours', text: 'Reception is open Saturday, 21 November, 09:00–12:00.', passageIds: has('p-hours-1') ? ['p-hours-1'] : has('p-notice-2') ? ['p-notice-2'] : [], status: has('p-hours-1') || has('p-notice-2') ? 'supported' : 'unverified' },
    { id: 'general-information', text: 'A visitor can come to reception for general information during opening hours.', passageIds: has('p-notice-2') ? ['p-notice-2'] : has('p-service-2') ? ['p-service-2'] : has('p-hours-3') ? ['p-hours-3'] : [], status: has('p-notice-2') || has('p-service-2') || has('p-hours-3') ? 'supported' : 'unverified' },
    { id: 'application-help-rule', text: 'Application-help sessions require an appointment.', passageIds: has('p-service-1') ? ['p-service-1'] : [], status: has('p-service-1') ? 'supported' : 'unverified' },
    { id: 'appointment-status', text: has('p-notice-1') ? 'Application-help appointments are suspended Saturday, 21 November.' : 'Saturday application-help appointment availability cannot be verified from this context.', passageIds: has('p-notice-1') ? ['p-notice-1'] : [], status: has('p-notice-1') ? 'supported' : 'unverified' }
  ];
  const explanationIds = [has('p-notice-1') ? 'baseline' : input.removedContextIds.includes('p-notice-1') ? 'notice_removed' : 'retrieval_miss'];
  if (!has('p-hours-1') && !has('p-notice-2')) explanationIds.push('hours_missing');
  if (!has('p-service-1')) explanationIds.push('service_rule_missing');
  if (input.tool.status === 'ok') explanationIds.push('tool_ok');
  if (input.tool.status === 'timeout') explanationIds.push('tool_timeout');
  if (input.requestedPassageIds.some(id => !eligible(content, id, input.roleId))) explanationIds.push('access_denied');
  const appointmentStatus = has('p-notice-1') ? 'suspended' : 'unverified';
  const opening = has('p-hours-1') || has('p-notice-2') ? 'Reception is open Saturday, 21 November, from 09:00 to 12:00.' : 'I cannot verify Saturday reception hours from the selected information.';
  const general = has('p-notice-2') || has('p-service-2') || has('p-hours-3') ? 'You can come for general information during reception hours.' : 'I cannot verify whether general information is offered then.';
  const service = has('p-service-1') ? 'Application-help sessions require an appointment.' : 'I cannot verify the application-help service rule from the selected information.';
  const saturday = appointmentStatus === 'suspended' ? 'Application-help appointments are suspended that day.' : 'I cannot confirm application-help appointment availability for Saturday from this information.';
  const nextStep = input.tool.status === 'timeout' ? 'I could not verify Tuesday slots right now. Please try again or contact reception.' : input.tool.status === 'ok' ? 'The simulated calendar showed Tuesday options when checked; no appointment has been booked.' : 'I can check another date if you would like.';
  const answer: Answer = { text: `${opening} ${general} ${service} ${saturday} ${nextStep}`, appointmentStatus, bookingStatus: 'not_booked', sourceIds: [...new Set(claims.flatMap(c => c.passageIds))], nextStep };
  return { ...input, retrievalIds, contextIds, claims, appointmentStatus, bookingStatus: 'not_booked', answer, explanationIds };
}

export function initialState(content: Content): State {
  return derive(content, { scenarioId: content.scenarioId, contentVersion: content.contentVersion, roleId: 'public', strategyId: 'current-hybrid', removedContextIds: [], requestedPassageIds: [], tool: { status: 'none', slots: [], proposedSlot: null, fixtureId: null }, cueIds: [], eventCount: 0 });
}

export function transition(content: Content, state: State, event: Event): State {
  if (!event || typeof event !== 'object' || !eventTypes.includes(event.type)) throw new Error('Invalid scenario event');
  if (state.scenarioId !== content.scenarioId || state.contentVersion !== content.contentVersion) throw new Error('Scenario version mismatch');
  const next = { ...state, removedContextIds: [...state.removedContextIds], requestedPassageIds: [...state.requestedPassageIds], tool: { ...state.tool, slots: [...state.tool.slots] }, cueIds: [] as string[], eventCount: state.eventCount + 1 };
  switch (event.type) {
    case 'REMOVE_CONTEXT_PASSAGE':
      if (!content.passages.some(p => p.id === event.passageId)) throw new Error(`Unknown passage: ${event.passageId}`);
      if (!next.contextIds.includes(event.passageId)) throw new Error('Passage is not in current context');
      next.removedContextIds.push(event.passageId); next.cueIds = ['notice_removed']; break;
    case 'REMOVE_DOCUMENT_FROM_CONTEXT': {
      if (!content.documents.some(d => d.id === event.documentId)) throw new Error(`Unknown document: ${event.documentId}`);
      const selected = next.contextIds.filter(id => content.passages.find(p => p.id === id)?.documentId === event.documentId);
      if (!selected.length) throw new Error('Document has no passages in current context');
      next.removedContextIds.push(...selected); next.cueIds = ['notice_removed']; break;
    }
    case 'RESTORE_CONTEXT': next.removedContextIds = []; break;
    case 'SET_RETRIEVAL_STRATEGY':
      if (!Object.hasOwn(content.strategies, event.strategyId)) throw new Error(`Unknown strategy: ${event.strategyId}`);
      next.strategyId = event.strategyId; next.cueIds = ['search_narrowed']; break;
    case 'SET_ROLE':
      if (!Object.hasOwn(content.roles, event.roleId)) throw new Error(`Unknown role: ${event.roleId}`);
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

/** A citation check is an explicit educational fixture, not a general natural-language entailment model. */
export function checkCitation(content: Content, state: State, claimId: string, passageId: string): EvidenceCheck {
  const claim = state.claims.find(c => c.id === claimId);
  if (!claim) throw new Error(`Unknown claim: ${claimId}`);
  docFor(content, passageId);
  if (!eligible(content, passageId, state.roleId)) return { claimId, passageId, supported: false, reason: 'not_eligible' };
  if (!state.contextIds.includes(passageId)) return { claimId, passageId, supported: false, reason: 'not_in_context' };
  if (!claim.passageIds.includes(passageId)) return { claimId, passageId, supported: false, reason: 'wrong_topic' };
  return { claimId, passageId, supported: true, reason: 'supports_claim' };
}

export function inspectPassage(content: Content, state: State, passageId: string): { id: string; text: string; documentId: string; title: string; published: string; effectiveFrom: string; effectiveTo: string | null } | null {
  if (!eligible(content, passageId, state.roleId)) return null;
  const passage = content.passages.find(p => p.id === passageId)!;
  const document = docFor(content, passageId);
  return { id: passage.id, text: passage.text, documentId: document.id, title: document.title, published: document.published, effectiveFrom: document.effectiveFrom, effectiveTo: document.effectiveTo };
}
