import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const saturday = JSON.parse(readFileSync(new URL('content/saturday.json',root),'utf8'));
const extended = JSON.parse(readFileSync(new URL('content/extended.json',root),'utf8'));
const platforms = JSON.parse(readFileSync(new URL('content/platforms.json',root),'utf8'));
const matrix = readFileSync(new URL('docs/PHASE_5_INSPECTION_MATRIX.md',root),'utf8');
const errors: string[]=[];
const actions = new Set(['ACTIVATE_CURRENT_NOTICE','SERVE_STALE_CACHE','RUN_CANDIDATE_EVAL','INJECT_HOSTILE_SOURCE','DEPLOY_STALE_INDEX']);
const sourceIds = new Set(saturday.documents.map((d: {id:string})=>d.id));
const fixtureIds = new Set(extended.newFixtures.map((f: {id:string})=>f.id));
if (extended.scenarioId!==saturday.scenarioId || extended.targetDate!==saturday.targetDate) errors.push('Cross-room case/date mismatch');
if (fixtureIds.size!==extended.newFixtures.length) errors.push('Duplicate extended fixture');
for(const id of extended.sourceRefs) if(!sourceIds.has(id)) errors.push(`Unknown shared source ${id}`);
for(const fixture of extended.newFixtures) if(!sourceIds.has(fixture.sourceId) || !fixture.text || !fixture.published) errors.push(`Invalid fixture ${fixture.id}`);
if (extended.rooms.length!==5) errors.push('Expected five authored rooms');
for(const room of extended.rooms){
  if(!actions.has(room.core.action) || !extended.dependencyRules.some((r:{from:string})=>r.from===room.core.action)) errors.push(`Missing action/rule ${room.id}`);
  for(const field of ['question','reference','result','cause']) if(!room.core[field]) errors.push(`Missing ${field} in ${room.id}`);
  for(const field of ['humanAction','equivalent2D','narration','caption']) if(!room[field]) errors.push(`Missing ${field} in ${room.id}`);
  for(const id of room.fixtures) if(!sourceIds.has(id)&&!fixtureIds.has(id)) errors.push(`Unknown fixture ${id} in ${room.id}`);
  if(room.assessment.options.length!==2 || ![0,1].includes(room.assessment.correct) || !room.assessment.rationale) errors.push(`Invalid assessment ${room.id}`);
  for(const topic of room.optional) if(!matrix.toLowerCase().includes(`| ${topic.toLowerCase()} |`)) errors.push(`Optional inspection missing: ${room.id}/${topic}`);
}
const cases=extended.evaluationCases;
if(cases.length!==5 || cases.filter((c:{baselinePass:boolean})=>c.baselinePass).length!==3 || cases.filter((c:{candidatePass:boolean})=>c.candidatePass).length!==4 || !cases.some((c:{slice:string,baselinePass:boolean,candidatePass:boolean})=>c.slice==='critical_saturday'&&c.baselinePass&&!c.candidatePass)) errors.push('Evaluation fixture does not show critical regression');
if(extended.finalChallenge.rubric.reduce((n:number,r:{points:number})=>n+r.points,0)!==extended.finalChallenge.maxPoints) errors.push('Final rubric total mismatch');
const domains=['platform.openai.com','platform.claude.com','ai.google.dev','docs.aws.amazon.com','learn.microsoft.com','docs.cohere.com','huggingface.co'];
if(platforms.entries.length!==domains.length || !platforms.entries.every((e:{officialUrl:string})=>{try{const url=new URL(e.officialUrl);return url.protocol==='https:'&&domains.includes(url.hostname);}catch{return false;}})) errors.push('Platform source register invalid');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;} else console.log('Extended five-room content, optional inspection coverage, evaluation rubric, and platform register valid.');
