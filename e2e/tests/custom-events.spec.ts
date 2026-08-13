import { test, expect } from "@playwright/test";
import { CONTAINER_URL, signIn } from "./helpers";

// SG14 Key Topic 4: "Cross-app CustomEvent contracts: an emitted event is
// received correctly, and listeners are removed on unmount (no leaks)"
//
// mfe-dashboard listens for a window-level 'auth:login' CustomEvent while
// mounted (src/dashboard.tsx: mount() adds the listener, unmount() removes
// it) and logs "auth:login received" when it fires. This dispatches that
// same event manually (rather than waiting on mfe-auth's real 500ms
// auto-fire) to test reception and cleanup precisely.

test.describe("cross-app CustomEvent contract (auth:login)", () => {
  test("a dispatched event is received while dashboard is mounted", async ({
    page,
  }) => {
    await signIn(page, CONTAINER_URL);
    await expect(page).toHaveURL(`${CONTAINER_URL}/dashboard`);
    // Wait for the dashboard remote to actually finish mounting (its
    // window.addEventListener runs synchronously inside mount(), before
    // this renders) — otherwise the URL can update before the listener is
    // attached, and the dispatch below would race it.
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

    const messages: string[] = [];
    page.on("console", (msg) => messages.push(msg.text()));

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("auth:login", { detail: { userId: "e2e-test" } }),
      );
    });

    await expect
      .poll(() => messages.some((m) => m.includes("auth:login received")))
      .toBe(true);
  });

  test("the listener is removed on unmount — a dispatch after navigating away is not handled", async ({
    page,
  }) => {
    await signIn(page, CONTAINER_URL);
    await expect(page).toHaveURL(`${CONTAINER_URL}/dashboard`);

    // Navigate away so dashboard unmounts (and removes its listener).
    await page.getByRole("link", { name: "Marketing" }).click();
    await expect(page.getByRole("heading", { name: "Marketing" })).toBeVisible();

    const messages: string[] = [];
    page.on("console", (msg) => messages.push(msg.text()));

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("auth:login", { detail: { userId: "e2e-test-2" } }),
      );
    });

    // Give any (incorrectly leaked) listener a moment to fire, then assert
    // it didn't.
    await page.waitForTimeout(300);
    expect(messages.some((m) => m.includes("auth:login received"))).toBe(
      false,
    );
  });
});
