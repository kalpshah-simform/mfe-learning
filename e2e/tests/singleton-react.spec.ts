import { test, expect } from "@playwright/test";
import { CONTAINER_URL } from "./helpers";

// SG14 Key Topic 4: "Only one instance of React (and other singleton shared
// deps) is active at runtime across Container + mounted remotes"
//
// shared/store.js's __id (a random number set once at module load) is this
// codebase's own dedup probe: every remote that mounts logs
// "shared/store __id in <app>: <id>" on mount. Module Federation's `shared`
// config declares react/react-dom/the store as singletons, so if dedup is
// actually working, every remote observes the SAME __id within one page
// session — a different id would mean that remote loaded its own copy of
// the "shared" module (and, per the same shared config, likely its own
// React) instead of reusing the host's.
//
// Important: this only holds within a single page session. A full page
// reload (page.goto after the first navigation) creates a fresh JS realm
// and re-evaluates shared/store.js from scratch, producing a new __id — that
// would be a false positive for "not deduped", not a real one. So this test
// does exactly one page.goto and only uses in-app navigation after that.

function extractId(messages: string[], label: string): number | undefined {
  const line = messages.find((m) => m.includes(`__id in ${label}:`));
  if (!line) return undefined;
  const match = line.match(/__id in [\w-]+:\s*(\S+)/);
  return match ? Number(match[1]) : undefined;
}

test("the shared store singleton has the same __id across every mounted remote", async ({
  page,
}) => {
  const messages: string[] = [];
  page.on("console", (msg) => messages.push(msg.text()));

  // Single page load, landing on Auth's index page (mounts AuthLandingPage,
  // which logs mfe-auth's __id).
  await page.goto(`${CONTAINER_URL}/auth`);
  await expect.poll(() => extractId(messages, "mfe-auth")).toBeDefined();

  // In-app navigation only from here: click into the login form and sign in,
  // which client-side-navigates to /dashboard (mounts OverviewPage, which
  // logs mfe-dashboard's __id) without ever reloading the page.
  await page.getByRole("link", { name: "Log in" }).click();
  await page.locator("#login-email").fill("tester@example.com");
  await page.locator("#login-password").fill("password123");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(`${CONTAINER_URL}/dashboard`);
  await expect.poll(() => extractId(messages, "mfe-dashboard")).toBeDefined();

  const authId = extractId(messages, "mfe-auth");
  const dashboardId = extractId(messages, "mfe-dashboard");
  expect(authId).toBe(dashboardId);
});
