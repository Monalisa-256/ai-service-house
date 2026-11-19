import test from 'node:test';
import assert from 'node:assert/strict';
import { briefingBeats, briefingContent, briefingSnapshot, briefingStep } from '../src/briefing-lesson.ts';
import { checkCitation, inspectPassage } from '../src/scenario.ts';

test('five guided beats preserve the case while removing only selected context', () => {
  assert.equal(briefingBeats.length, 5);
  assert.equal(new Set(briefingBeats.map(beat => beat.id)).size, 5);
  for (let step = 1; step <= 5; step++) {
    const state = briefingSnapshot(step);
    assert.equal(state.bookingStatus, 'not_booked');
    assert.ok(state.retrievalIds.includes('p-notice-1'));
    assert.ok(inspectPassage(briefingContent, state, 'p-notice-1'));
    assert.equal(state.contextIds.includes('p-notice-1'), step < 4);
    assert.equal(state.appointmentStatus, step < 4 ? 'suspended' : 'unverified');
    assert.equal(checkCitation(briefingContent, state, 'appointment-status', 'p-notice-1').supported, step < 4);
  }
  assert.equal(briefingSnapshot(4).contextIds.includes('p-notice-2'), false);
  assert.equal(briefingSnapshot(5).answer.bookingStatus, 'not_booked');
  assert.equal(briefingStep(0), 1);
  assert.equal(briefingStep(50), 5);
  assert.equal(briefingStep(Number.NaN), 1);
});
