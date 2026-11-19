// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BriefingLessonPlayer } from '../src/BriefingLessonPlayer.tsx';

beforeEach(() => { localStorage.clear(); location.hash = '#/briefing/1'; });
afterEach(() => cleanup());

test('lesson shows exact evidence, context loss, and no booking independently of motion', async () => {
  const user = userEvent.setup();
  const view = render(<BriefingLessonPlayer step={3}/>);
  expect(screen.getByRole('heading', { name: 'Where did the answer get its evidence?' })).toBeTruthy();
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('supports the suspension claim');
  await user.click(screen.getByRole('radio', { name: /Unverified from this context/ }));
  view.rerender(<BriefingLessonPlayer step={4}/>);
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('remains in records');
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('unverified');
  expect(screen.getByText('Your prediction matches the evidence boundary.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Skip motion' }));
  await user.click(screen.getByRole('button', { name: 'Replay' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Booking remains not booked');
  await user.click(screen.getByRole('button', { name: /Inspect exact evidence/ }));
  const dialog = screen.getByRole('dialog', { name: 'Exact case evidence' });
  expect(dialog.textContent).toContain('CURRENT RECORD · NOT IN ANSWER CONTEXT');
  expect(dialog.textContent).toContain('not_in_context');
  expect(dialog.textContent).toContain('not_booked');
  expect(dialog.textContent).not.toContain('p-rota-1');
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: /Inspect exact evidence/ }));
});

test('lesson preserves route on skip, offers reduced motion, and checks explanation', async () => {
  const user = userEvent.setup();
  const view = render(<BriefingLessonPlayer step={1}/>);
  await user.click(screen.getByRole('button', { name: 'Skip to step explanation' }));
  expect(location.hash).toBe('#/briefing/1');
  expect(document.activeElement).toBe(screen.getByRole('complementary', { name: 'Current step explanation' }));
  await user.click(screen.getByRole('button', { name: 'Reduce motion' }));
  expect(screen.getByRole('button', { name: 'Reduced motion on' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('slider', { name: 'Motion position' }).hasAttribute('disabled')).toBe(true);
  view.rerender(<BriefingLessonPlayer step={5}/>);
  expect(screen.getByRole('region', { name: 'Answer comparison' }).textContent).toContain('NOTICE REMOVED · UNVERIFIED');
  expect(screen.getByRole('region', { name: 'Answer comparison' }).textContent).toContain('Booking: not booked');
  await user.click(screen.getByRole('radio', { name: /removed from this answer’s context/ }));
  expect(screen.getByText(/Correct. The record remains current/)).toBeTruthy();
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('not booked');
});
