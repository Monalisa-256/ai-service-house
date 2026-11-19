import { briefingContent as content } from "./briefing-lesson.ts";
import { initialState, transition } from "./scenario.ts";

export const spaces = {
  briefing: "Briefing desk",
  records: "Records room",
  library: "Reference library",
  "service-counter": "Service counter",
  workshop: "Experience workshop",
  "test-room": "Test room",
  security: "Security checkpoint",
  operations: "Operations room",
};
export type Space = keyof typeof spaces;
export const wrong = "Yes, come Saturday between 9 and 12.";
export const correct =
  "Reception is open Saturday from 9 to 12 for general information. Application-help appointments are suspended on 21 November.";
export type Incident = "index" | "cache";
export const makeCase = (origin: Space, incident: Incident) => ({
  origin,
  incident,
  decision: "",
  first: "",
  strategy: origin === "library" ? "hours-only" : "current-hybrid",
  removed: false,
  order: [] as string[],
  notes: [] as string[],
  done: [] as Space[],
  cited: "",
  diagnosis: "",
  repair: "",
  written: "",
  revised: "",
  verified: false,
  checkedCandidates: false,
  submitted: false,
});
export type Folder = ReturnType<typeof makeCase>;
export function evidence(f: Folder) {
  let s = transition(content, initialState(content), {
    type: "SET_RETRIEVAL_STRATEGY",
    strategyId: f.strategy,
  });
  if (f.removed && s.contextIds.includes("p-notice-1"))
    s = transition(content, s, {
      type: "REMOVE_DOCUMENT_FROM_CONTEXT",
      documentId: "doc-notice-v2",
    });
  return s;
}
export function incidentTrace(f: Folder) {
  const candidates = f.incident === "cache" || f.repair === "index";
  const generated = candidates ? correct : wrong;
  const displayed =
    f.incident === "cache" && f.repair !== "cache" ? wrong : generated;
  return { candidates, generated, displayed };
}
