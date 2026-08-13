import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CONTAINER_URL, signIn } from "./helpers";

// SG14 Key Topic 4: "After a version bump, Container fetches the new
// remoteEntry.js rather than a stale cached one"
//
// Two parts to this contract: (1) the server must tell the browser not to
// cache remoteEntry.js at all (see federationCacheHeaders() in each remote's
// vite.config.ts) — otherwise the browser itself would keep serving an old
// cached copy after a redeploy — and (2) a rebuild must actually be picked
// up end-to-end by the container on the next load, not just in theory.

const here = path.dirname(fileURLToPath(import.meta.url));
const dashboardDir = path.resolve(here, "../../mfe-dashboard");
const overviewPagePath = path.join(dashboardDir, "src/pages/OverviewPage.tsx");
const PROBE_TEXT = "Summary widgets would go here (e2e probe).";

test("a remote's remoteEntry.js is served with no-cache headers", async ({
  page,
}) => {
  // Specifically mfe-auth's remoteEntry.js (port 5174) — Container also
  // fetches its own remoteEntry.js as part of federation init, but that one
  // isn't the subject of this check (see finding below).
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("localhost:5174/remoteEntry.js")),
    signIn(page, CONTAINER_URL),
  ]);
  const cacheControl = response.headers()["cache-control"] ?? "";
  expect(cacheControl).toContain("no-cache");
  expect(cacheControl).toContain("no-store");
  expect(cacheControl).toContain("must-revalidate");
});

test("after a rebuild, the container serves the new remote content on the next load — not a stale cached one", async ({
  page,
}) => {
  const original = readFileSync(overviewPagePath, "utf8");

  try {
    // Sanity check: the probe text isn't already present (would make the
    // assertion below meaningless).
    await signIn(page, CONTAINER_URL);
    await expect(page.getByText(PROBE_TEXT)).toHaveCount(0);

    writeFileSync(
      overviewPagePath,
      original.replace("Summary widgets would go here.", PROBE_TEXT),
      "utf8",
    );
    execFileSync("npm", ["run", "build"], { cwd: dashboardDir, stdio: "pipe" });

    await page.reload();
    await expect(page.getByText(PROBE_TEXT)).toBeVisible();
  } finally {
    writeFileSync(overviewPagePath, original, "utf8");
    execFileSync("npm", ["run", "build"], { cwd: dashboardDir, stdio: "pipe" });
  }
});
