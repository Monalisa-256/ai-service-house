import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BriefingStage } from './BriefingStage.tsx';
import { briefingBeats, briefingContent, briefingSnapshot, briefingStep } from './briefing-lesson.ts';
import { checkCitation, initialState, inspectPassage } from './scenario.ts';
import { sceneView } from './scene-view.ts';
import { SceneBoundary } from './SceneBoundary.tsx';
const SceneViewport = lazy(() => import('./SceneViewport.tsx').then(module => ({ default: module.SceneViewport })));
const stepUrl = (step: number) => `#/briefing/${briefingStep(step)}`;
const getPreference = () => { try { const saved = localStorage.getItem('service-house-reduced-motion'); return saved === null ? (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) : saved === 'true'; } catch { return false; } };

export function BriefingLessonPlayer({ step: requestedStep }: { step: number }) {
  const step = briefingStep(requestedStep);
  const beat = briefingBeats[step - 1];
  const state = briefingSnapshot(step);
  const reference = initialState(briefingContent);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(getPreference);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showVignette, setShowVignette] = useState(false);
  const [prediction, setPrediction] = useState<'suspended' | 'unverified' | null>(null);
  const [check, setCheck] = useState<'record' | 'context' | null>(null);
  const [visited, setVisited] = useState<number[]>(() => { try { const saved = JSON.parse(localStorage.getItem('service-house-briefing-steps-v1') ?? '[]'); return Array.isArray(saved) ? saved.filter((n:unknown) => Number.isInteger(n) && Number(n) >= 1 && Number(n) <= 5) : []; } catch { return []; } });
  const heading = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef(0);
  const [playbackRun, setPlaybackRun] = useState(0);
  const evidenceButton = useRef<HTMLButtonElement>(null);
  const evidenceDialog = useRef<HTMLElement>(null);
  const guide = useRef<HTMLElement>(null);
  useEffect(() => { heading.current?.focus(); progressRef.current = reduced ? 1 : 0; setProgress(progressRef.current); setPlaying(!reduced); setPlaybackRun(value => value + 1); setVisited(previous => previous.includes(step) ? previous : [...previous, step]); }, [step]);
  useEffect(() => { try { localStorage.setItem('service-house-briefing-steps-v1', JSON.stringify(visited)); } catch { /* Progress remains in memory. */ } }, [visited]);
  useEffect(() => { try { localStorage.setItem('service-house-reduced-motion', String(reduced)); } catch { /* Preference remains in memory. */ } if (reduced) { setPlaying(false); progressRef.current = 1; setProgress(1); } }, [reduced]);
  useEffect(() => {
    if (!playing || reduced) return;
    let frame = 0; let last = 0; let amount = progressRef.current;
    const tick = (now: number) => { if (last) amount = Math.min(1, amount + (now - last) / 1700); last = now; progressRef.current = amount; setProgress(amount); if (amount >= 1) setPlaying(false); else frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, step, reduced, playbackRun]);
  const go = (value: number) => { location.hash = stepUrl(value); };
  const replay = () => { if (reduced) { progressRef.current = 1; setProgress(1); return; } progressRef.current = 0; setProgress(0); setPlaying(true); setPlaybackRun(value => value + 1); };
  const closeEvidence = () => { evidenceButton.current?.focus(); setShowEvidence(false); };
  useEffect(() => { if (showEvidence) evidenceDialog.current?.querySelector('button')?.focus(); }, [showEvidence]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (showEvidence) {
        if (event.key === 'Escape') { event.preventDefault(); closeEvidence(); }
        if (event.key === 'Tab') {
          const controls = [...(evidenceDialog.current?.querySelectorAll<HTMLElement>('button, summary, a, input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])];
          if (controls.length) {
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
        }
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (['INPUT','TEXTAREA','SELECT','BUTTON','A','SUMMARY'].includes(target.tagName) || target.isContentEditable)) return;
      if (event.key === 'ArrowLeft' && step > 1) { event.preventDefault(); go(step-1); }
      if (event.key === 'ArrowRight' && step < 5) { event.preventDefault(); go(step+1); }
      if (event.key.toLowerCase() === 'r') { event.preventDefault(); replay(); }
      if (event.key === ' ') { event.preventDefault(); setPlaying(value => !value); }
    };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, [step, reduced, showEvidence]);
  const notice = inspectPassage(briefingContent, reference, 'p-notice-1');
  const hours = inspectPassage(briefingContent, reference, 'p-hours-1');
  const noticeSupport = checkCitation(briefingContent, state, 'appointment-status', 'p-notice-1');
  const currentCue = sceneView('briefing', state).cue;
  return <div className="player-app">
    <button type="button" className="skip" onClick={() => guide.current?.focus()}>Skip to step explanation</button>
    <header className="player-header"><a className="player-brand" href="#/briefing/1"><span className="player-mark" aria-hidden="true">H</span><strong>AI Service House</strong></a><span className="player-course-label">ONE REQUEST · EIGHT SYSTEM SPACES</span><nav aria-label="Site navigation"><a href="#/briefing/1" aria-current="page">Learn</a><a href="#/library">Reference library</a><a href="#/briefing-classic">Detailed workbench</a></nav><button type="button" className="player-motion" aria-pressed={reduced} onClick={() => setReduced(value => !value)}>{reduced ? 'Reduced motion on' : 'Reduce motion'}</button></header>
    <div className="player-layout"><aside className="player-rail" aria-label="Course spaces"><div className="player-rail-head"><strong>Case route</strong><span>8 spaces</span></div><nav aria-label="Eight concept spaces">{[
      ['briefing/1','Briefing desk','Instructions & context'],['records','Records room','Data & provenance'],['library','Reference library','Retrieval & knowledge'],['service-counter','Service counter','Tools & action'],['workshop','Experience workshop','Application engineering'],['test-room','Test room','Evaluation'],['security','Security checkpoint','Permissions'],['operations','Operations room','Monitoring & recovery']
    ].map(([id,title,subtitle],index) => <a key={id} href={`#/${id}`} aria-current={index === 0 ? 'page' : undefined} className={index === 0 ? 'is-active' : ''}><span>{String(index+1).padStart(2,'0')}</span><span><strong>{title}</strong><small>{subtitle}</small></span>{index === 0 && <em>{visited.length}/5</em>}</a>)}</nav><div className="player-rail-foot"><span>CASE 001 · FICTIONAL</span><p>Riverside Community Services Center<br/>Saturday, 21 November 2026</p></div></aside>
    <main className="player-main"><div className="player-heading"><div><span className="player-eyebrow">01 / BRIEFING DESK · STEP {step} OF 5</span><h1 ref={heading} tabIndex={-1}>Where did the answer get its evidence?</h1><p>Follow a Saturday request from the visitor’s question to the selected context.</p></div><span className="player-duration">~ 4 MIN · BEGINNER</span></div>
      <div className="player-metrics" aria-label="Current case status"><Status label="Current notice" value="v2 · public"/><Status label="Retrieved candidates" value={String(state.retrievalIds.length)}/><Status label="Notice in context" value={state.contextIds.includes('p-notice-1') ? 'Yes' : 'No'} warning={!state.contextIds.includes('p-notice-1')}/><Status label="Saturday session claim" value={state.appointmentStatus === 'suspended' ? 'Suspended · supported' : 'Unverified'} warning={state.appointmentStatus === 'unverified'}/><Status label="Booking" value="Not booked"/></div>
      <section className="player-stage" aria-label="Animated case diagram"><div className="player-stage-controls"><span>ILLUSTRATIVE HUMAN-SCALE SERVICE FLOW</span><div><button type="button" onClick={replay}>Replay</button><button type="button" onClick={() => setPlaying(value => !value)} disabled={reduced || progress >= 1}>{playing ? 'Pause' : 'Play'}</button><button type="button" onClick={() => { progressRef.current=1; setProgress(1); setPlaying(false); }}>Skip motion</button></div></div><BriefingStage beat={beat} step={step} progress={progress} state={state}/><div className="player-stage-footer"><div className="player-legend"><span><i className="legend-question"/>question</span><span><i className="legend-notice"/>current notice</span><span><i className="legend-path"/>selected evidence</span></div><label>Motion position <input aria-label="Motion position" type="range" min="0" max="100" value={Math.round(progress*100)} onChange={event => { setPlaying(false); progressRef.current=Number(event.target.value)/100; setProgress(progressRef.current); }} disabled={reduced}/></label></div></section>
      <section className="player-timeline" aria-label="Lesson steps"><div className="player-timeline-head"><strong>IN THIS LESSON</strong><span>Step {step} of 5 · {visited.length} visited</span></div><ol>{briefingBeats.map((item,index) => <li key={item.id}><a href={stepUrl(index+1)} aria-current={step === index+1 ? 'step' : undefined} className={`${step===index+1?'is-current':''} ${visited.includes(index+1)?'is-visited':''}`}><span>{index+1}</span><small>{item.title}</small></a></li>)}</ol></section>
    </main>
    <aside className="player-guide" id="lesson-guide" ref={guide} tabIndex={-1} aria-label="Current step explanation"><div className="player-guide-card"><div className="player-guide-top"><span>STEP {step} / 5</span><strong>{beat.kind.toUpperCase()}</strong></div><h2>{beat.title}</h2><p>{beat.explanation}</p><div className="player-key-idea"><span>KEY IDEA</span><p>{beat.keyIdea}</p></div><div className="player-changes"><strong>WHAT CHANGED</strong><ul>{beat.changed.map(change => <li key={change}>{change}</li>)}</ul></div>{step === 3 && <fieldset className="player-prediction"><legend>If the notice leaves the answer context, what can the answer establish?</legend><label><input type="radio" name="briefing-prediction" checked={prediction === 'suspended'} onChange={() => setPrediction('suspended')}/> Still suspended from this context</label><label><input type="radio" name="briefing-prediction" checked={prediction === 'unverified'} onChange={() => setPrediction('unverified')}/> Unverified from this context</label></fieldset>}{step >= 4 && prediction && <p className="player-feedback">{prediction === 'unverified' ? 'Your prediction matches the evidence boundary.' : 'The record still exists, but this answer did not receive it.'}</p>}{step === 5 && <fieldset className="player-prediction"><legend>Why is the Saturday appointment claim unverified?</legend><label><input type="radio" name="briefing-check" checked={check === 'record'} onChange={() => setCheck('record')}/> The current notice was deleted from records</label><label><input type="radio" name="briefing-check" checked={check === 'context'} onChange={() => setCheck('context')}/> The notice was removed from this answer’s context</label>{check && <p className="player-feedback">{check === 'context' ? 'Correct. The record remains current, but this answer lacks the passage.' : 'Look at the records shelf: the current notice is still there.'}</p>}</fieldset>}<button ref={evidenceButton} type="button" className="player-evidence-link" onClick={() => setShowEvidence(true)}>Inspect exact evidence <span aria-hidden="true">↗</span></button><div className="player-guide-nav"><button type="button" onClick={() => go(step-1)} disabled={step===1}>← Back</button><button type="button" className="player-next" onClick={() => go(step+1)} disabled={step===5}>{step===3?'Remove notice':step===5?'Lesson complete':`Next: ${briefingBeats[step]?.title ?? ''}`} →</button></div><p className="player-shortcuts">← → steps · R replay · Space pause</p></div><div className="player-goals"><strong>YOU’LL LEARN</strong><ul><li>Why the Saturday request has two meanings</li><li>How a current passage reaches an answer</li><li>What removing context changes</li><li>Why a record is not a booking</li></ul></div></aside></div>
    <div className="player-below"><button type="button" onClick={() => setShowVignette(value => !value)} aria-expanded={showVignette}>{showVignette ? 'Hide' : 'View'} 3D staff vignette</button><p>The diagram carries the exact causal path. The optional 3D vignette illustrates a human role and uses the same case snapshot.</p>{showVignette && <SceneBoundary room="briefing"><Suspense fallback={<p role="status">Loading the 3D vignette. The diagram above remains available.</p>}><SceneViewport view={sceneView('briefing',state)} time={step===4 ? progress*(currentCue?.duration??0) : currentCue?.duration??0} reduced={reduced}/></Suspense></SceneBoundary>}</div>
    {showEvidence && <div className="player-evidence-backdrop"><aside ref={evidenceDialog} className="player-evidence" role="dialog" aria-modal="true" aria-label="Exact case evidence"><div className="player-evidence-header"><div><span>CASE 001 / PUBLIC RECORDS</span><h2>Evidence and answer</h2></div><button type="button" onClick={closeEvidence}>Close ×</button></div><p>The source exists independently of the passages selected for this answer. All data and results in this case are fictional.</p><div className="player-evidence-item"><strong>Current schedule notice · published 18 November · effective 21 November</strong><blockquote>{notice?.text}</blockquote><span>{state.contextIds.includes('p-notice-1') ? 'IN ANSWER CONTEXT' : 'CURRENT RECORD · NOT IN ANSWER CONTEXT'}</span></div><div className="player-evidence-item"><strong>Opening hours · public</strong><blockquote>{hours?.text}</blockquote><span>OPEN HOURS DO NOT ESTABLISH SESSION AVAILABILITY</span></div><dl><div><dt>Current notice retrieved</dt><dd>{state.retrievalIds.includes('p-notice-1') ? 'Yes' : 'No'}</dd></div><div><dt>Suspension claim support</dt><dd>{noticeSupport.supported ? 'Supported by p-notice-1' : noticeSupport.reason}</dd></div><div><dt>Booking status</dt><dd>{state.bookingStatus}</dd></div></dl><h3>Answer in this snapshot</h3><p>{state.answer.text}</p><details><summary>Engineer inspection</summary><pre>{JSON.stringify({ candidateIds:state.retrievalIds,contextIds:state.contextIds,appointmentStatus:state.appointmentStatus,bookingStatus:state.bookingStatus,sourceIds:state.answer.sourceIds },null,2)}</pre></details></aside></div>}
  </div>;
}
function Status({label,value,warning=false}:{label:string;value:string;warning?:boolean}){return <div className={`player-status ${warning?'is-warning':''}`}><span>{label}</span><strong>{value}</strong></div>}
