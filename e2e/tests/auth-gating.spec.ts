import { test, expect } from "@playwright/test";
import { CONTAINER_URL, signIn } from "./helpers";

// SG14 Key Topic 4: "Auth gating: Dashboard reflects Container's isSignedIn
// state correctly; protected routes redirect when signed out"

test.describe("auth gating", () => {
  test("redirects to /auth/login when visiting /dashboard signed out", async ({
    page,
  }) => {
    await page.goto(`${CONTAINER_URL}/dashboard`);
    await expect(page).toHaveURL(/\/auth\/login\?redirect=/);
  });

  test("redirects to /auth/login when visiting /settings signed out", async ({
    page,
  }) => {
    await page.goto(`${CONTAINER_URL}/settings`);
    await expect(page).toHaveURL(/\/auth\/login\?redirect=/);
  });

  test("grants access to /dashboard after signing in, and preserves the original redirect target", async ({
    page,
  }) => {
    await page.goto(`${CONTAINER_URL}/dashboard`);
    await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fdashboard/);

    await page.locator("#login-email").fill("tester@example.com");
    await page.locator("#login-password").fill("password123");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page).toHaveURL(`${CONTAINER_URL}/dashboard`);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("redirects away from /auth back to /dashboard once already signed in", async ({
    page,
  }) => {
    await signIn(page, CONTAINER_URL);
    await expect(page).toHaveURL(`${CONTAINER_URL}/dashboard`);

    await page.goto(`${CONTAINER_URL}/auth`);
    await expect(page).toHaveURL(`${CONTAINER_URL}/dashboard`);
  });
});
