import type { State } from './scenario.ts';
export type SceneRoom = 'briefing' | 'library' | 'service-counter';
export type SceneCue = { id: string; clip: string; duration: number; description: string };
const clips: Record<SceneRoom, Record<string, SceneCue>> = {
  briefing: { notice_removed: { id: 'notice_removed', clip: 'RemoveNotice', duration: 41/24, description: 'The worker moves the notice card out of the selected tray.' } },
  library: { search_narrowed: { id: 'search_narrowed', clip: 'SearchNarrow', duration: 41/24, description: 'The search table changes to the narrow candidate set.' } },
  'service-counter': { calendar_timeout: { id: 'calendar_timeout', clip: 'CalendarTimeout', duration: 41/24, description: 'The calendar terminal returns no fresh result.' } }
};
export function sceneCue(room: SceneRoom, state: State): SceneCue | null {
  return state.cueIds.map(id => clips[room][id]).find(Boolean) ?? null;
}
export const briefingPreviews: SceneCue[] = [
  { id: 'preview_receive', clip: 'ReceiveQuestion', duration: 41/24, description: 'Preview: the worker receives the visitor’s question card. Case facts do not change.' },
  { id: 'preview_place', clip: 'PlaceNotice', duration: 41/24, description: 'Preview: the worker places a notice card. Case facts do not change.' }
];
export const sceneAssets: Record<SceneRoom, string> = {
  briefing: '/models/briefing.glb', library: '/models/library.glb', 'service-counter': '/models/service-counter.glb'
};
