// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SliceLessonPlayer } from '../src/SliceLessonPlayer.tsx';

beforeEach(()=>{localStorage.clear();location.hash='#/library/3'});
afterEach(()=>cleanup());

test('library miss is visible before motion and precise in the evidence drawer',async()=>{
 const user=userEvent.setup();
 render(<SliceLessonPlayer room="library" requestedStep={3}/>);
 expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/absent from the retrieved candidate set/);
 await user.click(screen.getByRole('button',{name:'Skip motion'}));
 expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Booking remains not booked');
 await user.click(screen.getByRole('button',{name:/Inspect exact evidence/}));
 const dialog=screen.getByRole('dialog');
 expect(dialog.textContent).toContain('CURRENT RECORD · ABSENT FROM CANDIDATES');
 expect(dialog.textContent).toContain('not_booked');
 expect(dialog.textContent).not.toContain('p-rota-1');
 fireEvent.keyDown(window,{key:'Escape'});
 expect(screen.queryByRole('dialog')).toBeNull();
});

test('counter proposal and timeout remain unbooked, including reduced motion',async()=>{
 const user=userEvent.setup();
 const view=render(<SliceLessonPlayer room="service-counter" requestedStep={3}/>);
 expect(screen.getByRole('img').getAttribute('aria-label')).toContain('One Tuesday time is proposed');
 expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Booking remains not booked');
 await user.click(screen.getByRole('button',{name:'Reduce motion'}));
 expect(screen.getByRole('slider',{name:'Motion position'}).hasAttribute('disabled')).toBe(true);
 view.rerender(<SliceLessonPlayer room="service-counter" requestedStep={4}/>);
 expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Calendar status: timeout');
 expect(screen.getByRole('img').getAttribute('aria-label')).toContain('no current proposal');
 await user.click(screen.getByRole('button',{name:/Inspect exact evidence/}));
 expect(screen.getByRole('dialog').textContent).toContain('NO BOOKING WRITE EXISTS');
});
