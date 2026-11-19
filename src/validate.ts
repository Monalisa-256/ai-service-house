import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadContent, type Content } from './scenario.ts';

function unique(ids: string[], label: string, errors: string[]): void {
  if (new Set(ids).size !== ids.length) errors.push(`Duplicate ${label} ID`);
}
const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

export function validate(content: Content): string[] {
  const errors: string[] = [];
  if (content.schemaVersion !== '1') errors.push('Unsupported content schema');
  if (!content.scenarioId || !content.contentVersion || !content.question) errors.push('Missing scenario metadata');
  if (!validDate(content.targetDate) || Number.isNaN(Date.parse(content.fictionalNow))) errors.push('Invalid fictional date');
  unique(content.documents.map(d => d.id), 'document', errors);
  unique(content.passages.map(p => p.id), 'passage', errors);
  const docs = new Set(content.documents.map(d => d.id));
  const passages = new Set(content.passages.map(p => p.id));
  for (const d of content.documents) {
    if (!validDate(d.published) || !validDate(d.effectiveFrom) || d.effectiveTo && !validDate(d.effectiveTo)) errors.push(`Invalid date in ${d.id}`);
    if (d.effectiveTo && d.effectiveFrom > d.effectiveTo) errors.push(`Reversed effective interval in ${d.id}`);
    if (d.supersededBy && (!docs.has(d.supersededBy) || d.status !== 'superseded')) errors.push(`Invalid supersession in ${d.id}`);
    if (!['public', 'staff', 'external'].includes(d.audience)) errors.push(`Invalid audience in ${d.id}`);
  }
  for (const p of content.passages) if (!docs.has(p.documentId) || !p.text.trim()) errors.push(`Invalid passage ${p.id}`);
  for (const [strategy, ids] of Object.entries(content.strategies)) {
    unique(ids, `strategy ${strategy}`, errors);
    for (const id of ids) if (!passages.has(id)) errors.push(`Unknown ${id} in strategy ${strategy}`);
  }
  for (const [id, fixture] of Object.entries(content.toolFixtures)) {
    if (!validDate(fixture.date) || Number.isNaN(Date.parse(fixture.checkedAt))) errors.push(`Invalid tool date in ${id}`);
    if (fixture.status !== 'ok' && fixture.slots.length) errors.push(`Non-success fixture ${id} contains slots`);
    for (const slot of fixture.slots) if (Number.isNaN(Date.parse(slot))) errors.push(`Invalid slot in ${id}`);
  }
  for (const id of ['baseline', 'notice_removed', 'retrieval_miss', 'tool_ok', 'tool_timeout', 'access_denied']) if (!content.explanations[id]) errors.push(`Missing explanation ${id}`);
  for (const id of ['notice_removed', 'search_narrowed', 'slot_checked', 'calendar_timeout']) if (!content.learning.cueIds.includes(id)) errors.push(`Missing cue ${id}`);
  if (!content.roles.public?.permissions.includes('read_public') || content.roles.public.permissions.includes('read_staff')) errors.push('Invalid public role');
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = validate(loadContent());
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Content valid: documents, passages, dates, roles, fixtures, references, and cues.');
}
