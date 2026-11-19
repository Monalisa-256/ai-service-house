import type { State } from './scenario.ts';
import type { BriefingBeat } from './briefing-lesson.ts';
import type { ReactNode } from 'react';

function Station({ x, y, width, color, label, children, active = false }: { x: number; y: number; width: number; color: string; label: string; children?: ReactNode; active?: boolean }) {
  const height = width * .48;
  return <g className={active ? 'stage-active' : ''}>
    <path d={`M${x} ${y} l${width/2} ${-height/2} l${width/2} ${height/2} l${-width/2} ${height/2} Z`} fill="#f8f3e9" stroke="#293c34" strokeWidth="2"/>
    <path d={`M${x} ${y} l${width/2} ${height/2} v18 l${-width/2} ${-height/2} Z`} fill={color} stroke="#293c34" strokeWidth="2"/>
    <path d={`M${x+width/2} ${y+height/2} l${width/2} ${-height/2} v18 l${-width/2} ${height/2} Z`} fill={color} stroke="#293c34" strokeWidth="2"/>
    {children}
    <rect x={x+width/2-73} y={y+height/2+29} width="146" height="29" rx="14" fill="#fcfaf4" stroke="#293c34" strokeWidth="2"/>
    <text x={x+width/2} y={y+height/2+48} textAnchor="middle" className="stage-label">{label}</text>
  </g>;
}
function Person({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  return <g transform={`translate(${x} ${y})`}><ellipse cy="6" rx="19" ry="7" fill="#d4d0c4"/><circle cy="-37" r="10" fill="#f6d2b6" stroke="#283a33" strokeWidth="2"/><path d="M-15 -20 Q0 -30 15 -20 L12 4 Q0 10 -12 4 Z" fill={color} stroke="#283a33" strokeWidth="2"/><path d="M-8 4 v13 M8 4 v13" stroke="#283a33" strokeWidth="3"/><text y="34" textAnchor="middle" className="stage-person-label">{label}</text></g>;
}
function Paper({ x, y, label, tone = 'paper', opacity = 1 }: { x: number; y: number; label: string; tone?: 'paper' | 'notice' | 'brief'; opacity?: number }) {
  return <g transform={`translate(${x} ${y})`} opacity={opacity}><rect x="-48" y="-31" width="96" height="62" rx="5" fill={tone === 'notice' ? '#efb79b' : tone === 'brief' ? '#cbd8f0' : '#fffdf6'} stroke="#293c34" strokeWidth="2"/><path d="M-31 -12 h62 M-31 0 h48 M-31 12 h55" stroke="#84968b" strokeWidth="2"/><text textAnchor="middle" y="-41" className="stage-card-label">{label}</text></g>;
}
export function BriefingStage({ beat, step, progress, state }: { beat: BriefingBeat; step: number; progress: number; state: State }) {
  const noticeSelected = state.contextIds.includes('p-notice-1');
  const questionX = step === 1 ? 128 + progress * 205 : 333;
  const questionY = step === 1 ? 380 - progress * 81 : 299;
  const entering = step === 3 ? progress : step > 3 ? 1 : 0;
  const removing = step === 4 ? progress : step > 4 ? 1 : 0;
  const noticeX = 685 - entering * 265 + removing * 148;
  const noticeY = 220 + entering * 98 - removing * 118;
  const noticeOpacity = step >= 4 ? Math.max(0, 1 - removing * 1.6) : 1;
  const pathVisible = step >= 3;
  const stageDescription = `${beat.title}. The current notice remains in records. ${noticeSelected ? 'Its passage is in the answer context and supports the suspension claim.' : 'Its passage is absent from the answer context, so appointment availability is unverified.'} Booking remains not booked.`;
  return <div className="lesson-stage-art">
    <svg viewBox="0 0 1000 600" role="img" aria-label={stageDescription} preserveAspectRatio="xMidYMid meet">
      <defs><pattern id="stage-grid" width="28" height="16" patternUnits="userSpaceOnUse" patternTransform="skewY(-28)"><path d="M28 0 H0 V16" fill="none" stroke="#e4e1d5" strokeWidth="1"/></pattern><marker id="stage-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="#526b58" strokeWidth="1.5"/></marker></defs>
      <rect width="1000" height="600" fill="#f8f5ed"/><rect width="1000" height="600" fill="url(#stage-grid)" opacity=".75"/>
      <path d="M230 394 Q278 335 343 327" className={`stage-flow ${step === 1 ? 'is-current' : ''}`} markerEnd="url(#stage-arrow)"/>
      <path d="M715 277 Q633 341 505 322" className={`stage-flow ${pathVisible && noticeSelected ? 'is-current' : ''} ${pathVisible && !noticeSelected ? 'is-broken' : ''}`} markerEnd={noticeSelected ? 'url(#stage-arrow)' : undefined}/>
      <path d="M530 382 Q640 450 733 445" className={`stage-flow ${step >= 3 ? 'is-current' : ''}`} markerEnd="url(#stage-arrow)"/>
      <Station x={69} y={388} width={210} color="#b9c8b8" label="PUBLIC VISITOR" active={beat.focus === 'question'}><Person x={170} y={377} color="#a7b9d7" label="visitor"/></Station>
      <Station x={276} y={365} width={280} color="#7f9d8b" label="BRIEFING DESK" active={['brief','context','removal'].includes(beat.focus)}><Person x={335} y={326} color="#547967" label="clerk"/><rect x="439" y="313" width="93" height="51" rx="5" fill="#e2e9dc" stroke="#293c34" strokeWidth="2"/><text x="485" y="341" textAnchor="middle" className="stage-small">CONTEXT</text></Station>
      <Station x={614} y={246} width={205} color="#d4aa86" label="PUBLIC RECORDS" active={beat.focus === 'context'}><path d="M684 242 v-62 h68 v62" fill="#e8d6b9" stroke="#293c34" strokeWidth="2"/><path d="M693 193 h48 M693 204 h48 M693 215 h48" stroke="#8a775f" strokeWidth="2"/></Station>
      <Station x={692} y={445} width={235} color="#b8c9df" label="ANSWER" active={beat.focus === 'answer'}><rect x="746" y="404" width="114" height="74" rx="6" fill="#fffdf6" stroke="#293c34" strokeWidth="2"/><path d="M765 424 h75 M765 436 h65 M765 448 h68" stroke="#8ca19b" strokeWidth="2"/></Station>
      <Paper x={questionX} y={questionY} label="SATURDAY QUESTION" opacity={step === 1 ? 1 : .92}/>
      {step >= 2 && <Paper x={340} y={247} label="PUBLIC TASK BRIEF" tone="brief"/>}
      <Paper x={685} y={211} label="CURRENT NOTICE · V2" tone="notice"/>
      {step >= 3 && <Paper x={noticeX} y={noticeY} label="SELECTED PASSAGE" tone="notice" opacity={noticeOpacity}/>}
      {step >= 4 && <g><rect x="584" y="69" width="246" height="36" rx="18" fill="#fae8df" stroke="#9d694d"/><text x="707" y="92" textAnchor="middle" className="stage-warning">CONTEXT MISSING NOTICE</text></g>}
      {step >= 3 && <g><rect x="739" y="333" width="185" height="34" rx="17" fill={noticeSelected ? '#e1eddc' : '#f5dfd3'} stroke={noticeSelected ? '#668268' : '#9d694d'}/><text x="831" y="355" textAnchor="middle" className="stage-status">{noticeSelected ? 'SUSPENDED · SUPPORTED' : 'UNVERIFIED'}</text></g>}
    </svg>
    <p className="stage-transcript">{stageDescription}</p>
  </div>;
}
