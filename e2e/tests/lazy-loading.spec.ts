import { test, expect } from "@playwright/test";
import { CONTAINER_URL, signIn } from "./helpers";

// SG14 Key Topic 4: "Lazy-loaded remotes show a loading state and don't
// block unrelated routes"

test.describe("lazy loading", () => {
  test("shows a loading indicator while a remote's chunk is fetched", async ({
    page,
  }) => {
    await signIn(page, CONTAINER_URL);
    await page.goto(`${CONTAINER_URL}/marketing`);

    // Delay the dashboard remote's own JS so the loading state is observable.
    await page.route(/localhost:5175\/assets\/.*\.js/, async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.continue();
    });

    const navigation = page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.locator("output")).toBeVisible();
    await navigation;
    await expect(page.locator("output")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("a slow-loading remote does not block navigation to an unrelated route", async ({
    page,
  }) => {
    await signIn(page, CONTAINER_URL);
    await page.goto(`${CONTAINER_URL}/marketing`);

    await page.route(/localhost:5175\/assets\/.*\.js/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.continue();
    });

    // Start navigating to the (slow) dashboard, but don't wait for it —
    // immediately navigate to marketing's pricing page instead.
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Marketing" }).click();
    await page.getByRole("link", { name: "Pricing" }).click();

    await expect(page).toHaveURL(`${CONTAINER_URL}/marketing/pricing`, {
      timeout: 2_000,
    });
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
  });
});
