// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioNarration } from '../src/AudioNarration.tsx';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('audio is opt-in, has a readable script, and stops on lesson change', async () => {
  const speak = vi.fn();
  const cancel = vi.fn();
  const pause = vi.fn();
  const resume = vi.fn();
  vi.stubGlobal('speechSynthesis', { speak, cancel, pause, resume });
  class Utterance { text: string; lang = ''; rate = 1; onend?: () => void; onerror?: () => void; constructor(text: string) { this.text = text; } }
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  const user = userEvent.setup();
  const view = render(<AudioNarration key="one" title="First" script="The first exact script."/>);
  expect(screen.getByText('The first exact script.')).toBeTruthy();
  expect(speak).not.toHaveBeenCalled();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Narration speed' }), '1.2');
  await user.click(screen.getByRole('button', { name: 'Play narration' }));
  expect(speak).toHaveBeenCalledTimes(1);
  expect(speak.mock.calls[0][0]).toMatchObject({ text: 'The first exact script.', lang: 'en', rate: 1.2 });
  await user.click(screen.getByRole('button', { name: 'Pause narration' }));
  expect(pause).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole('button', { name: 'Resume narration' }));
  expect(resume).toHaveBeenCalledTimes(1);
  view.rerender(<AudioNarration key="two" title="Second" script="The second exact script."/>);
  expect(cancel).toHaveBeenCalled();
  expect(screen.getByText('The second exact script.')).toBeTruthy();
  expect(speak).toHaveBeenCalledTimes(1);
});

test('text remains usable without speech synthesis', () => {
  vi.stubGlobal('speechSynthesis', undefined);
  render(<AudioNarration title="First" script="A visible transcript."/>);
  expect(screen.getByText('A visible transcript.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Play narration' }).hasAttribute('disabled')).toBe(true);
});
