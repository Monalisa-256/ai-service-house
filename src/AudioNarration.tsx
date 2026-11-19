import { useEffect, useRef, useState } from 'react';

type Playback = 'idle' | 'speaking' | 'paused' | 'unavailable' | 'error';

export function AudioNarration({ title, script, src }: { title: string; script: string; src?: string }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [mediaFailed, setMediaFailed] = useState(false);
  const [status, setStatus] = useState<Playback>(supported ? 'idle' : 'unavailable');
  const [rate, setRate] = useState(1);
  const media = useRef<HTMLAudioElement>(null);
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  const stop = () => {
    if (!supported) return;
    active.current = null;
    window.speechSynthesis.cancel();
    setStatus('idle');
  };
  useEffect(() => () => {
    active.current = null;
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);
  const play = () => {
    if (!supported) return;
    if (status === 'paused') {
      window.speechSynthesis.resume();
      setStatus('speaking');
      return;
    }
    window.speechSynthesis.cancel();
    try {
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.lang = 'en';
      utterance.rate = rate;
      utterance.onend = () => { if (active.current === utterance) { active.current = null; setStatus('idle'); } };
      utterance.onerror = () => { if (active.current === utterance) { active.current = null; setStatus('error'); } };
      active.current = utterance;
      window.speechSynthesis.speak(utterance);
      setStatus('speaking');
    } catch {
      active.current = null;
      setStatus('error');
    }
  };
  const pause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus('paused');
  };
  return <section className="player-audio" aria-label="Optional spoken explanation">
    <div className="player-audio-heading"><span>LISTEN TO THIS STEP</span><span aria-live="polite">{src && !mediaFailed ? 'Recorded narration · ready' : status === 'speaking' ? 'Speaking' : status === 'paused' ? 'Paused' : status === 'error' ? 'Speech unavailable' : status === 'unavailable' ? 'Text only on this browser' : 'Ready'}</span></div>
    {src && !mediaFailed ? <div className="player-recorded-audio"><audio ref={media} src={src} controls preload="none" aria-label={`Narration: ${title}`} onError={() => setMediaFailed(true)}/><label>Speed <select aria-label="Narration speed" value={rate} onChange={event => { const next=Number(event.target.value);setRate(next);if(media.current)media.current.playbackRate=next; }}><option value="0.85">0.85×</option><option value="1">1×</option><option value="1.2">1.2×</option></select></label></div> : <div className="player-audio-controls">
      {status === 'speaking' ? <button type="button" onClick={pause}>Pause narration</button> : <button type="button" onClick={play} disabled={!supported}>{status === 'paused' ? 'Resume narration' : 'Play narration'}</button>}
      <button type="button" onClick={stop} disabled={!supported || status === 'idle' || status === 'unavailable'}>Stop</button>
      <label>Speed <select aria-label="Narration speed" value={rate} onChange={event => { const next = Number(event.target.value); stop(); setRate(next); }} disabled={!supported}><option value="0.85">0.85×</option><option value="1">1×</option><option value="1.2">1.2×</option></select></label>
    </div>}
    <details open><summary>Read narration: {title}</summary><p>{script}</p></details>
    <p className="player-audio-note">{src && !mediaFailed ? 'Recorded narration is optional. Nothing plays automatically.' : 'Browser voice is optional. The explanation and evidence remain available as text.'}</p>
  </section>;
}
