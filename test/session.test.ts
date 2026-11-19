import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../src/scenario.ts';
import { createSession, current, dispatch, enterGuidedStep, forkExperiment, restore, snapshotAt } from '../src/session.ts';

const content = loadContent();
test('guided beat allows one domain of intervention and resets to a known fixture', () => {
  const baseline = createSession(content);
  assert.throws(() => dispatch(content, baseline, { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-ok' }));
  const changed = dispatch(content, baseline, { type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' });
  assert.equal(current(changed).appointmentStatus, 'unverified');
  assert.equal(current(baseline).appointmentStatus, 'suspended');
  const library = enterGuidedStep(content, changed, 'library');
  assert.equal(current(library).appointmentStatus, 'suspended');
  assert.equal(library.events.length, 0);
  assert.equal(current(dispatch(content, library, { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'hours-only' })).appointmentStatus, 'unverified');
});

test('experiment fork combines changes without mutating guided run; restore replays', () => {
  const guided = dispatch(content, createSession(content), { type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' });
  const fork = forkExperiment(content, guided);
  const combined = dispatch(content, fork, { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-timeout' });
  assert.equal(current(combined).tool.status, 'timeout');
  assert.equal(current(guided).tool.status, 'none');
  assert.equal(snapshotAt(combined, 0).appointmentStatus, 'suspended');
  assert.deepEqual(current(restore(content, combined, 1)), current(guided));
  assert.throws(() => snapshotAt(combined, 99));
});
