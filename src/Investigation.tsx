import { lazy, Suspense, useEffect, useState } from "react";
import { briefingContent } from "./briefing-lesson.ts";
import {
  correct,
  evidence,
  incidentTrace,
  makeCase,
  spaces,
  wrong,
  type Folder,
  type Space,
} from "./investigation.ts";
import { extendedSceneCue, sceneCue } from "./scene-cues.ts";
import { SceneBoundary } from "./SceneBoundary.tsx";
import type { ExtendedEvent } from "./extended.ts";
import { decisions, observations } from "./room-decisions.ts";
import "./investigation.css";

const Viewport = lazy(() =>
  import("./SceneViewport.tsx").then((module) => ({
    default: module.SceneViewport,
  })),
);
const roomEvents: Partial<Record<Space, ExtendedEvent>> = {
  records: "ACTIVATE_CURRENT_NOTICE",
  workshop: "SERVE_STALE_CACHE",
  "test-room": "RUN_CANDIDATE_EVAL",
  security: "INJECT_HOSTILE_SOURCE",
};

const route = Object.keys(spaces) as Space[];
const key = "saturday-investigation-v1";
const notice = "p-notice-1";
const passage = (id: string) =>
  briefingContent.passages.find((p) => p.id === id)?.text ?? id;
const questions: Record<Space, string> = {
  briefing: "Would you send this reply? What would you check first?",
  records: "Could the appointment notice have expired?",
  library: "Could rearranging these passages recover a missing notice?",
  "service-counter":
    "Could a calendar lookup promise the visitor an appointment?",
  workshop:
    "What will the visitor read if the service displays an older reply?",
  "test-room": "Would you release a service that passed four of five checks?",
  security: "Can a page give the public assistant access to the staff rota?",
  operations: "Why does the visitor still see the Saturday invitation?",
};
const experiments = {
  records: [
    "Compare the two dated notices",
    "Earlier notice · sessions planned",
    "Current notice · sessions suspended on 21 November. The earlier notice is superseded.",
  ],
  "service-counter": [
    "Check Tuesday availability",
    "Calendar · unchecked",
    "Tuesday lookup returned two available times. Booking confirmations issued: 0.",
  ],
  workshop: [
    "Compare the generated and displayed replies",
    "Visitor display · saved reply",
    "Generated: " + correct + " Visitor display: " + wrong,
  ],
  "test-room": [
    "Open the Saturday test result",
    "Candidate release · 4 of 5 checks passed",
    "Four checks passed. The Saturday check failed: the visitor was invited to a suspended service.",
  ],
  security: [
    "Send the page’s request through the permission check",
    "Public page requests the restricted staff rota",
    "Access denied. The public assistant can use the current public appointment notice.",
  ],
} as const;
function load(room: Space) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      value &&
      route.includes(value.origin) &&
      Array.isArray(value.notes) &&
      ["index", "cache"].includes(value.incident)
    )
      return { ...makeCase(room, value.incident), ...value } as Folder;
  } catch {}
  return makeCase(room, Math.random() < 0.5 ? "index" : "cache");
}
export function Investigation({ room }: { room: Space }) {
  const [f, save] = useState(() => load(room));
  const [depth, setDepth] = useState(false);
  const [record, inspect] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(f));
    } catch {}
  }, [f]);
  const update = (patch: Partial<Folder>, note?: string) =>
    save((prev) => ({
      ...prev,
      ...patch,
      notes: note ? [...prev.notes, spaces[room] + " · " + note] : prev.notes,
      done:
        note && !prev.done.includes(room) ? [...prev.done, room] : prev.done,
    }));
  const s = evidence(f),
    trace = incidentTrace(f);
  const trial = room === "library" ? f.experiment : null;
  const deskState = trial
    ? evidence({
        ...f,
        strategy: trial.wide ? "current-hybrid" : "hours-only",
        removed: false,
      })
    : s;
  const orderOnDesk = trial?.order ?? f.order;
  const observationOptions = observations[f.cited as keyof typeof observations];
  const supportedObservation =
    observationOptions?.[f.incident === "cache" ? 1 : 0];
  const cards = [
    ...orderOnDesk.filter((id) => deskState.retrievalIds.includes(id)),
    ...deskState.retrievalIds.filter((id) => !orderOnDesk.includes(id)),
  ];
  const moveUp = (i: number) => {
    if (i < 1) return;
    const order = [...cards];
    [order[i - 1], order[i]] = [order[i], order[i - 1]];
    if (trial) {
      update({ experiment: { ...trial, order } });
      return;
    }
    update({ order }, "Reordered the same " + order.length + " candidates.");
  };
  const retrieved = s.retrievalIds.includes(notice),
    selected = s.contextIds.includes(notice);
  const event =
    room === "operations"
      ? f.verified
        ? "VERIFY_SATURDAY_SLICE"
        : f.repair === "index"
          ? "RESTORE_CURRENT_INDEX"
          : f.repair === "cache"
            ? "INVALIDATE_CACHE"
            : null
      : f.inspected.includes(room)
        ? (roomEvents[room] ?? null)
        : null;
  const cue = event
    ? extendedSceneCue(room, event)
    : room === "library" && deskState.retrievalIds.includes(notice)
      ? null
      : sceneCue(room, deskState);
  const next = route[route.indexOf(room) + 1];
  const study = ["briefing", "library", "service-counter"].includes(room)
    ? room + "/1"
    : "study/" + room;
  const inspectRecord = (id: string) => {
    inspect(id);
    update({ first: f.first || id }, passage(id));
  };
  const search = (wide: boolean) => {
    if (trial) {
      if (!wide || trial.prediction)
        update({ experiment: { ...trial, wide, order: [] } });
      return;
    }
    update(
      { strategy: wide ? "current-hybrid" : "hours-only", order: [] },
      wide
        ? "Wider search found the current notice."
        : "Narrow search missed the current notice.",
    );
  };
  return (
    <div className="investigation">
      <header>
        <a href="#/case/briefing">AI Service House</a>
        <span>Riverside Community Services Center</span>
      </header>
      <div className="case-layout">
        <nav aria-label="Case rooms">
          {route.map((r) => (
            <a
              key={r}
              href={"#/case/" + r}
              aria-current={room === r ? "page" : undefined}
            >
              {spaces[r]}
            </a>
          ))}
        </nav>
        <main>
          <small>Saturday, 21 November 2026</small>
          <h1>{spaces[room]}</h1>
          <p>
            {f.origin === "briefing"
              ? "Saturday investigation"
              : "Independent starting snapshot · " + spaces[f.origin]}
          </p>
          <h2>{questions[room]}</h2>
          <button aria-pressed={depth} onClick={() => setDepth(!depth)}>
            {depth ? "Use flat 2D view" : "Use spatial 3D view"}
          </button>
          <section
            className={"case-board " + (depth ? "spatial" : "")}
            aria-label="Investigation desk"
          >
            {depth && (
              <SceneBoundary room={room}>
                <Suspense fallback={<p>Loading room…</p>}>
                  <Viewport
                    view={{
                      room,
                      cue,
                      noticeInContext:
                        room === "library"
                          ? deskState.retrievalIds.includes(notice)
                          : selected,
                    }}
                    desk={
                      room === "library"
                        ? { cards, moveUp, widen: () => search(true) }
                        : undefined
                    }
                    time={cue?.duration ?? 0}
                    reduced={false}
                  />
                </Suspense>
              </SceneBoundary>
            )}
            {room === "briefing" && (
              <>
                <p>
                  “Can I come this Saturday to get help with my application?”
                </p>
                <blockquote>{wrong}</blockquote>
                {f.decision ? (
                  <p>
                    Your opening decision: {f.decision}.{" "}
                    {f.decision === "Send the draft"
                      ? "The visitor plans a Saturday trip for application help."
                      : "The visitor waits while you check what is available."}
                  </p>
                ) : (
                  ["Send the draft", "Hold for checking"].map((d) => (
                    <button key={d} onClick={() => update({ decision: d }, d)}>
                      {d}
                    </button>
                  ))
                )}
                <h3>Public records</h3>
                {[
                  ["Hours page", "p-hours-1"],
                  ["Appointment notice", notice],
                ].map(([label, id]) => (
                  <button key={id} onClick={() => inspectRecord(id)}>
                    {label}
                  </button>
                ))}
                {record && <blockquote>{passage(record)}</blockquote>}
                <h3>Answer tray</h3>
                <button
                  onClick={() =>
                    update(
                      { removed: !f.removed },
                      f.removed
                        ? "Restored the notice to the tray."
                        : "Removed the notice from the tray. Search still found it.",
                    )
                  }
                >
                  {f.removed ? "Restore" : "Remove"} current notice{" "}
                  {f.removed ? "to" : "from"} tray
                </button>
              </>
            )}
            {room === "library" && (
              <>
                {trial ? (
                  <>
                    <h3>Four-card search experiment</h3>
                    <p>
                      Your case folder keeps its original search and answer tray
                      while you try this separate desk.
                    </p>
                    <fieldset>
                      <legend>What will change if you widen the search?</legend>
                      {[
                        "Only the order will change",
                        "A passage from the shelf can join the results",
                      ].map((label) => (
                        <button
                          key={label}
                          disabled={trial.wide}
                          aria-pressed={trial.prediction === label}
                          onClick={() =>
                            update({
                              experiment: { ...trial, prediction: label },
                            })
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </fieldset>
                    {trial.wide && (
                      <p>
                        Your prediction: {trial.prediction}. The wider search
                        brought the appointment notice onto the desk. Reordering
                        the four cards kept the same passages.
                      </p>
                    )}
                    <button onClick={() => update({ experiment: null })}>
                      Return to my carried case
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      update({
                        experiment: { wide: false, order: [], prediction: "" },
                      })
                    }
                  >
                    Try the four-card search
                  </button>
                )}
                {depth && (
                  <p>
                    Select a desk card to move it up one rank. Select the orange
                    shelf copy to widen the search
                    {trial && !trial.prediction
                      ? " after making your prediction"
                      : ""}
                    .
                  </p>
                )}
                <h3>On the shelf</h3>
                <blockquote>{passage(notice)}</blockquote>
                <h3>Retrieved for this question</h3>
                <ol>
                  {cards.map((id, i) => (
                    <li key={id}>
                      {passage(id)}{" "}
                      <button
                        disabled={!i}
                        aria-label={"Move up: " + passage(id)}
                        onClick={() => moveUp(i)}
                      >
                        Move up
                      </button>
                    </li>
                  ))}
                </ol>
                {!trial && (
                  <button onClick={() => search(false)}>
                    Run narrow search
                  </button>
                )}
                <button
                  disabled={!!trial && (!trial.prediction || trial.wide)}
                  onClick={() => search(true)}
                >
                  Widen search
                </button>
              </>
            )}
            {room !== "briefing" &&
              room !== "library" &&
              room !== "operations" && (
                <>
                  <blockquote>{experiments[room][1]}</blockquote>
                  <fieldset>
                    <legend>
                      {f.inspected.includes(room)
                        ? "Keep or revise your decision"
                        : "Choose what you would do"}
                    </legend>
                    {decisions[room].map(([label], i) => (
                      <button
                        key={label}
                        aria-pressed={f.choices[room] === i}
                        onClick={() =>
                          update(
                            { choices: { ...f.choices, [room]: i } },
                            label,
                          )
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </fieldset>
                  <button
                    disabled={f.choices[room] === undefined}
                    onClick={() =>
                      update(
                        { inspected: [...new Set([...f.inspected, room])] },
                        experiments[room][2],
                      )
                    }
                  >
                    {experiments[room][0]}
                  </button>
                  {f.inspected.includes(room) && (
                    <div aria-live="polite">
                      <blockquote>{experiments[room][2]}</blockquote>
                      <p>{decisions[room][f.choices[room]!]?.[1]}</p>
                    </div>
                  )}
                </>
              )}
            {room === "operations" && (
              <>
                {Object.keys(f.choices).length > 0 && (
                  <details>
                    <summary>Your decisions before this incident</summary>
                    <ul>
                      {Object.entries(decisions).map(([id, options]) => {
                        const choice = f.choices[id as Space];
                        return choice === undefined ? null : (
                          <li key={id}>
                            <strong>{spaces[id as Space]}</strong> ·{" "}
                            {options[choice][0]}. {options[choice][1]}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
                <p>Incident report · visitor’s screen before repair</p>
                <blockquote>{wrong}</blockquote>
                <fieldset>
                  <legend>Choose one incident record to cite</legend>
                  {[
                    ["index", "Records and deployed candidates"],
                    ["cache", "Generated and displayed replies"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={f.cited === id}
                      onClick={() =>
                        update({ cited: id, observation: "", submitted: false })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </fieldset>
                {f.cited && (
                  <blockquote>
                    {f.cited === "index"
                      ? "Before repair: current notice on file. Deployed candidates " +
                        (f.incident === "index" ? "omit" : "include") +
                        " the notice."
                      : "Before repair: generated “" +
                        (f.incident === "cache" ? correct : wrong) +
                        "” Displayed “" +
                        wrong +
                        "”"}
                  </blockquote>
                )}
                {observationOptions && (
                  <fieldset>
                    <legend>Which observation does your record support?</legend>
                    {observationOptions.map((label) => (
                      <button
                        key={label}
                        aria-pressed={f.observation === label}
                        onClick={() =>
                          update({ observation: label, submitted: false })
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </fieldset>
                )}
                <fieldset>
                  <legend>
                    Which alternative can you rule out in this two-cause
                    incident?
                  </legend>
                  {[
                    ["index", "A missing index entry"],
                    ["cache", "A stale visitor display"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={f.ruledOut === id}
                      onClick={() => update({ ruledOut: id, submitted: false })}
                    >
                      {label}
                    </button>
                  ))}
                </fieldset>
                <label>
                  Diagnosis{" "}
                  <select
                    value={f.diagnosis}
                    onChange={(e) =>
                      update({ diagnosis: e.target.value, submitted: false })
                    }
                  >
                    <option value="">Choose a cause</option>
                    <option value="index">Missing indexed evidence</option>
                    <option value="cache">Stale visitor display</option>
                  </select>
                </label>
                <label>
                  Explain how your cited record distinguishes the causes
                  (optional)
                  <textarea
                    value={f.written}
                    onChange={(e) => update({ written: e.target.value })}
                  />
                </label>
                <fieldset>
                  <legend>Try a repair from the incident snapshot</legend>
                  {[
                    ["index", "Restore the deployed index"],
                    ["cache", "Invalidate the dependent cache"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() =>
                        update(
                          {
                            repair: id,
                            verified: false,
                            checkedCandidates: false,
                            submitted: false,
                          },
                          label,
                        )
                      }
                    >
                      {label}
                    </button>
                  ))}
                </fieldset>
                {f.repair && (
                  <>
                    <button
                      onClick={() =>
                        update(
                          { checkedCandidates: true },
                          "After repair: deployed candidates " +
                            (trace.candidates ? "include" : "omit") +
                            " the current notice.",
                        )
                      }
                    >
                      Inspect repaired candidates
                    </button>
                    {f.checkedCandidates && (
                      <p>
                        Current notice {trace.candidates ? "present" : "absent"}
                        .
                      </p>
                    )}
                    <button
                      onClick={() =>
                        update(
                          { verified: true },
                          "After repair, the visitor saw: " + trace.displayed,
                        )
                      }
                    >
                      Check the visitor’s screen
                    </button>
                    {f.verified && <blockquote>{trace.displayed}</blockquote>}
                  </>
                )}
                <button
                  disabled={
                    !f.observation || !f.ruledOut || !f.diagnosis || !f.verified
                  }
                  onClick={() => update({ submitted: true })}
                >
                  Score investigation
                </button>
                {f.submitted && (
                  <>
                    <ul>
                      {[
                        [
                          "Supported observation",
                          f.observation === supportedObservation,
                        ],
                        [
                          "Alternative ruled out",
                          f.observation === supportedObservation &&
                            f.ruledOut !== f.incident,
                        ],
                        ["Diagnosis", f.diagnosis === f.incident],
                        [
                          "Verified repair",
                          trace.displayed === correct &&
                            (f.incident === "cache" || f.checkedCandidates),
                        ],
                      ].map(([label, ok]) => (
                        <li key={String(label)}>
                          {label}: {ok ? "1" : "0"} / 1
                        </li>
                      ))}
                    </ul>
                    <p>
                      Your cited record supports this observation:{" "}
                      {supportedObservation}
                    </p>
                    <p>
                      Your opening decision:{" "}
                      {f.decision || "No decision recorded"}. First record:{" "}
                      {f.first ? passage(f.first) : "None inspected"}. Would you
                      send the original draft now?
                    </p>
                    {f.written && (
                      <>
                        <h3>Review your explanation</h3>
                        <blockquote>{f.written}</blockquote>
                        <p>
                          {"Read your explanation beside the observation supported by your chosen record: " +
                            supportedObservation}
                        </p>
                        <label>
                          Which detail in your explanation rules out the other
                          cause? Revise your reasoning here.
                          <textarea
                            value={f.reflection}
                            onChange={(e) =>
                              update({ reflection: e.target.value })
                            }
                          />
                        </label>
                      </>
                    )}
                    <label>
                      What would you tell the visitor now?
                      <textarea
                        value={f.revised}
                        onChange={(e) => update({ revised: e.target.value })}
                      />
                    </label>
                    <button
                      onClick={() =>
                        save({
                          ...makeCase(
                            f.origin,
                            f.incident === "index" ? "cache" : "index",
                          ),
                          choices: f.choices,
                          inspected: f.inspected,
                          experiment: f.experiment,
                          decision: f.decision,
                          first: f.first,
                          notes: f.notes,
                          done: f.done,
                          removed: f.removed,
                          strategy: f.strategy,
                          order: f.order,
                        })
                      }
                    >
                      Investigate the other incident
                    </button>
                  </>
                )}
              </>
            )}
          </section>
          <details open={room !== "briefing" && room !== "operations"}>
            <summary>Case folder</summary>
            {room === "operations" && (
              <h3>Evidence carried from the training rooms</h3>
            )}
            <p>
              Current notice · on file →{" "}
              {retrieved ? "retrieved" : "missed by search"} →{" "}
              {selected ? "in answer tray" : "absent from answer tray"}
            </p>
            <p>{s.answer.text}</p>
            {f.notes.length > 0 && (
              <ol>
                {f.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ol>
            )}
          </details>
          {room === "briefing" && f.removed && (
            <p>
              <a href="#/case/library">
                Check whether search found the notice →
              </a>
            </p>
          )}
          {room === "library" && !trial && !retrieved && (
            <p>
              <a href="#/case/records">
                Check whether the notice still exists →
              </a>
            </p>
          )}
          {room === "library" && !trial &&
            retrieved &&
            !selected && (
              <p>
                <a href="#/case/briefing">
                  Return the retrieved notice to the answer tray →
                </a>
              </p>
            )}
          <footer>
            {next && (
              <a href={"#/case/" + next}>Continue to {spaces[next]} →</a>
            )}{" "}
            <a href={"#/" + study}>Explore independent room lesson</a>
          </footer>
        </main>
      </div>
    </div>
  );
}
