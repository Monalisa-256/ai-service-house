import publicCase from '../content/saturday-public.json' with { type: 'json' };
import { initialState, transition, type Content } from './scenario.ts';

export const briefingContent = publicCase as Content;
export type BriefingBeat = {
  id: string; title: string; kind: 'problem' | 'mechanism' | 'failure' | 'check';
  explanation: string; keyIdea: string; changed: string[]; focus: 'question' | 'brief' | 'context' | 'removal' | 'answer';
};
export const briefingBeats: readonly BriefingBeat[] = [
  { id: 'receive-question', title: 'Receive the question', kind: 'problem', focus: 'question', explanation: 'A visitor asks if they can come on Saturday for application help. “Come” could mean general reception information or an appointment with a service worker. The answer has to address both meanings.', keyIdea: 'A useful answer begins by separating the visitor’s intent from the service rules.', changed: ['Question received', 'Two meanings identified'] },
  { id: 'set-task', title: 'Set the task boundary', kind: 'mechanism', focus: 'brief', explanation: 'The application instructs the assistant to use current public sources, distinguish reception from appointment availability, and avoid claiming a booking from a checked slot. A page may supply facts, but it cannot rewrite this task.', keyIdea: 'Instructions, user requests, and retrieved records have different authority.', changed: ['Public-information task selected', 'Source text remains evidence, not an instruction'] },
  { id: 'assemble-context', title: 'Assemble the evidence', kind: 'mechanism', focus: 'context', explanation: 'The current notice and opening-hours passages reach the answer step. The notice says application-help appointments are suspended on 21 November. Reception remains open for general information.', keyIdea: 'The answer can use selected passages. A record in storage is not automatically in context.', changed: ['Current notice enters context', 'Saturday suspension has direct support'] },
  { id: 'remove-notice', title: 'Remove the decisive notice', kind: 'failure', focus: 'removal', explanation: 'Remove the current notice from this answer’s selected context. It still exists on the records shelf and in retrieval candidates. Without it in context, Saturday application-help availability becomes unverified.', keyIdea: 'Missing evidence does not prove appointments are available or unavailable.', changed: ['Context: −p-notice-1 and −p-notice-2', 'Appointment status: suspended → unverified'] },
  { id: 'compare-answer', title: 'Explain the difference', kind: 'check', focus: 'answer', explanation: 'Compare the two answers. Reception hours can still be supported, but opening hours do not establish application-help availability. Neither answer makes a booking.', keyIdea: 'Claim support belongs to the specific selected passage and completed action.', changed: ['Reception: still open for general information', 'Application-help status: unverified from this context', 'Booking: not booked'] }
] as const;

export function briefingSnapshot(step: number) {
  const reference = initialState(briefingContent);
  return step >= 4 ? transition(briefingContent, reference, { type: 'REMOVE_DOCUMENT_FROM_CONTEXT', documentId: 'doc-notice-v2' }) : reference;
}
export const briefingStep = (value: number) => Number.isInteger(value) ? Math.min(5, Math.max(1, value)) : 1;
