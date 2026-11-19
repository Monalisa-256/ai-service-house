import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { SceneBoundary } from './SceneBoundary.tsx';
import { extendedSceneCue } from './scene-cues.ts';
import type { ExtendedEvent } from './extended.ts';
import type { ExtendedRoom } from './ExtendedJourney.tsx';
const SceneViewport = lazy(() => import('./SceneViewport.tsx').then(module => ({ default: module.SceneViewport })));

export function ExtendedScenePanel({ room, event, caption }: { room: ExtendedRoom; event: ExtendedEvent | null; caption: string }) {
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(() => { try { return localStorage.getItem('service-house-reduced-motion') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } });
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frameTime = useRef(0);
  const cue = extendedSceneCue(room,event);
  useEffect(() => { setTime(0); frameTime.current=0; setPlaying(!!event && !reduced); }, [room,event]);
  useEffect(() => {
    if (!playing || !cue || reduced || !shown) return;
    let frame = 0, previous = 0;
    const tick = (now:number) => { if (previous) frameTime.current=Math.min(cue.duration,frameTime.current+(now-previous)/1000); previous=now; setTime(frameTime.current); if (frameTime.current<cue.duration) frame=requestAnimationFrame(tick); else setPlaying(false); };
    frame=requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing,cue?.id,shown,reduced]);
  const skip = () => { frameTime.current=cue?.duration??0; setTime(frameTime.current); setPlaying(false); };
  return <section className="extended-scene" aria-label="Human-scale room illustration">
    <div className="extended-scene-head"><strong>HUMAN-SCALE ROOM · OPTIONAL 3D</strong><button type="button" aria-expanded={shown} onClick={() => setShown(value=>!value)}>{shown ? 'Hide 3D room' : 'Show 3D room'}</button></div>
    <p>{caption} The animation illustrates a staff action; the case state and evidence below establish the outcome.</p>
    {shown && <><div className="extended-scene-controls"><button type="button" onClick={() => { frameTime.current=0; setTime(0); setPlaying(!!cue&&!reduced); }} disabled={!cue||reduced}>Replay</button><button type="button" onClick={() => setPlaying(value=>!value)} disabled={!cue||reduced||time>=cue.duration}>{playing?'Pause':'Play'}</button><button type="button" onClick={skip} disabled={!cue}>Skip motion</button><label>Motion position <input aria-label="Room motion position" type="range" min="0" max="100" value={cue ? Math.round(100*time/cue.duration):0} onChange={e=>{setPlaying(false);frameTime.current=(cue?.duration??0)*Number(e.target.value)/100;setTime(frameTime.current);}} disabled={!cue||reduced}/></label><button type="button" aria-pressed={reduced} onClick={() => { const next=!reduced; setReduced(next); if(next)skip(); try{localStorage.setItem('service-house-reduced-motion',String(next));}catch{} }}>{reduced?'Reduced motion on':'Reduce motion'}</button></div>
      <SceneBoundary room={room}><Suspense fallback={<p role="status">Loading the room model. The case study below remains available.</p>}><SceneViewport view={{room,cue}} time={reduced?0:time} reduced={reduced}/></Suspense></SceneBoundary>
      <p className="extended-scene-caption">{cue?.description??'The staff member waits at the room fixture. No case change is implied.'}</p></>}
  </section>;
}
