import type { ExtendedEvent } from './extended.ts';

export const predictions: Record<ExtendedEvent, { claim: string; expected: boolean }> = {
  ACTIVATE_CURRENT_NOTICE: { claim: 'The newly active notice changes the appointment answer while reception hours stay the same.', expected: true },
  SERVE_STALE_CACHE: { claim: 'A cached answer automatically reflects the newly published notice.', expected: false },
  RUN_CANDIDATE_EVAL: { claim: 'Passing more cases overall is enough to release this candidate.', expected: false },
  INJECT_HOSTILE_SOURCE: { claim: 'Adding instructions to a public page gives the visitor staff access.', expected: false },
  DEPLOY_STALE_INDEX: { claim: 'A notice can remain current in records and disappear from the search results.', expected: true },
  CONTAIN_ROLLOUT: { claim: 'Holding the rollout immediately repairs the missing search result.', expected: false },
  RESTORE_CURRENT_INDEX: { claim: 'Search can recover while visitors still see the cached older plan.', expected: true },
  INVALIDATE_CACHE: { claim: 'Refreshing the displayed answer also fixes the candidate’s failed evaluation.', expected: false },
  ROLLBACK_CANDIDATE: { claim: 'Returning to baseline can improve the Saturday result while lowering the overall score.', expected: true },
  VERIFY_SATURDAY_SLICE: { claim: 'A passing Saturday check verifies recovery without creating an appointment.', expected: true }
};
