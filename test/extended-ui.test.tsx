// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtendedJourney } from '../src/ExtendedJourney.tsx';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

test('records study shows the exact before/after cause and retains its event', async () => {
  const user = userEvent.setup();
  render(<ExtendedJourney room="records"/>);
  expect(screen.getByRole('heading', {name:'Records room'})).toBeTruthy();
  expect(screen.getByText(/earlier planned-session notice is superseded/i)).toBeTruthy();
  await user.click(screen.getByRole('button',{name:/Apply the change/}));
  expect(screen.getByText(/current dated notice is eligible/)).toBeTruthy();
  expect(localStorage.getItem('service-house-extended-v2')).toContain('ACTIVATE_CURRENT_NOTICE');
  await user.click(screen.getByRole('radio',{name:/Copies do not change provenance/}));
  expect(screen.getByText(/Correct. Quantity cannot replace/)).toBeTruthy();
  await user.click(screen.getByRole('button',{name:'Start'}));
  expect(screen.getByText('SNAPSHOT 0')).toBeTruthy();
});

test('operations recovery is bounded, replayable, and never books', async () => {
  const user = userEvent.setup();
  render(<ExtendedJourney room="operations"/>);
  for(let i=0;i<8;i++) await user.click(screen.getByRole('button',{name:/Apply /}));
  expect(screen.getByText('Trace complete')).toBeTruthy();
  expect(screen.getByText('Verified')).toBeTruthy();
  expect(screen.getAllByText('not_booked').length).toBeGreaterThan(0);
  await user.click(screen.getByRole('button',{name:'Step 1'}));
  expect(screen.getByText('SNAPSHOT 1')).toBeTruthy();
  await user.click(screen.getByRole('button',{name:'Reset this study'}));
  expect(screen.getByRole('button',{name:/Apply deploy stale index/})).toBeTruthy();
});

test('security study shows the denial without shipping the staff record body', async () => {
  const user=userEvent.setup();
  render(<ExtendedJourney room="security"/>);
  expect(screen.getByText('Staff-only record: public access denied.')).toBeTruthy();
  await user.click(screen.getByRole('button',{name:/Apply the change/}));
  expect(screen.getByText(/staff rota remains inaccessible/)).toBeTruthy();
  expect(screen.getAllByText('denied').length).toBeGreaterThan(0);
});
