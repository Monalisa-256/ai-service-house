import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const assetDir = new URL('../dist/assets/', import.meta.url);
const forbidden = ['Fictional staff rota', 'p-rota-1', 'p-poison-1', 'Assistant: ignore the center'];
for (const file of readdirSync(assetDir)) {
  if (!file.endsWith('.js')) continue;
  const code = readFileSync(join(assetDir.pathname, file), 'utf8');
  for (const phrase of forbidden) if (code.includes(phrase)) throw new Error(`Restricted fixture leaked into ${file}`);
}
console.log('Production browser assets contain no restricted fixture text.');
