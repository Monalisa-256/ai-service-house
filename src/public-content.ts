import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Content } from './scenario.ts';

/** The browser only receives public documents and passages. This is a build-time projection. */
export function publicContent(content: Content): Content {
  const documents = content.documents.filter(document => document.audience === 'public');
  const ids = new Set(documents.map(document => document.id));
  const passages = content.passages.filter(passage => ids.has(passage.documentId));
  const passageIds = new Set(passages.map(passage => passage.id));
  const strategies = Object.fromEntries(Object.entries(content.strategies).map(([key, values]) => [key, values.filter(id => passageIds.has(id))]));
  return { ...content, documents, passages, strategies, roles: { public: content.roles.public } };
}

const full = JSON.parse(readFileSync(new URL('../content/saturday.json', import.meta.url), 'utf8')) as Content;
const expected = JSON.stringify(publicContent(full), null, 2) + '\n';
const publicPath = new URL('../content/saturday-public.json', import.meta.url);
if (process.argv.includes('--write')) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(publicPath, expected);
} else {
  const actual = readFileSync(publicPath, 'utf8');
  if (actual !== expected) throw new Error('Public content is stale or contains extra records. Run npm run sync:public.');
  if (actual.includes('Staff Rota') || actual.includes('Untrusted Hours Copy') || actual.includes('p-rota-1') || actual.includes('p-poison-1'))
    throw new Error('Restricted fixture leaked into public content');
  console.log('Public content projection verified.');
}
