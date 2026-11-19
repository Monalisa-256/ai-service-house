// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App.tsx';

beforeEach(() => { localStorage.clear(); location.hash = '#/briefing'; });
afterEach(() => { cleanup(); });

test('guided rooms retain the case, identify evidence, and distinguish proposal from booking', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('heading', { name: 'The briefing' })).toBeTruthy();
  await user.click(screen.getByRole('radio', { name: /Availability is unverified from this context/ }));
  await user.click(screen.getByRole('button', { name: /Reveal the change/ }));
  expect(screen.getByText('The status becomes unverified.')).toBeTruthy();
  expect(screen.getByText('DECISIVE PASSAGE')).toBeTruthy();
  expect(screen.getByText(/SUPERSEDED — INELIGIBLE/)).toBeTruthy();
  await user.click(screen.getByRole('link', { name: /The library/ }));
  await user.click(screen.getByRole('radio', { name: /No, the notice is not in the candidate set/ }));
  await user.click(screen.getByRole('button', { name: /Reveal the change/ }));
  expect(screen.getByText(/The notice cannot be reranked/)).toBeTruthy();
  await user.click(screen.getByRole('link', { name: /The service counter/ }));
  expect(screen.getByText('One possible time was proposed.')).toBeTruthy();
  const comparison = screen.getByRole('region', { name: 'Learning interaction' }).parentElement!;
  expect(comparison.textContent).toContain('Not booked');
  await user.click(screen.getByRole('radio', { name: /Availability is unknown; no booking happened/ }));
  await user.click(screen.getByRole('button', { name: /Reveal the change/ }));
  expect(screen.getByText('The timeout confirms no new availability.')).toBeTruthy();
  await user.click(screen.getByRole('link', { name: /The briefing/ }));
  expect(screen.getByText('The status becomes unverified.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: /Reset this room/ }));
  expect(screen.queryByText('The status becomes unverified.')).toBeNull();
  expect(screen.getByRole('button', { name: /Reveal the change/ }).hasAttribute('disabled')).toBe(true);
});

test('native controls, status, replay, and reduced motion are available', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('link', { name: 'Skip to lesson' })).toBeTruthy();
  expect(screen.getByRole('group', { name: /What can the answer establish/ })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: /Motion: standard/ }));
  expect(screen.getByRole('button', { name: /Motion: reduced/ }).getAttribute('aria-pressed')).toBe('true');
  await user.click(screen.getByRole('radio', { name: /Availability is unverified from this context/ }));
  await user.click(screen.getByRole('button', { name: /Reveal the change/ }));
  await user.click(screen.getByRole('button', { name: 'Step 0' }));
  expect(screen.getByRole('status', { name: '' }).textContent).toContain('Showing snapshot 0');
  expect(screen.getByText('Current notice reaches the answer.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: /Open experiment fork/ }));
  expect(screen.getByRole('button', { name: /Restore notice to context/ })).toBeTruthy();
});

test('skip link preserves a room route and saved runs survive a remount', async () => {
  const user = userEvent.setup();
  const first = render(<App />);
  await user.click(screen.getByRole('link', { name: /The library/ }));
  expect(location.hash).toBe('#/library');
  await user.click(screen.getByRole('link', { name: 'Skip to lesson' }));
  expect(location.hash).toBe('#/library');
  expect(document.activeElement?.tagName).toBe('MAIN');
  await user.click(screen.getByRole('radio', { name: /No, the notice is not in the candidate set/ }));
  await user.click(screen.getByRole('button', { name: /Reveal the change/ }));
  first.unmount();
  render(<App />);
  expect(screen.getByText('The notice cannot be reranked.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Clear saved case' }));
  expect(screen.queryByText('The notice cannot be reranked.')).toBeNull();
});

test('post-reveal check gives causal feedback and records progress', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('radio', { name: /Availability is unverified from this context/ }));
  await user.click(screen.getByRole('button', { name: /Reveal the change/ }));
  await user.click(screen.getByRole('radio', { name: /The record alone supports the answer/ }));
  expect(screen.getByText(/this answer did not receive it/)).toBeTruthy();
  await user.click(screen.getByRole('radio', { name: /selected context needs the notice/ }));
  expect(screen.getByText(/Correct. The explanation depends/)).toBeTruthy();
  expect(localStorage.getItem('service-house-phase2-v1')).toContain('"review":"context"');
});

test('a saved reduced-motion preference prevents motion even when a 3D view is requested', async () => {
  localStorage.setItem('service-house-reduced-motion', 'true');
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('button', { name: 'Motion: reduced' }).getAttribute('aria-pressed')).toBe('true');
  await user.click(screen.getByRole('button', { name: 'Show 3D view' }));
  expect(screen.getByText('Motion reduced: static scene')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Evidence trail' })).toBeTruthy();
});
