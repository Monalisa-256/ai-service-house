import { loadContent, initialState, transition, explain, type State, type Event } from './scenario.ts';

const content = loadContent();
let state = initialState(content);
function print(label: string, current: State): void {
  console.log(JSON.stringify({ label, role: current.roleId, retrieval: current.retrievalIds, context: current.contextIds, appointment: current.appointmentStatus, booking: current.bookingStatus, tool: current.tool, claims: current.claims, explanation: explain(content, current) }, null, 2));
}
print('baseline', state);
for (const event of [
  { type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' },
  { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'hours-only' },
  { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-ok' },
  { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-timeout' }
] as Event[]) {
  state = transition(content, state, event);
  print(event.type, state);
}
