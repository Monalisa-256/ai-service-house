import type { State } from './scenario.ts';
import { sceneCue, type SceneRoom } from './scene-cues.ts';
/** Semantic facts shared by the 2D process and optional 3D room. */
export function sceneView(room: SceneRoom, state: State) {
  return {
    room,
    noticeCandidate: state.retrievalIds.includes('p-notice-1'),
    noticeInContext: state.contextIds.includes('p-notice-1'),
    candidateIds: [...state.retrievalIds],
    appointmentStatus: state.appointmentStatus,
    toolStatus: state.tool.status,
    proposalVisible: !!state.tool.proposedSlot,
    bookingStatus: state.bookingStatus,
    cue: sceneCue(room,state)
  };
}
export type SceneView = ReturnType<typeof sceneView>;
