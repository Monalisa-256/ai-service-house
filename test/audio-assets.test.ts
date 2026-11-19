import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { briefingBeats } from '../src/briefing-lesson.ts';
import extended from '../content/extended.json' with { type:'json' };
import slice from '../content/slice-lessons.json' with { type:'json' };

test('all twenty prerecorded tracks are nonempty MP3s for the exact visible scripts',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../assets/audio-manifest.json',import.meta.url),'utf8'));
  const scripts=Object.fromEntries([
    ...briefingBeats.map((beat,index)=>[`briefing-${index+1}`,beat.narration]),
    ...extended.rooms.map(room=>[room.id,room.narration]),
    ...Object.entries(slice).flatMap(([room,lesson])=>lesson.beats.map((beat,index)=>[`${room}-${index+1}`,beat.narration]))
  ]);
  assert.equal(Object.keys(manifest.tracks).length,20);
  for(const [name,script] of Object.entries(scripts)) {
    const info=manifest.tracks[name];assert.ok(info);
    const bytes=readFileSync(new URL(`../public${info.file}`,import.meta.url));
    assert.ok(bytes.length>1000);
    assert.equal(bytes.subarray(0,3).toString(),'ID3');
    assert.equal(createHash('sha256').update(bytes).digest('hex'),info.sha256);
    assert.equal(createHash('sha256').update(script as string).digest('hex'),info.scriptSha256);
  }
});
