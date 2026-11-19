import { useEffect, useRef, useState } from 'react';
import data from '../content/extended.json';
import cards from '../content/inspection-cards.json';
import publicCase from '../content/saturday-public.json';
import { PlatformDrawer } from './PlatformDrawer.tsx';
import { ExtendedScenePanel } from './ExtendedScenePanel.tsx';
import { AudioNarration } from './AudioNarration.tsx';
import { CaseGlossary } from './CaseGlossary.tsx';
import { deriveExtended, extendedTransition, initialExtendedForRoom, type ExtendedEvent, type ExtendedState } from './extended.ts';

export type ExtendedRoom = 'records' | 'workshop' | 'test-room' | 'security' | 'operations';
export const extendedRooms: ExtendedRoom[] = ['records', 'workshop', 'test-room', 'security', 'operations'];
const roomScripts = Object.fromEntries(data.rooms.map(room => [room.id, room])) as Record<ExtendedRoom, typeof data.rooms[number]>;
const firstThree = [{ id: 'briefing', title: 'Briefing desk' }, { id: 'library', title: 'Reference library' }, { id: 'service-counter', title: 'Service counter' }];
const storageKey = 'service-house-extended-v2';
function storedRuns(): Record<ExtendedRoom, ExtendedEvent[]> {
  const empty = {} as Record<ExtendedRoom, ExtendedEvent[]>;
  for (const room of extendedRooms) empty[room] = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Record<string, unknown>;
    for (const room of extendedRooms) {
      const events = saved[room];
      if (!Array.isArray(events) || events.length > data.recoverySequence.length || events.some(event => typeof event !== 'string')) continue;
      try {
        events.reduce((state: ExtendedState, event: ExtendedEvent) => extendedTransition(state, event), initialExtendedForRoom(room));
        const allowed = room === 'operations' ? data.recoverySequence.map(step => step.event) : [roomScripts[room].core.action];
        if (events.every((event, index) => event === allowed[index])) empty[room] = events as ExtendedEvent[];
      } catch { /* Discard an invalid saved run. */ }
    }
  } catch { /* Storage may be unavailable. */ }
  return empty;
}
function nextEvent(room: ExtendedRoom, count: number): ExtendedEvent | null {
  if (room === 'operations') return (data.recoverySequence[count]?.event as ExtendedEvent | undefined) ?? null;
  return count === 0 ? roomScripts[room].core.action as ExtendedEvent : null;
}
const describe = (state: ReturnType<typeof deriveExtended>) => [
  ['Eligible notice candidate', state.candidateNotice ? 'Present' : 'Absent'],
  ['Saturday appointment claim', state.appointmentStatus],
  ['Displayed answer', state.displayedAnswer === 'stale_older_plan' ? 'Stale earlier plan' : state.displayedAnswer],
  ['Cache', state.cacheStale ? 'Stale v1' : 'Current v2'],
  ['Critical Saturday evaluation', state.evalResult.criticalSaturday ? 'Pass' : 'Fail'],
  ['Release decision', state.evalResult.release],
  ['Rollout', state.rollout],
  ['Affected-slice recovery', state.recoveryVerified ? 'Verified' : 'Not verified'],
  ['Staff record access', state.staffAccess],
  ['Booking', state.bookingStatus]
];
export function ExtendedJourney({ room }: { room: ExtendedRoom }) {
  const script = roomScripts[room];
  const [runs, setRuns] = useState(storedRuns);
  const [viewed, setViewed] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [inspection, setInspection] = useState<string | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const events = runs[room];
  const actual = events.reduce((state: ExtendedState, event) => extendedTransition(state, event), initialExtendedForRoom(room));
  const shownEvents = viewed === null ? events : events.slice(0, viewed);
  const shown = shownEvents.reduce((state: ExtendedState, event) => extendedTransition(state, event), initialExtendedForRoom(room));
  const baseline = deriveExtended(initialExtendedForRoom(room));
  const result = deriveExtended(shown);
  const action = nextEvent(room, events.length);
  useEffect(() => { title.current?.focus(); setViewed(null); setAnswer(null); setInspection(null); }, [room]);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(runs)); } catch { /* Session remains usable. */ } }, [runs]);
  const dispatch = () => {
    if (!action) return;
    const next = extendedTransition(actual, action);
    setRuns(previous => ({ ...previous, [room]: next.events }));
    setViewed(null);
  };
  const reset = () => { setRuns(previous => ({ ...previous, [room]: [] })); setViewed(null); setAnswer(null); setInspection(null); };
  const fixtureText = (id: string) => data.newFixtures.find(fixture => fixture.id === id);
  return <div className="site extended-site">
    <a className="skip" href="#case-content" onClick={event => { event.preventDefault(); document.getElementById('case-content')?.focus(); }}>Skip to case study</a>
    <header className="masthead"><a className="brand" href="#/briefing"><span className="brand-mark" aria-hidden="true">H<span>·</span></span><span>THE AI<br/>SERVICE HOUSE</span></a><span className="masthead-note">INTERACTIVE CASE / FIVE FURTHER STUDIES</span></header>
    <div className="layout"><aside className="rail" aria-label="Eight-space navigation"><div className="rail-label">THE ROUTE <span>01—08</span></div><nav aria-label="Learning spaces">{[...firstThree, ...data.rooms.map(item => ({id:item.id,title:item.title}))].map((item,index) => <a key={item.id} href={`#/${item.id}`} aria-current={item.id === room ? 'page' : undefined} className={`room-link ${item.id === room ? 'active' : ''}`}><span className="room-index">{String(index+1).padStart(2,'0')}</span><span><strong>{item.title}</strong></span><span aria-hidden="true">↗</span></a>)}</nav><div className="rail-foot"><span className="small-caps">ONE FICTIONAL CASE</span><p>Follow the source, delivery, evaluation, security, and recovery layers.</p></div></aside>
    <main id="case-content" tabIndex={-1} className="main extended-main"><div className="topline"><span>FICTIONAL CASE / AUTHORED SIMULATION</span><span>NO LIVE AI OR BOOKING</span></div>
      <div className="title-row"><div><div className="eyebrow">SPACE {String(extendedRooms.indexOf(room)+4).padStart(2,'0')} / CASE STUDY</div><h1 ref={title} tabIndex={-1}>{script.title}</h1><p className="lede">{script.objective}</p></div></div>
      <div className="case-strip"><div><span className="small-caps">THE VISITOR ASKS</span><p>“{publicCase.question}”</p></div><div className="case-mini">SATURDAY 21 NOV 2026<br/>RIVERSIDE CENTER</div></div>
      <ExtendedScenePanel room={room} event={shownEvents.at(-1)??null} caption={script.caption}/>
      <AudioNarration key={room} title={script.title} script={script.narration} src={`/audio/${room}.mp3`}/>
      <section className="extended-intro" aria-label="Case question"><div><span className="small-caps">THE QUESTION</span><h2>{script.core.question}</h2><p>{script.core.reference}</p></div><div><span className="small-caps">HUMAN-SCALE DIRECTION</span><p>{script.humanAction}</p><p className="extended-note">This study is an authored 2D equivalent. Its outcome is determined by the displayed fixture and rule, not by a live model.</p></div></section>
      <section className="extended-action" aria-label="Controlled intervention"><div className="section-heading"><span className="step-disc">1</span><div><span className="small-caps">APPLY ONE CONTROLLED CHANGE</span><h2>{room === 'operations' ? 'Incident and recovery trace' : 'Inspect the causal change'}</h2></div></div><p>{script.core.cause}</p><button className="primary-button" type="button" onClick={dispatch} disabled={!action}>{action ? room === 'operations' ? `Apply ${action.toLowerCase().replaceAll('_',' ')}` : 'Apply the change' : 'Trace complete'} <span aria-hidden="true">↗</span></button>{events.length > 0 && <p className="feedback" role="status">{room === 'operations' ? data.recoverySequence[events.length-1].observation : script.core.result}</p>}</section>
      <section className="comparison" aria-label="Before and after evidence"><div className="section-heading"><span className="step-disc">2</span><div><span className="small-caps">COMPARE THE RESULT</span><h2>Case state</h2></div></div><div className="compare-grid"><StateTable label="REFERENCE" rows={describe(baseline)}/><StateTable label={viewed === null ? 'CURRENT SNAPSHOT' : `SNAPSHOT ${viewed}`} rows={describe(result)}/></div><p className="cause">{result.explanation.join(' ')}</p><div className="button-row"><button type="button" onClick={() => setViewed(0)}>Start</button>{events.map((_,index) => <button type="button" key={index} onClick={() => setViewed(index+1)} aria-pressed={viewed === index+1}>Step {index+1}</button>)}<button type="button" onClick={() => setViewed(null)} aria-pressed={viewed === null}>Latest</button><button type="button" onClick={reset}>Reset this study</button></div></section>
      <section className="evidence-section" aria-label="Case fixtures"><div className="section-heading"><span className="step-disc">3</span><div><span className="small-caps">INSPECT THE SOURCE</span><h2>Fixture register</h2></div></div><p>Only public source identifiers and authored fixture descriptions appear here. The staff rota body is never displayed.</p><ul className="fixture-list">{script.fixtures.map(id => <li key={id}><strong>{id}</strong><p>{fixtureText(id)?.text ?? (id === 'doc-rota-v1' ? 'Staff-only record: public access denied.' : id === 'doc-poisoned-v1' ? 'Untrusted external copy: not an eligible center source.' : publicCase.documents.find(document => document.id === id)?.body ?? 'Public case document.')}</p><small>{fixtureText(id)?.status ?? (id === 'doc-notice-v1' ? 'superseded' : id === 'doc-rota-v1' ? 'restricted' : id === 'doc-poisoned-v1' ? 'untrusted' : 'public case record')}</small></li>)}</ul><details className="case-folder"><summary>Open the shared case folder</summary><div className="folder-content"><p><strong>Date and scope:</strong> Saturday 21 November 2026; application-help appointments are suspended, while reception remains open for general information from 09:00 to 12:00.</p><p><strong>Action boundary:</strong> A Tuesday slot lookup or proposal never confirms a booking. This case has no booking write.</p><p><strong>Study boundary:</strong> Each room starts from a named reference snapshot. The controls here fork that room’s study; they do not overwrite the three-space guided run.</p></div></details></section>
      <section className="learning-check" aria-label="Learning check"><div className="section-heading"><span className="step-disc">4</span><div><span className="small-caps">CHECK YOUR UNDERSTANDING</span><h2>Explain the distinction</h2></div></div><fieldset disabled={!events.length}><legend>{script.assessment.prompt}</legend>{script.assessment.options.map((option,index) => <label className={`choice ${answer === index ? 'selected' : ''}`} key={option}><input type="radio" name={`assessment-${room}`} checked={answer === index} onChange={() => setAnswer(index)}/>{option}</label>)}</fieldset>{answer !== null && <p className="review-feedback" role="status">{answer === script.assessment.correct ? 'Correct. ' : 'Review the fixture and try again. '}{script.assessment.rationale}</p>}</section>
      <details className="inspection-drawer"><summary>Inspect related concepts ({cards.rooms[room].length})</summary><p>Each card names one illustrative change and its expected observation. Select a card to reveal its causal result.</p><div className="inspection-grid">{cards.rooms[room].map(card => <article key={card.topic}><h3>{card.topic}</h3><p>{card.intervention}</p><button type="button" aria-expanded={inspection === card.topic} onClick={() => setInspection(inspection === card.topic ? null : card.topic)}>{inspection === card.topic ? 'Hide observation' : 'Show observation'}</button>{inspection === card.topic && <p className="review-feedback">{card.observation}</p>}</article>)}</div></details>
      <details className="engineer-view"><summary>Engineer view · exact event and derived rule trace</summary><div className="engineer-content"><div><strong>Events in this snapshot</strong><pre>{JSON.stringify(shownEvents,null,2)}</pre><strong>Source IDs</strong><pre>{JSON.stringify(script.fixtures,null,2)}</pre></div><div><strong>Derived case state</strong><pre>{JSON.stringify(result,null,2)}</pre><p>Animations read this snapshot. They cannot commit an event or authorize a booking.</p></div></div></details>
      <CaseGlossary/>
      <PlatformDrawer/>
      <p className="journey-next"><a href="#/challenge">Open the final Saturday diagnostic →</a></p>
      <footer className="footer"><p>Educational simulation · Fixed fictional sources and outcomes · No real appointments.</p><p>{data.scenarioId} / {data.contentVersion}</p></footer>
    </main></div></div>;
}
function StateTable({label,rows}:{label:string;rows:string[][]}){return <article className="state-card"><span className="small-caps">{label}</span><dl className="extended-state">{rows.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></article>}
