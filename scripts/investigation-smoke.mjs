import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { chromium } from "playwright-core";
import { PerspectiveCamera, Vector3 } from "three";

const launch = () =>
  chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: JSON.parse(process.env.CHROMIUM_ARGS || '["--no-sandbox"]'),
  });
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".glb": "model/gltf-binary",
};
async function exercise(width, spatial) {
  const browser = await launch();
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    hasTouch: width < 500,
    isMobile: width < 500,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://case.test/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const file = resolve("dist", "." + (path === "/" ? "/index.html" : path));
    await route.fulfill({
      body: await readFile(file),
      contentType: types[extname(file)],
    });
  });
  const click = async (name) =>
    page.getByRole("button", { name, exact: true }).click();
  const room = async (name) =>
    page.getByRole("navigation").getByText(name, { exact: true }).click();
  const folder = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("saturday-investigation-v1")),
    );
  try {
    await page.goto("https://case.test/");
    await click("Hold for checking");
    await click("Hours page");
    await click("Remove current notice from tray");
    await room("Reference library");
    await click("Try the four-card search");
    if (spatial)
      await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("library.glb")),
        click("Use spatial 3D view"),
      ]);
    const moves = page.getByRole("button", { name: /Move up:/ });
    assert.equal(await moves.count(), 4);
    const initial = await moves.nth(1).getAttribute("aria-label");
    async function hitMesh(position) {
      const canvas = page.locator("canvas");
      await canvas.scrollIntoViewIfNeeded();
      const box = await canvas.boundingBox();
      const camera = new PerspectiveCamera(39, box.width / box.height);
      camera.position.set(4.8, 3.5, 6.2);
      camera.lookAt(0, 1.1, 0);
      camera.updateMatrixWorld();
      const point = new Vector3(...position).project(camera);
      const x = box.x + ((point.x + 1) * box.width) / 2,
        y = box.y + ((1 - point.y) * box.height) / 2;
      if (width < 500) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
    }
    if (spatial) {
      await page.evaluate(
        () =>
          new Promise((done) =>
            requestAnimationFrame(() => requestAnimationFrame(done)),
          ),
      );
      await hitMesh([-0.85, 1.09, 0.82]);
    } else await moves.nth(1).click();
    await page.waitForFunction(
      (label) =>
        document
          .querySelector('button[aria-label^="Move up:"]')
          ?.getAttribute("aria-label") === label,
      initial,
      { timeout: 4000 },
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Widen search", exact: true })
        .isDisabled(),
      true,
    );
    await click("A passage from the shelf can join the results");
    if (spatial) await hitMesh([1.88, 1.47, -0.67]);
    else await click("Widen search");
    await page.getByText(/Your prediction:/).waitFor();
    await click("Return to my carried case");
    assert.equal((await folder()).removed, true);
    assert.deepEqual((await folder()).order, []);
    for (const [place, first, inspect, revision] of [
      [
        "Records room",
        "Use the earlier notice",
        "Compare the two dated notices",
        "Use the current notice",
      ],
      [
        "Service counter",
        "Tell the visitor they are booked",
        "Check Tuesday availability",
        "Offer a Tuesday time",
      ],
      [
        "Experience workshop",
        "Serve the saved reply",
        "Compare the generated and displayed replies",
        "Refresh the visitor display",
      ],
      [
        "Security checkpoint",
        "Request access to the rota",
        "Send the page’s request through the permission check",
        "Use the public notice",
      ],
    ]) {
      await room(place);
      await click(first);
      await click(inspect);
      await click(revision);
    }
    await room("Test room");
    await click("Release the candidate");
    await click("Open the Saturday test result");
    await click("Hold the release");
    await room("Operations room");
    await page.getByText("Your decisions before this incident").click();
    await page.getByText(/Hold the release\. The candidate stays/).waitFor();
    for (let i = 0; i < 2; i++) {
      const missing = (await folder()).incident === "index";
      await click(
        missing
          ? "Generated and displayed replies"
          : "Records and deployed candidates",
      );
      await click(
        missing
          ? "The generated and displayed replies both invite the visitor."
          : "The deployed candidates include the current notice.",
      );
      await click(
        missing ? "A stale visitor display" : "A missing index entry",
      );
      await page
        .getByLabel(/Explain how your cited record/)
        .fill(
          missing
            ? "Both replies invite the visitor, so the mismatch was already present before display."
            : "The indexed notice was retrieved, which rules out a missing index entry.",
        );
      await page
        .getByRole("combobox")
        .selectOption(missing ? "index" : "cache");
      await click(
        missing
          ? "Restore the deployed index"
          : "Invalidate the dependent cache",
      );
      await click("Inspect repaired candidates");
      await click("Check the visitor’s screen");
      await click("Score investigation");
      for (const criterion of [
        "Supported observation",
        "Alternative ruled out",
        "Diagnosis",
        "Verified repair",
      ])
        await page.getByText(criterion + ": 1 / 1", { exact: true }).waitFor();
      await page
        .getByLabel(/Which detail in your explanation/)
        .fill("I compared the record with the visitor’s reply.");
      if (!i) await click("Investigate the other incident");
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.deepEqual(errors, []);
    console.log(width + "px " + (spatial ? "3D" : "2D") + " passed");
  } finally {
    await browser.close();
  }
}
for (const width of [1440, 390])
  for (const spatial of [false, true]) await exercise(width, spatial);
