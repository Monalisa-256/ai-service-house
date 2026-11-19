/** Authored Phase 5 cross-room rules. Independent from display or animation. */
export type ExtendedEvent = 'ACTIVATE_CURRENT_NOTICE' | 'SERVE_STALE_CACHE' | 'INVALIDATE_CACHE' | 'RUN_CANDIDATE_EVAL' | 'ROLLBACK_CANDIDATE' | 'INJECT_HOSTILE_SOURCE' | 'DEPLOY_STALE_INDEX' | 'CONTAIN_ROLLOUT' | 'RESTORE_CURRENT_INDEX' | 'VERIFY_SATURDAY_SLICE';
export type ExtendedState = { sourceVersion: 'v1'|'v2'; indexVersion: 'current'|'stale'; cacheVersion: 'v1'|'v2'; evaluation: 'baseline'|'candidate'; hostile: boolean; rollout: 'active'|'held'; recoveryVerified: boolean; events: ExtendedEvent[] };
export function initialExtended(): ExtendedState { return { sourceVersion: 'v2', indexVersion: 'current', cacheVersion: 'v2', evaluation: 'baseline', hostile: false, rollout: 'active', recoveryVerified: false, events: [] }; }
export function initialExtendedForRoom(room: 'records'|'workshop'|'test-room'|'security'|'operations'): ExtendedState {
  return room === 'records' ? { ...initialExtended(), sourceVersion: 'v1' } : initialExtended();
}
export function extendedTransition(state: ExtendedState, event: ExtendedEvent): ExtendedState {
  if (!['ACTIVATE_CURRENT_NOTICE','SERVE_STALE_CACHE','INVALIDATE_CACHE','RUN_CANDIDATE_EVAL','ROLLBACK_CANDIDATE','INJECT_HOSTILE_SOURCE','DEPLOY_STALE_INDEX','CONTAIN_ROLLOUT','RESTORE_CURRENT_INDEX','VERIFY_SATURDAY_SLICE'].includes(event)) throw new Error('Unsupported extended event');
  if (event === 'VERIFY_SATURDAY_SLICE' && (state.sourceVersion !== 'v2' || state.indexVersion !== 'current' || state.cacheVersion !== 'v2' || state.evaluation === 'candidate')) throw new Error('Cannot verify recovery while the source, index, cache, or critical evaluation remains faulty');
  const next = { ...state, events: [...state.events,event] };
  if (event !== 'VERIFY_SATURDAY_SLICE') next.recoveryVerified = false;
  switch(event) {
    case 'ACTIVATE_CURRENT_NOTICE': next.sourceVersion='v2'; break;
    case 'SERVE_STALE_CACHE': next.cacheVersion='v1'; break;
    case 'INVALIDATE_CACHE': next.cacheVersion='v2'; break;
    case 'RUN_CANDIDATE_EVAL': next.evaluation='candidate'; break;
    case 'ROLLBACK_CANDIDATE': next.evaluation='baseline'; break;
    case 'INJECT_HOSTILE_SOURCE': next.hostile=true; break;
    case 'DEPLOY_STALE_INDEX': next.indexVersion='stale'; break;
    case 'CONTAIN_ROLLOUT': next.rollout='held'; break;
    case 'RESTORE_CURRENT_INDEX': next.indexVersion='current'; break;
    case 'VERIFY_SATURDAY_SLICE': next.recoveryVerified=true; break;
  }
  return next;
}
export function deriveExtended(state: ExtendedState) {
  const candidateNotice = state.sourceVersion === 'v2' && state.indexVersion === 'current';
  const appointmentStatus = candidateNotice ? 'suspended' : 'unverified';
  const staleDisplay = state.cacheVersion === 'v1';
  const displayedAnswer = staleDisplay ? 'stale_older_plan' : appointmentStatus;
  const evalResult = state.evaluation === 'candidate' ? { passed: 4, total: 5, criticalSaturday: false, release: 'hold' } as const : { passed: 3, total: 5, criticalSaturday: true, release: 'review' } as const;
  const explanation = [
    candidateNotice ? 'Current notice is a retrieved candidate.' : 'The current notice is absent from the deployed candidate set.',
    staleDisplay ? 'A v1 cached answer masks current evidence.' : 'The displayed answer follows the current evidence.',
    state.hostile ? 'External instruction attempted staff access; public permission denied.' : 'No hostile source injected.',
    state.indexVersion === 'stale' ? 'Affected Saturday slice alert: restore the current index and verify recovery.' : 'Current index available.'
  ];
  return { candidateNotice, appointmentStatus, displayedAnswer, cacheStale: staleDisplay, bookingStatus: 'not_booked' as const, staffAccess: 'denied' as const, evalResult, alert: state.indexVersion === 'stale', rollout: state.rollout, recoveryVerified: state.recoveryVerified, explanation };
}
export function replayExtended(events: ExtendedEvent[]) { return events.reduce(extendedTransition,initialExtended()); }
