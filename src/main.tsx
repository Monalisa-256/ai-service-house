import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { BriefingLessonPlayer } from './BriefingLessonPlayer.tsx';
import { briefingStep } from './briefing-lesson.ts';
import { ExtendedJourney, extendedRooms, type ExtendedRoom } from './ExtendedJourney.tsx';
import { FinalChallenge } from './FinalChallenge.tsx';
import { SliceLessonPlayer } from './SliceLessonPlayer.tsx';
import { Investigation } from './Investigation.tsx';
import { spaces, type Space } from './investigation.ts';
import './styles.css';
import './lesson-player.css';
function RootRouter() {
  const [path, setPath] = useState(() => location.hash.replace(/^#\/?/, ''));
  useEffect(() => { const sync = () => setPath(location.hash.replace(/^#\/?/, '')); addEventListener('hashchange', sync); return () => removeEventListener('hashchange', sync); }, []);
  const entry = path.replace(/^case\//, '');
  if (!path || path === 'challenge' || Object.hasOwn(spaces,entry)) return <Investigation room={!path?'briefing':path==='challenge'?'operations':entry as Space}/>;
  if (path === 'reference-diagnostic') return <FinalChallenge/>;
  if (path === 'briefing' || path.startsWith('briefing/')) return <BriefingLessonPlayer step={briefingStep(Number(path.split('/')[1] ?? 1))}/>;
  if (path === 'library' || path.startsWith('library/')) return <SliceLessonPlayer room="library" requestedStep={Number(path.split('/')[1] ?? 1)}/>;
  if (path === 'service-counter' || path.startsWith('service-counter/')) return <SliceLessonPlayer room="service-counter" requestedStep={Number(path.split('/')[1] ?? 1)}/>;
  return extendedRooms.includes(path.replace(/^study\//,'') as ExtendedRoom) ? <ExtendedJourney room={path.replace(/^study\//,'') as ExtendedRoom}/> : <App/>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><RootRouter /></React.StrictMode>);
