import scripts from '../content/slice-lessons.json' with { type:'json' };
import { briefingContent } from './briefing-lesson.ts';
import { initialState, transition } from './scenario.ts';
export type SliceRoom = keyof typeof scripts;
export const sliceScripts = scripts;
export const sliceStep = (value:number) => Number.isInteger(value) ? Math.min(5,Math.max(1,value)) : 1;
export function sliceSnapshot(room:SliceRoom,step:number) {
  const base=initialState(briefingContent);
  if(room==='library') return step<3 ? base : step<5 ? transition(briefingContent,base,{type:'SET_RETRIEVAL_STRATEGY',strategyId:'hours-only'}) : base;
  if(step===1) return base;
  const checked=transition(briefingContent,base,{type:'CHECK_TUESDAY_SLOTS',fixtureId:'tuesday-ok'});
  if(step===2) return checked;
  const proposed=transition(briefingContent,checked,{type:'PROPOSE_SLOT',slot:checked.tool.slots[0]});
  return step===3 ? proposed : transition(briefingContent,proposed,{type:'CHECK_TUESDAY_SLOTS',fixtureId:'tuesday-timeout'});
}
