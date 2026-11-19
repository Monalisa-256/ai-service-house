import test from "node:test";
import assert from "node:assert/strict";
import {
  correct,
  evidence,
  incidentTrace,
  makeCase,
  wrong,
} from "../src/investigation.ts";

test("identical unverified answers leave different evidence trails", () => {
  const start = makeCase("briefing", "index");
  const removed = evidence({ ...start, removed: true });
  const missed = evidence({ ...start, strategy: "hours-only" });
  assert.equal(removed.answer.text, missed.answer.text);
  assert.equal(removed.retrievalIds.includes("p-notice-1"), true);
  assert.equal(missed.retrievalIds.includes("p-notice-1"), false);
  assert.equal(missed.retrievalIds.length, 4);
});
test("each incident needs its own repair at the visitor screen", () => {
  for (const cause of ["index", "cache"] as const) {
    const f = makeCase("operations", cause);
    assert.equal(incidentTrace(f).displayed, wrong);
    assert.equal(
      incidentTrace({ ...f, repair: cause === "index" ? "cache" : "index" })
        .displayed,
      wrong,
    );
    assert.equal(incidentTrace({ ...f, repair: cause }).displayed, correct);
  }
});
