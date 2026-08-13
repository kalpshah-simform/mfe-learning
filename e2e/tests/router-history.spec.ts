import { test, expect } from "@playwright/test";
import { CONTAINER_URL } from "./helpers";

// SG14 Key Topic 4: "Shared router: navigation into/out of a remote
// preserves browser history correctly, no duplicate BrowserRouter"
//
// Container is the only app that renders a <BrowserRouter> — remotes use
// react-router's in-memory router and report navigation up via onNavigate.
// Note on actual behavior (verified below): App.tsx's onNavigate handler
// calls `navigate(fullPath, { replace: true })`, so in-remote sub-page
// navigation (e.g. Marketing's Home -> About) updates the visible URL but
// does NOT push a new browser history entry — only navigation driven by
// Container's own <Link> (moving between remotes, or the auth-gating
// redirect) does. This test checks both halves of that behavior rather
// than assuming push semantics everywhere.

test.describe("shared router / browser history", () => {
  test("in-remote navigation updates the visible URL", async ({ page }) => {
    await page.goto(`${CONTAINER_URL}/marketing`);
    await expect(page.getByRole("heading", { name: "Marketing" })).toBeVisible();

    await page.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(`${CONTAINER_URL}/marketing/about`);
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();

    await page.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(`${CONTAINER_URL}/marketing/pricing`);
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
  });

  test("navigating between remotes via Container's own nav is a real, back/forward-able history entry", async ({
    page,
  }) => {
    await page.goto(`${CONTAINER_URL}/marketing`);
    await page.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login/); // signed out -> gated, still a real nav

    await page.goBack();
    await expect(page).toHaveURL(`${CONTAINER_URL}/marketing`);
    await expect(page.getByRole("heading", { name: "Marketing" })).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("no duplicate app shell / BrowserRouter — exactly one Container header renders throughout navigation", async ({
    page,
  }) => {
    await page.goto(`${CONTAINER_URL}/marketing`);
    await expect(page.locator("header")).toHaveCount(1);

    await page.getByRole("link", { name: "About" }).click();
    await expect(page.locator("header")).toHaveCount(1);

    await page.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator("header")).toHaveCount(1);
  });
});
