import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { ExtendedJourney, extendedRooms, type ExtendedRoom } from './ExtendedJourney.tsx';
import './styles.css';
function RootRouter() {
  const [path, setPath] = useState(() => location.hash.replace(/^#\/?/, ''));
  useEffect(() => { const sync = () => setPath(location.hash.replace(/^#\/?/, '')); addEventListener('hashchange', sync); return () => removeEventListener('hashchange', sync); }, []);
  return extendedRooms.includes(path as ExtendedRoom) ? <ExtendedJourney room={path as ExtendedRoom}/> : <App/>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><RootRouter /></React.StrictMode>);
