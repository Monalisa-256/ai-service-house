// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { Investigation } from "../src/Investigation.tsx";
import { makeCase } from "../src/investigation.ts";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
test("folder survives independent room mounts and distinguishes a search miss", async () => {
  const user = userEvent.setup();
  render(<Investigation room="briefing" />);
  await user.click(screen.getByText("Hold for checking"));
  await user.click(screen.getByRole("button", { name: "Appointment notice" }));
  await user.click(screen.getByText("Remove current notice from tray"));
  cleanup();
  render(<Investigation room="library" />);
  expect(screen.getByText(/on file → retrieved → absent/)).toBeTruthy();
  await user.click(screen.getByText("Run narrow search"));
  const buttons = screen.getAllByRole("button", { name: /Move up:/ });
  expect(buttons).toHaveLength(4);
  await user.click(buttons[2]);
  expect(screen.getByText(/on file → missed by search → absent/)).toBeTruthy();
  await user.click(screen.getByText("Widen search"));
  expect(screen.getByText(/on file → retrieved → absent/)).toBeTruthy();
});
test.each(["index", "cache"] as const)(
  "diagnoses and verifies %s incident",
  async (cause) => {
    localStorage.setItem(
      "saturday-investigation-v1",
      JSON.stringify(makeCase("operations", cause)),
    );
    const user = userEvent.setup();
    render(<Investigation room="operations" />);
    await user.click(
      screen.getByText(
        cause === "index"
          ? "Records and deployed candidates"
          : "Generated and displayed replies",
      ),
    );
    await user.click(
      screen.getByRole("button", {
        name:
          cause === "index"
            ? "The deployed candidates omit the current notice."
            : "The generated reply corrects the invitation, but the display still shows it.",
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name:
          cause === "index"
            ? "A stale visitor display"
            : "A missing index entry",
      }),
    );
    await user.selectOptions(screen.getByRole("combobox"), cause);
    await user.click(
      screen.getByText(
        cause === "index"
          ? "Restore the deployed index"
          : "Invalidate the dependent cache",
      ),
    );
    await user.click(screen.getByText("Inspect repaired candidates"));
    await user.click(screen.getByText("Check the visitor’s screen"));
    await user.click(screen.getByText("Score investigation"));
    expect(screen.getByText("Verified repair: 1 / 1")).toBeTruthy();
    cleanup();
    render(<Investigation room="operations" />);
    expect(
      screen.getByText(/After repair, the visitor saw: Reception is open/),
    ).toBeTruthy();
  },
);
