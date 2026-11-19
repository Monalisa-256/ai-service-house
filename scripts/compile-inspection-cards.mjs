import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const input = readFileSync(join(root, 'docs/PHASE_5_INSPECTION_MATRIX.md'), 'utf8');
const rooms = new Map([
  ['Briefing desk', 'briefing'], ['Reference library', 'library'], ['Service counter', 'service-counter'],
  ['Records room', 'records'], ['Experience workshop', 'workshop'], ['Test room', 'test-room'],
  ['Security checkpoint', 'security'], ['Operations room', 'operations']
]);
const cards = {};
let room = null;
for (const line of input.split('\n')) {
  if (line.startsWith('## ')) {
    room = [...rooms].find(([heading]) => line.startsWith(`## ${heading}`))?.[1] ?? null;
    if (room) cards[room] = [];
    continue;
  }
  if (!room || !line.startsWith('|') || /^\|\s*(Subtopic|---)/.test(line)) continue;
  const fields = line.split('|').slice(1, -1).map(value => value.trim());
  if (fields.length !== 3 || fields.some(value => !value)) throw new Error(`Incomplete inspection card: ${room}: ${line}`);
  const [topic, intervention, observation] = fields;
  cards[room].push({ topic, intervention, observation });
}
if (Object.keys(cards).length !== 8 || Object.values(cards).some(group => group.length < 7)) throw new Error('Expected complete eight-room inspection coverage');
const output = `${JSON.stringify({ schemaVersion: '1', source: 'docs/PHASE_5_INSPECTION_MATRIX.md', rooms: cards }, null, 2)}\n`;
const target = join(root, 'content/inspection-cards.json');
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Inspection cards are out of date. Run npm run sync:inspection');
  console.log('Eight-room inspection cards match the authored matrix.');
} else { writeFileSync(target, output); console.log('Generated eight-room inspection cards.'); }
