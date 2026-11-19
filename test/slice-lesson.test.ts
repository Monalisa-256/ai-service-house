import test from 'node:test';
import assert from 'node:assert/strict';
import { sliceScripts, sliceSnapshot, sliceStep } from '../src/slice-lesson.ts';

test('visual lessons retain exact candidate and tool boundaries', () => {
  assert.equal(sliceStep(Number.NaN),1);
  assert.equal(sliceStep(99),5);
  assert.equal(sliceScripts.library.beats.length,5);
  assert.equal(sliceScripts['service-counter'].beats.length,5);
  const before=sliceSnapshot('library',2);
  const miss=sliceSnapshot('library',3);
  const rerank=sliceSnapshot('library',4);
  const restored=sliceSnapshot('library',5);
  assert.ok(before.retrievalIds.includes('p-notice-1'));
  assert.ok(!miss.retrievalIds.includes('p-notice-1'));
  assert.deepEqual(miss.retrievalIds,rerank.retrievalIds);
  assert.ok(restored.retrievalIds.includes('p-notice-1'));
  assert.equal(miss.appointmentStatus,'unverified');
  const lookup=sliceSnapshot('service-counter',2);
  const proposal=sliceSnapshot('service-counter',3);
  const timeout=sliceSnapshot('service-counter',4);
  assert.equal(lookup.tool.status,'ok');
  assert.equal(lookup.tool.slots.length,2);
  assert.ok(proposal.tool.proposedSlot);
  assert.equal(timeout.tool.status,'timeout');
  assert.equal(timeout.tool.proposedSlot,null);
  for(const room of ['library','service-counter'] as const) for(let step=1;step<=5;step++) assert.equal(sliceSnapshot(room,step).bookingStatus,'not_booked');
});
