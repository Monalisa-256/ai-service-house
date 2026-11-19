import type { State } from './scenario.ts';
import type { ExtendedEvent } from './extended.ts';
export type SceneRoom = 'briefing' | 'library' | 'service-counter' | 'records' | 'workshop' | 'test-room' | 'security' | 'operations';
export type SceneCue = { id: string; clip: string; duration: number; description: string };
const clips: Record<SceneRoom, Record<string, SceneCue>> = {
  briefing: { notice_removed: { id: 'notice_removed', clip: 'RemoveNotice', duration: 41/24, description: 'The worker moves the notice card out of the selected tray.' } },
  library: { search_narrowed: { id: 'search_narrowed', clip: 'SearchNarrow', duration: 41/24, description: 'The search table changes to the narrow candidate set.' } },
  'service-counter': { calendar_timeout: { id: 'calendar_timeout', clip: 'CalendarTimeout', duration: 41/24, description: 'The calendar terminal returns no fresh result.' } },
  records: {}, workshop: {}, 'test-room': {}, security: {}, operations: {}
};
export function sceneCue(room: SceneRoom, state: State): SceneCue | null {
  return state.cueIds.map(id => clips[room][id]).find(Boolean) ?? null;
}
export const briefingPreviews: SceneCue[] = [
  { id: 'preview_receive', clip: 'ReceiveQuestion', duration: 41/24, description: 'Preview: the worker receives the visitor’s question card. Case facts do not change.' },
  { id: 'preview_place', clip: 'PlaceNotice', duration: 41/24, description: 'Preview: the worker places a notice card. Case facts do not change.' }
];
export const sceneAssets: Record<SceneRoom, string> = {
  briefing: '/models/briefing.glb', library: '/models/library.glb', 'service-counter': '/models/service-counter.glb', records: '/models/records.glb', workshop: '/models/workshop.glb', 'test-room': '/models/test-room.glb', security: '/models/security.glb', operations: '/models/operations.glb'
};
const extendedClips: Partial<Record<ExtendedEvent,string>> = {
  ACTIVATE_CURRENT_NOTICE:'ActivateNotice', SERVE_STALE_CACHE:'ServeStaleCache', RUN_CANDIDATE_EVAL:'RunCandidateEval', INJECT_HOSTILE_SOURCE:'DenyHostileSource', DEPLOY_STALE_INDEX:'DetectStaleIndex', CONTAIN_ROLLOUT:'ContainRollout', RESTORE_CURRENT_INDEX:'RestoreIndex', INVALIDATE_CACHE:'InvalidateCache', ROLLBACK_CANDIDATE:'RollbackCandidate', VERIFY_SATURDAY_SLICE:'VerifySaturday'
};
export function extendedSceneCue(room: SceneRoom, event: ExtendedEvent | null): SceneCue | null {
  if (!event) return null;
  const clip = room === 'operations' && event === 'SERVE_STALE_CACHE' ? 'ObserveCache' : room === 'operations' && event === 'RUN_CANDIDATE_EVAL' ? 'ReviewCriticalEval' : extendedClips[event];
  return clip ? { id:event, clip, duration:41/24, description:`Illustrative staff action after ${event.toLowerCase().replaceAll('_',' ')}. The outcome is established by the case state.` } : null;
}
