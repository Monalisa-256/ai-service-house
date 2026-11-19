// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinalChallenge } from '../src/FinalChallenge.tsx';
import { ExtendedJourney } from '../src/ExtendedJourney.tsx';

afterEach(()=>{cleanup();localStorage.clear();});

test('diagnostic waits for all layers and scores authored answers with explanations', async()=>{
  const user=userEvent.setup();render(<FinalChallenge/>);
  expect(screen.getByRole('button',{name:/Review diagnosis/}).hasAttribute('disabled')).toBe(true);
  for(const name of [
    /public task brief sets the boundary/,
    /Reception is open for general information/,
    /deployed index omitted the current notice/,
    /stale answer cache can mask/,
    /4\/5 aggregate still fails/,
    /possible slot or proposal is not/,
    /staff record remains restricted/,
    /Contain rollout, restore the current index/
  ]) await user.click(screen.getByRole('radio',{name}));
  await user.click(screen.getByRole('button',{name:/Review diagnosis/}));
  expect(screen.getByRole('heading',{name:'9 / 9 rubric points'})).toBeTruthy();
  expect(screen.getByText(/A critical slice failure blocks release/)).toBeTruthy();
});

test('extended room keeps complete HTML case study when 3D is hidden', async()=>{
  localStorage.clear();const user=userEvent.setup();render(<ExtendedJourney room="security"/>);
  expect(screen.getByRole('region',{name:'Human-scale room illustration'})).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Fixture register'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Show 3D room'}).getAttribute('aria-expanded')).toBe('false');
  expect(screen.getByRole('link',{name:/Open the final Saturday diagnostic/})).toBeTruthy();
  await user.click(screen.getByRole('button',{name:'Apply the change'}));
  expect(screen.getByRole('status').textContent).toContain('staff rota remains inaccessible');
  expect(screen.getByRole('button',{name:'Reset this study'})).toBeTruthy();
});
