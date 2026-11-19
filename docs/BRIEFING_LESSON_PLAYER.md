# Briefing lesson player

## Implemented learning sequence

The first room is a focused visual lesson at `#/briefing/1` through `#/briefing/5`. It follows the visitor's ambiguous Saturday question, the public task boundary, selected source context, removal of the current notice, and comparison of the resulting answer. Each route is a stable snapshot; the presentation progress is independent of the case state. The timeline, Back and Next buttons, and arrow keys navigate the same five snapshots.

| Step | Visitor observes | Case fact |
| --- | --- | --- |
| Receive | Visitor question crosses to the desk | Reception and application-help are distinct intents. |
| Task | Public task brief appears | Source text supplies evidence, not authority over instructions. |
| Context | Current notice reaches the answer context | Saturday suspension is supported by a selected passage. |
| Remove | Selected card leaves the context tray | Notice remains a current public record and retrieval candidate; appointment status is unverified from this context. |
| Compare | Answer station is highlighted | Reception remains supported; no appointment is booked. |

`briefingSnapshot()` derives every step from the validated public content and canonical scenario transition. The SVG's role, caption, and status chips describe that snapshot; the animation clock never emits a scenario event. The existing skinned-human GLB is available as an optional vignette, loaded after the primary diagram. A failed 3D asset does not block the lesson.

## Interaction and access

- Replay, Pause/Play, Skip motion, and a range scrubber change only the illustration. The reduced-motion control stores a preference and presents completed static poses.
- Each step has an optional browser speech narration. It starts only after Play, exposes Pause, Resume, Stop, and speed, and cancels when the step changes or the player unmounts. The complete script is visible in an expanded transcript. Narration is independent of animation timing and never advances the case. Voice availability and pronunciation vary by browser and device; the site provides no recorded or generated audio file.
- The evidence drawer presents the exact public passage, selected-context status, claim support, and booking status. It does not receive staff-only fixture text. Escape closes it, Tab stays inside it, and focus returns to its trigger.
- Prediction before the removal and a final explanation check require the learner to distinguish a missing selected passage from a deleted record.
- The skip button moves focus to the guide without changing the hash route. The diagram has a full text alternative; status and controls remain semantic HTML.
- Visited steps persist locally. The content and results are fictional; no analytics service or external booking tool is used.
- Step five presents the two exact derived answer texts side by side, with claim and booking labels, so the promised comparison is directly inspectable.

## Audio research decisions

The Web Speech API provides `speak`, `pause`, `resume`, `cancel`, utterance events, and speech-rate controls. Speech synthesis voices are selected by the browser and platform; a failed or unsupported speech service leaves the transcript and lesson usable. We do not autoplay audio. W3C guidance calls for text alternatives and controls for audio; the visible script and independent Play/Stop controls are the baseline here. Browser voice quality, pronunciation, and interaction with screen readers need device review before claiming an accessible audio experience.

Sources reviewed 19 November 2026: [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), [MDN SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance), [W3C WAI planning audio and video](https://www.w3.org/WAI/media/av/planning/), [W3C WAI audio control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html).

## Verification and remaining gate

The engine and DOM tests cover the five snapshots, selected-passage support, source persistence, no-booking invariant, reduced motion, focus, and motion-independent facts. `npm run check` validates content, tests, TypeScript, bundle, and restricted-content exclusion. The browser smoke script additionally checks desktop and narrow viewport behavior when Chromium is available. The lesson has not yet had observed learner or representative-device review; its four-minute estimate and visual comprehension remain hypotheses. The same player pattern should be evaluated with learners before the remaining seven rooms are migrated.
