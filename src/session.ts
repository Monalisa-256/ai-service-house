import { eventTypes, initialState, replay, transition, type Content, type Event, type State } from './scenario.ts';

export type Mode = 'guided' | 'experiment';
export type Session = {
  scenarioId: string;
  contentVersion: string;
  mode: Mode;
  guidedStep: 'briefing' | 'library' | 'service-counter';
  events: readonly Event[];
  snapshots: readonly State[];
};

const guidedAllowed: Record<Session['guidedStep'], Event['type'][]> = {
  briefing: ['REMOVE_CONTEXT_PASSAGE', 'REMOVE_DOCUMENT_FROM_CONTEXT', 'RESTORE_CONTEXT'],
  library: ['SET_RETRIEVAL_STRATEGY'],
  'service-counter': ['CHECK_TUESDAY_SLOTS', 'PROPOSE_SLOT']
};

export function createSession(content: Content): Session {
  return { scenarioId: content.scenarioId, contentVersion: content.contentVersion, mode: 'guided', guidedStep: 'briefing', events: [], snapshots: [initialState(content)] };
}

export function current(session: Session): State {
  return session.snapshots[session.snapshots.length - 1];
}

export function dispatch(content: Content, session: Session, event: Event): Session {
  if (session.scenarioId !== content.scenarioId || session.contentVersion !== content.contentVersion) throw new Error('Session content version mismatch');
  if (session.mode === 'guided') {
    if (!guidedAllowed[session.guidedStep].includes(event.type)) throw new Error(`Event ${event.type} is unavailable in guided ${session.guidedStep}`);
    const reference = session.guidedStep === 'service-counter' && session.events.length < 2 &&
      (session.events.length === 0 && event.type === 'CHECK_TUESDAY_SLOTS' && event.fixtureId === 'tuesday-ok' ||
       session.events.length === 1 && session.events[0].type === 'CHECK_TUESDAY_SLOTS' && session.events[0].fixtureId === 'tuesday-ok' && event.type === 'PROPOSE_SLOT');
    if (!reference && (session.guidedStep === 'service-counter' ? session.events.length !== 2 || event.type !== 'CHECK_TUESDAY_SLOTS' || event.fixtureId !== 'tuesday-timeout' : session.events.length !== 0))
      throw new Error('Guided mode permits one controlled intervention after the reference state');
  }
  const next = transition(content, current(session), event);
  return { ...session, events: [...session.events, event], snapshots: [...session.snapshots, next] };
}

export function enterGuidedStep(content: Content, session: Session, step: Session['guidedStep']): Session {
  if (session.mode !== 'guided') throw new Error('Guided step requires guided mode');
  // Each lesson starts from the canonical fixture; prior snapshots remain in the old session for comparison.
  return { ...createSession(content), guidedStep: step };
}

export function forkExperiment(content: Content, session: Session): Session {
  if (session.scenarioId !== content.scenarioId || session.contentVersion !== content.contentVersion) throw new Error('Session content version mismatch');
  return { ...session, mode: 'experiment', events: [...session.events], snapshots: [...session.snapshots] };
}

export function snapshotAt(session: Session, index: number): State {
  if (!Number.isInteger(index) || index < 0 || index >= session.snapshots.length) throw new Error('Invalid snapshot index');
  return session.snapshots[index];
}

export function restore(content: Content, session: Session, throughEvent: number): Session {
  if (!Number.isInteger(throughEvent) || throughEvent < 0 || throughEvent > session.events.length) throw new Error('Invalid replay boundary');
  const events = session.events.slice(0, throughEvent);
  const snapshots = [initialState(content)];
  for (const event of events) snapshots.push(transition(content, snapshots[snapshots.length - 1], event));
  if (JSON.stringify(snapshots[snapshots.length - 1]) !== JSON.stringify(replay(content, events))) throw new Error('Replay divergence');
  return { ...session, events, snapshots };
}

export function exportRun(session: Session): string {
  return JSON.stringify({ schemaVersion: '1', scenarioId: session.scenarioId, contentVersion: session.contentVersion, mode: session.mode, guidedStep: session.guidedStep, events: session.events });
}

/** Import only typed, bounded events; snapshots are always recomputed from the trusted content. */
export function importRun(content: Content, json: string): Session {
  if (json.length > 64_000) throw new Error('Run exceeds size limit');
  let data: unknown;
  try { data = JSON.parse(json); } catch { throw new Error('Invalid run JSON'); }
  if (!data || typeof data !== 'object') throw new Error('Invalid run format');
  const value = data as Record<string, unknown>;
  if (value.schemaVersion !== '1' || value.scenarioId !== content.scenarioId || value.contentVersion !== content.contentVersion) throw new Error('Run version mismatch');
  if (value.mode !== 'guided' && value.mode !== 'experiment') throw new Error('Invalid run mode');
  if (value.guidedStep !== 'briefing' && value.guidedStep !== 'library' && value.guidedStep !== 'service-counter') throw new Error('Invalid guided step');
  if (!Array.isArray(value.events) || value.events.length > 100) throw new Error('Invalid run event count');
  const events: Event[] = [];
  for (const item of value.events) {
    if (!item || typeof item !== 'object' || !eventTypes.includes(item.type)) throw new Error('Invalid run event');
    const event = item as Event;
    const key = ({ REMOVE_CONTEXT_PASSAGE: 'passageId', REMOVE_DOCUMENT_FROM_CONTEXT: 'documentId', RESTORE_CONTEXT: null, SET_RETRIEVAL_STRATEGY: 'strategyId', SET_ROLE: 'roleId', CHECK_TUESDAY_SLOTS: 'fixtureId', CHECK_SATURDAY_SLOTS: 'fixtureId', PROPOSE_SLOT: 'slot', REQUEST_PASSAGE: 'passageId' } as const)[event.type];
    const properties = Object.keys(item);
    if (properties.length !== (key ? 2 : 1) || properties.some(p => p !== 'type' && p !== key) || key && (typeof (item as Record<string, unknown>)[key] !== 'string' || !(item as Record<string, string>)[key])) throw new Error('Invalid run event payload');
    events.push(event);
  }
  let session: Session = { ...createSession(content), mode: value.mode, guidedStep: value.guidedStep };
  for (const event of events) session = dispatch(content, session, event);
  return session;
}
