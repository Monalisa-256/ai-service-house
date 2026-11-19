import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialExtended, initialExtendedForRoom, extendedTransition, deriveExtended, replayExtended, type ExtendedEvent } from '../src/extended.ts';
const data = JSON.parse(readFileSync(new URL('../content/extended.json', import.meta.url),'utf8'));
test('five authored rooms have inspectable core beats and assessment', () => {
  assert.deepEqual(data.rooms.map((r: {id:string})=>r.id), ['records','workshop','test-room','security','operations']);
  for (const room of data.rooms) {
    assert.ok(room.core.question && room.core.reference && room.core.action && room.core.result && room.core.cause);
    assert.ok(room.humanAction && room.equivalent2D && room.narration && room.caption);
    assert.equal(room.assessment.options.length,2);
    assert.ok(room.assessment.rationale && room.optional.length>=8);
  }
  assert.equal(data.finalChallenge.rubric.reduce((n: number,r:{points:number})=>n+r.points,0),data.finalChallenge.maxPoints);
});
test('index, cache, eval and security causes combine without inventing a booking', () => {
  const events: ExtendedEvent[]=['DEPLOY_STALE_INDEX','SERVE_STALE_CACHE','RUN_CANDIDATE_EVAL','INJECT_HOSTILE_SOURCE'];
  const state=replayExtended(events), result=deriveExtended(state);
  assert.equal(result.candidateNotice,false);
  assert.equal(result.appointmentStatus,'unverified');
  assert.equal(result.displayedAnswer,'stale_older_plan');
  assert.equal(result.evalResult.passed,4);
  assert.equal(result.evalResult.criticalSaturday,false);
  assert.equal(result.evalResult.release,'hold');
  assert.equal(result.staffAccess,'denied');
  assert.equal(result.bookingStatus,'not_booked');
  assert.equal(result.alert,true);
  const restored=deriveExtended(extendedTransition(state,'RESTORE_CURRENT_INDEX'));
  assert.equal(restored.candidateNotice,true);
  assert.equal(restored.cacheStale,true); // a corrected index does not automatically invalidate the cache.
  assert.equal(restored.alert,false);
});
test('unsupported extended events reject and replay is deterministic', () => {
  const events: ExtendedEvent[]=['SERVE_STALE_CACHE','DEPLOY_STALE_INDEX'];
  assert.deepEqual(replayExtended(events), events.reduce(extendedTransition,initialExtended()));
  assert.throws(()=>extendedTransition(initialExtended(),'BOOK_VISIT' as ExtendedEvent),/Unsupported/);
});

test('records-room source update changes eligibility before retrieval', () => {
  const before=deriveExtended(initialExtendedForRoom('records'));
  assert.equal(before.candidateNotice,false);
  assert.equal(before.appointmentStatus,'unverified');
  const after=deriveExtended(extendedTransition(initialExtendedForRoom('records'),'ACTIVATE_CURRENT_NOTICE'));
  assert.equal(after.candidateNotice,true);
  assert.equal(after.appointmentStatus,'suspended');
});
