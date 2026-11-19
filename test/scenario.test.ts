import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, initialState, transition, replay, eligible, type Event } from '../src/scenario.ts';
import { validate } from '../src/validate.ts';

const content = loadContent();
test('content and canonical claims are valid and supported', () => {
  assert.deepEqual(validate(content), []);
  const state = initialState(content);
  assert.equal(state.appointmentStatus, 'suspended');
  assert.equal(state.bookingStatus, 'not_booked');
  assert.deepEqual(state.claims[1].passageIds, ['p-notice-1']);
  assert.ok(state.claims.every(c => c.status === 'supported'));
});

test('removing context does not retire the notice', () => {
  const state = transition(content, initialState(content), { type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' });
  assert.equal(state.appointmentStatus, 'unverified');
  assert.ok(state.retrievalIds.includes('p-notice-1'));
  assert.ok(!state.contextIds.includes('p-notice-1'));
  assert.equal(state.claims[1].status, 'unverified');
  assert.deepEqual(state.explanationIds, ['notice_removed']);
});

test('narrow retrieval cannot rerank a missing notice; stale source remains ineligible', () => {
  const state = transition(content, initialState(content), { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'hours-only' });
  assert.equal(state.appointmentStatus, 'unverified');
  assert.ok(!state.retrievalIds.includes('p-notice-1'));
  assert.deepEqual(state.explanationIds, ['retrieval_miss']);
  const stale = transition(content, state, { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'stale-index' });
  assert.ok(!stale.retrievalIds.includes('p-old-1'));
});

test('staff-only content is blocked for public, including explicit request', () => {
  assert.equal(eligible(content, 'p-rota-1', 'public'), false);
  const state = transition(content, initialState(content), { type: 'REQUEST_PASSAGE', passageId: 'p-rota-1' });
  assert.ok(state.explanationIds.includes('access_denied'));
  assert.ok(!state.contextIds.includes('p-rota-1'));
  assert.equal(eligible(content, 'p-rota-1', 'staff'), true);
});

test('slot lookup, proposal, and timeout never become a booking', () => {
  const ok = transition(content, initialState(content), { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-ok' });
  assert.equal(ok.tool.slots.length, 2);
  const proposed = transition(content, ok, { type: 'PROPOSE_SLOT', slot: ok.tool.slots[0] });
  assert.equal(proposed.tool.proposedSlot, ok.tool.slots[0]);
  assert.equal(proposed.bookingStatus, 'not_booked');
  const timeout = transition(content, proposed, { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-timeout' });
  assert.deepEqual(timeout.tool.slots, []);
  assert.equal(timeout.tool.proposedSlot, null);
  assert.equal(timeout.bookingStatus, 'not_booked');
  assert.throws(() => transition(content, timeout, { type: 'PROPOSE_SLOT', slot: ok.tool.slots[0] }));
});

test('event replay is deterministic and rejects unknown inputs', () => {
  const events: Event[] = [{ type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' }, { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-ok' }];
  assert.deepEqual(replay(content, events), events.reduce((s, e) => transition(content, s, e), initialState(content)));
  assert.throws(() => transition(content, initialState(content), { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'missing' }));
});
