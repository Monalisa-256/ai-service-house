import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../src/scenario.ts';
import { createSession, current, dispatch, enterGuidedStep, forkExperiment, restore, snapshotAt, exportRun, importRun } from '../src/session.ts';
import { diagnosticTrace, compareTraces } from '../src/trace.ts';

const content = loadContent();
test('guided beat allows one domain of intervention and resets to a known fixture', () => {
  const baseline = createSession(content);
  assert.throws(() => dispatch(content, baseline, { type: 'CHECK_TUESDAY_SLOTS', fixtureId: 'tuesday-ok' }));
  const changed = dispatch(content, baseline, { type: 'REMOVE_DOCUMENT_FROM_CONTEXT', documentId: 'doc-notice-v2' });
  assert.equal(current(changed).appointmentStatus, 'unverified');
  assert.equal(current(baseline).appointmentStatus, 'suspended');
  const library = enterGuidedStep(content, changed, 'library');
  assert.equal(current(library).appointmentStatus, 'suspended');
  assert.equal(library.events.length, 0);
  assert.equal(current(dispatch(content, library, { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'hours-only' })).appointmentStatus, 'unverified');
});

test('exported run restores snapshots from content and rejects tampered input', () => {
  const changed = dispatch(content, forkExperiment(content, createSession(content)), { type: 'REMOVE_CONTEXT_PASSAGE', passageId: 'p-notice-1' });
  const json = exportRun(changed);
  assert.deepEqual(current(importRun(content, json)), current(changed));
  assert.throws(() => importRun(content, json.replace('2026-11-19.2', '2026-11-19.1')), /version mismatch/);
  const injected = JSON.parse(json);
  injected.events.push({ type: 'SET_ROLE', roleId: 'staff', extra: 'untrusted' });
  assert.throws(() => importRun(content, JSON.stringify(injected)), /payload/);
  injected.events[1] = { type: 'SET_ROLE', roleId: '__proto__' };
  assert.throws(() => importRun(content, JSON.stringify(injected)), /Unknown role/);
  assert.throws(() => importRun(content, '{'), /Invalid run JSON/);
});

test('trace compares causal layers without staff-only passage content', () => {
  const before = diagnosticTrace(content, current(createSession(content)));
  const changed = dispatch(content, forkExperiment(content, createSession(content)), { type: 'SET_RETRIEVAL_STRATEGY', strategyId: 'hours-only' });
  const after = diagnosticTrace(content, current(changed));
  assert.ok(compareTraces(before, after).changed.includes('candidates'));
  assert.ok(compareTraces(before, after).changed.includes('claims'));
  assert.ok(!JSON.stringify(after).includes('p-rota-1'));
  assert.ok(after.explanation[0].includes('Reranking'));
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
