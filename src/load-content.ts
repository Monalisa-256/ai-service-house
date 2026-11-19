import { readFileSync } from 'node:fs';
import type { Content } from './scenario.ts';

export function loadContent(path = new URL('../content/saturday.json', import.meta.url)): Content {
  return JSON.parse(readFileSync(path, 'utf8')) as Content;
}
