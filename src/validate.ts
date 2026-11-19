import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadContent, type Content } from './scenario.ts';

function unique(ids: string[], label: string, errors: string[]): void {
  if (new Set(ids).size !== ids.length) errors.push(`Duplicate ${label} ID`);
}
const validDate = (s: string) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

export function validate(content: Content): string[] {
  const errors: string[] = [];
  if (!content || typeof content !== 'object') return ['Content must be an object'];
  if (!Array.isArray(content.documents) || !Array.isArray(content.passages) || !Array.isArray(content.instructions) ||
      !content.roles || typeof content.roles !== 'object' || !content.strategies || typeof content.strategies !== 'object' ||
      !content.toolFixtures || typeof content.toolFixtures !== 'object' || !content.explanations || typeof content.explanations !== 'object' ||
      !content.learning || !Array.isArray(content.learning.cueIds)) return ['Missing or invalid top-level content collections'];
  if (content.schemaVersion !== '1') errors.push('Unsupported content schema');
  if (!content.scenarioId || !content.contentVersion || !content.question) errors.push('Missing scenario metadata');
  if (!validDate(content.targetDate) || Number.isNaN(Date.parse(content.fictionalNow))) errors.push('Invalid fictional date');
  if (!content.service?.center || !content.service?.timezone || !content.service?.reception || !content.service?.applicationHelp) errors.push('Missing service definition');
  if (!content.instructions?.length || content.instructions.some(i => !i.id || i.role !== 'developer' || !i.text.trim())) errors.push('Invalid task instruction');
  unique(content.instructions?.map(i => i.id) ?? [], 'instruction', errors);
  unique(content.documents.map(d => d.id), 'document', errors);
  unique(content.passages.map(p => p.id), 'passage', errors);
  const docs = new Set(content.documents.map(d => d.id));
  const passages = new Set(content.passages.map(p => p.id));
  for (const d of content.documents) {
    if (!validDate(d.published) || !validDate(d.effectiveFrom) || d.effectiveTo && !validDate(d.effectiveTo)) errors.push(`Invalid date in ${d.id}`);
    if (d.effectiveTo && d.effectiveFrom > d.effectiveTo) errors.push(`Reversed effective interval in ${d.id}`);
    if (d.supersededBy && (!docs.has(d.supersededBy) || d.status !== 'superseded')) errors.push(`Invalid supersession in ${d.id}`);
    if (!['public', 'staff', 'external'].includes(d.audience)) errors.push(`Invalid audience in ${d.id}`);
    if (!d.body?.trim()) errors.push(`Missing document body in ${d.id}`);
  }
  for (const p of content.passages) {
    const document = content.documents.find(d => d.id === p.documentId);
    if (!document || !p.text?.trim() || !document.body.includes(p.text)) errors.push(`Passage ${p.id} does not occur verbatim in its document`);
  }
  for (const [strategy, ids] of Object.entries(content.strategies)) {
    if (!Array.isArray(ids)) { errors.push(`Invalid strategy list ${strategy}`); continue; }
    unique(ids, `strategy ${strategy}`, errors);
    for (const id of ids) if (!passages.has(id)) errors.push(`Unknown ${id} in strategy ${strategy}`);
  }
  for (const id of ['current-hybrid', 'hours-only', 'stale-index']) if (!content.strategies[id]) errors.push(`Missing strategy ${id}`);
  for (const [id, fixture] of Object.entries(content.toolFixtures)) {
    if (!fixture || !Array.isArray(fixture.slots)) { errors.push(`Invalid tool fixture ${id}`); continue; }
    if (!validDate(fixture.date) || Number.isNaN(Date.parse(fixture.checkedAt))) errors.push(`Invalid tool date in ${id}`);
    if (fixture.status !== 'ok' && fixture.slots.length) errors.push(`Non-success fixture ${id} contains slots`);
    for (const slot of fixture.slots) if (Number.isNaN(Date.parse(slot))) errors.push(`Invalid slot in ${id}`);
  }
  for (const id of ['baseline', 'notice_removed', 'retrieval_miss', 'tool_ok', 'tool_timeout', 'access_denied', 'hours_missing', 'service_rule_missing', 'citation_mismatch']) if (!content.explanations[id]) errors.push(`Missing explanation ${id}`);
  for (const id of ['notice_removed', 'search_narrowed', 'slot_checked', 'calendar_timeout']) if (!content.learning.cueIds.includes(id)) errors.push(`Missing cue ${id}`);
  if (!content.roles.public?.permissions.includes('read_public') || content.roles.public.permissions.includes('read_staff')) errors.push('Invalid public role');
  if (content.strategies['current-hybrid'] && !content.strategies['current-hybrid'].includes('p-notice-1')) errors.push('Canonical strategy misses current notice');
  if (content.strategies['hours-only']?.includes('p-notice-1')) errors.push('Narrow search should miss notice');
  if (content.toolFixtures['tuesday-ok']?.status !== 'ok' || content.toolFixtures['tuesday-timeout']?.status !== 'timeout') errors.push('Missing Tuesday outcome fixtures');
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = validate(loadContent());
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Content valid: documents, passages, dates, roles, fixtures, references, and cues.');
}
