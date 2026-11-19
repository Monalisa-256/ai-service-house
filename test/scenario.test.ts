import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, initialState, transition, replay, eligible, checkCitation, inspectPassage, type Event } from '../src/scenario.ts';
import { validate } from '../src/validate.ts';

const content = loadContent();
test('content and canonical claims are valid and supported', () => {
  assert.deepEqual(validate(content), []);
  const state = initialState(content);
  assert.equal(state.appointmentStatus, 'suspended');
  assert.equal(state.bookingStatus, 'not_booked');
  assert.deepEqual(state.claims.find(c => c.id === 'appointment-status')?.passageIds, ['p-notice-1']);
  assert.ok(state.claims.every(c => c.status === 'supported'));
  assert.equal(state.answer.bookingStatus, 'not_booked');
  assert.match(state.answer.text, /suspended that day/);
});

test('removing context does not retire the notice', () => {
  const state = transition(content, initialState(content), { type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' });
  assert.equal(state.appointmentStatus, 'unverified');
  assert.ok(state.retrievalIds.includes('p-notice-1'));
  assert.ok(!state.contextIds.includes('p-notice-1'));
  assert.equal(state.claims.find(c => c.id === 'appointment-status')?.status, 'unverified');
  assert.deepEqual(state.explanationIds, ['notice_removed']);
});

test('removing the document clears all its selected passages but preserves the public walk-in distinction', () => {
  const state = transition(content, initialState(content), { type: 'REMOVE_DOCUMENT_FROM_CONTEXT', documentId: 'doc-notice-v2' });
  assert.ok(!state.contextIds.includes('p-notice-1'));
  assert.ok(!state.contextIds.includes('p-notice-2'));
  assert.ok(state.retrievalIds.includes('p-notice-1'));
  assert.equal(state.appointmentStatus, 'unverified');
  assert.deepEqual(state.claims.find(c => c.id === 'general-information')?.passageIds, ['p-hours-3']);
  assert.match(state.answer.text, /You can come for general information/);
  assert.match(state.answer.text, /cannot confirm application-help appointment availability/);
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
  assert.equal(inspectPassage(content, state, 'p-rota-1'), null);
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
  assert.match(timeout.answer.text, /could not verify Tuesday slots/);
  assert.throws(() => transition(content, timeout, { type: 'PROPOSE_SLOT', slot: ok.tool.slots[0] }));
});

test('citations require an eligible, selected, claim-matching passage', () => {
  const state = initialState(content);
  assert.deepEqual(checkCitation(content, state, 'appointment-status', 'p-notice-1').reason, 'supports_claim');
  assert.deepEqual(checkCitation(content, state, 'appointment-status', 'p-hours-1').reason, 'wrong_topic');
  assert.deepEqual(checkCitation(content, state, 'appointment-status', 'p-rota-1').reason, 'not_eligible');
  const removed = transition(content, state, { type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' });
  assert.deepEqual(checkCitation(content, removed, 'appointment-status', 'p-notice-1').reason, 'not_in_context');
  assert.equal(inspectPassage(content, state, 'p-notice-1')?.published, '2026-11-18');
});

test('source paragraphs are exact excerpts and validation catches content corruption', () => {
  const broken = structuredClone(content);
  broken.passages.find(p => p.id === 'p-notice-1')!.text = 'invented claim';
  assert.ok(validate(broken).some(e => e.includes('does not occur verbatim')));
  broken.passages.find(p => p.id === 'p-notice-1')!.text = content.passages.find(p => p.id === 'p-notice-1')!.text;
  broken.documents.find(d => d.id === 'doc-notice-v2')!.effectiveTo = '2026-11-20';
  assert.equal(eligible(broken, 'p-notice-1', 'public'), false);
  assert.deepEqual(validate({} as typeof content), ['Missing or invalid top-level content collections']);
});

test('event replay is deterministic and rejects unknown inputs', () => {
  const events: Event[] = [{ type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' }, { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-ok' }];
  assert.deepEqual(replay(content, events), events.reduce((s, e) => transition(content, s, e), initialState(content)));
  assert.throws(() => transition(content, initialState(content), { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'missing' }));
});

test('all supported short intervention combinations preserve evidence and booking invariants', () => {
  const choices: Event[] = [
    { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'hours-only' },
    { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'current-hybrid' },
    { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-ok' },
    { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-timeout' },
    { type: 'SET_ROLE', roleId: 'staff' },
    { type: 'SET_ROLE', roleId: 'public' }
  ];
  for (const a of choices) for (const b of choices) for (const c of choices) {
    const state = replay(content, [a, b, c]);
    assert.equal(state.bookingStatus, 'not_booked');
    assert.equal(state.answer.bookingStatus, 'not_booked');
    for (const claim of state.claims) for (const passageId of claim.passageIds) {
      assert.ok(state.contextIds.includes(passageId));
      assert.ok(eligible(content, passageId, state.roleId));
      assert.equal(checkCitation(content, state, claim.id, passageId).supported, true);
    }
    if (state.tool.status !== 'ok') assert.equal(state.tool.proposedSlot, null);
  }
});
