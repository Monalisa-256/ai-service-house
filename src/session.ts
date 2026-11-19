import { initialState, replay, transition, type Content, type Event, type State } from './scenario.ts';

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
  briefing: ['REMOVE_CONTEXT_PASSAGE', 'RESTORE_CONTEXT'],
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
  if (session.mode === 'guided' && !guidedAllowed[session.guidedStep].includes(event.type)) throw new Error(`Event ${event.type} is unavailable in guided ${session.guidedStep}`);
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
