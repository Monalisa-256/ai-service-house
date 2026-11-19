import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { BriefingLessonPlayer } from './BriefingLessonPlayer.tsx';
import { briefingStep } from './briefing-lesson.ts';
import { ExtendedJourney, extendedRooms, type ExtendedRoom } from './ExtendedJourney.tsx';
import { FinalChallenge } from './FinalChallenge.tsx';
import './styles.css';
import './lesson-player.css';
function RootRouter() {
  const [path, setPath] = useState(() => location.hash.replace(/^#\/?/, ''));
  useEffect(() => { const sync = () => setPath(location.hash.replace(/^#\/?/, '')); addEventListener('hashchange', sync); return () => removeEventListener('hashchange', sync); }, []);
  if (!path || path === 'briefing' || path.startsWith('briefing/')) return <BriefingLessonPlayer step={briefingStep(Number(path.split('/')[1] ?? 1))}/>;
  if (path === 'challenge') return <FinalChallenge/>;
  return extendedRooms.includes(path as ExtendedRoom) ? <ExtendedJourney room={path as ExtendedRoom}/> : <App/>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><RootRouter /></React.StrictMode>);
