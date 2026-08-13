import type { Page } from "@playwright/test";

export const CONTAINER_URL = "http://localhost:5173";
export const CONTAINER_VUE_URL = "http://localhost:5179";

/** Signs in through the real mfe-auth login form, mounted under the given host. */
export async function signIn(page: Page, hostUrl: string) {
  await page.goto(`${hostUrl}/auth/login`);
  await page.locator("#login-email").fill("tester@example.com");
  await page.locator("#login-password").fill("password123");
  await page.getByRole("button", { name: "Log In" }).click();
}
