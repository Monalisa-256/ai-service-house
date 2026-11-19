import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { sceneView } from '../src/scene-view.ts';
import { sceneCue } from '../src/scene-cues.ts';
import { initialState, transition } from '../src/scenario.ts';
import { loadContent } from '../src/load-content.ts';
const content=loadContent();
const manifest=JSON.parse(readFileSync(new URL('../assets/manifest.json',import.meta.url),'utf8'));
test('GLBs retain named clips, skinned human and required props after optimization',()=>{
  for (const [room, info] of Object.entries(manifest.rooms) as [string, any][]) {
    const data=readFileSync(new URL(`../public/models/${room}.glb`,import.meta.url));
    const length=data.readUInt32LE(12), gltf=JSON.parse(data.subarray(20,20+length).toString());
    assert.equal(createHash('sha256').update(data).digest('hex'),info.sha256);
    assert.ok(gltf.skins.length>=1);
    assert.deepEqual(gltf.animations.map((a:{name:string})=>a.name),info.clips);
    const nodes=new Set(gltf.nodes.map((n:{name:string})=>n.name));
    for (const name of ['ServiceWorkerRig','CurrentNoticeCard','EvidenceTray','WallClock']) assert.ok(nodes.has(name));
  }
});
test('scenario state changes immediately and cue is presentation only',()=>{
  const baseline=initialState(content);
  const changed=transition(content,baseline,{type:'REMOVE_DOCUMENT_FROM_CONTEXT',documentId:'doc-notice-v2'});
  assert.equal(changed.appointmentStatus,'unverified');
  assert.equal(baseline.appointmentStatus,'suspended');
  assert.equal(sceneCue('briefing',changed)?.clip,'RemoveNotice');
  assert.equal(sceneCue('briefing',baseline),null);
  const library=transition(content,baseline,{type:'SET_RETRIEVAL_STRATEGY',strategyId:'hours-only'});
  assert.equal(sceneCue('library',library)?.clip,'SearchNarrow');
  const timeout=transition(content,baseline,{type:'CHECK_TUESDAY_SLOTS',fixtureId:'tuesday-timeout'});
  assert.equal(sceneCue('service-counter',timeout)?.clip,'CalendarTimeout');
  assert.equal(timeout.bookingStatus,'not_booked');
});

test('shared scene view tracks evidence and proposal facts for both presentations', () => {
  const baseline=initialState(content);
  const briefing=sceneView('briefing',baseline);
  assert.equal(briefing.noticeCandidate,true);
  assert.equal(briefing.noticeInContext,true);
  const removed=sceneView('briefing',transition(content,baseline,{type:'REMOVE_DOCUMENT_FROM_CONTEXT',documentId:'doc-notice-v2'}));
  assert.equal(removed.noticeCandidate,true);
  assert.equal(removed.noticeInContext,false);
  assert.equal(removed.appointmentStatus,'unverified');
  const narrow=sceneView('library',transition(content,baseline,{type:'SET_RETRIEVAL_STRATEGY',strategyId:'hours-only'}));
  assert.equal(narrow.noticeCandidate,false);
  let checked=transition(content,baseline,{type:'CHECK_TUESDAY_SLOTS',fixtureId:'tuesday-ok'});
  checked=transition(content,checked,{type:'PROPOSE_SLOT',slot:content.toolFixtures['tuesday-ok'].slots[0]});
  assert.equal(sceneView('service-counter',checked).proposalVisible,true);
  assert.equal(sceneView('service-counter',checked).bookingStatus,'not_booked');
  const timed=sceneView('service-counter',transition(content,checked,{type:'CHECK_TUESDAY_SLOTS',fixtureId:'tuesday-timeout'}));
  assert.equal(timed.proposalVisible,false);
  assert.equal(timed.bookingStatus,'not_booked');
});

test('Three.js GLTFLoader parses each optimized room and its named clip', async () => {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  for (const room of Object.keys(manifest.rooms)) {
    const buffer=readFileSync(new URL(`../public/models/${room}.glb`,import.meta.url));
    const array=buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength) as ArrayBuffer;
    const gltf=await new Promise<any>((resolve,reject)=>new GLTFLoader().parse(array,'',resolve,reject));
    assert.ok(gltf.scene.getObjectByName('ServiceWorkerRig'));
    assert.ok(gltf.animations.length>=1);
  }
});
