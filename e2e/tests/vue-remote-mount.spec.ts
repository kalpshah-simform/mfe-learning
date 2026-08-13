import { test, expect } from "@playwright/test";
import { CONTAINER_VUE_URL, signIn } from "./helpers";

// SG14 Key Topic 4: "Vue Dashboard remote mounts/unmounts cleanly via the
// RemoteApp interface with no leaks or duplicate DOM nodes on repeated
// navigation"
//
// mfe-container-vue's RemoteOutlet.vue calls the outgoing remote's
// unmount() (via a `watch(...).onCleanup`) before mounting the next one, all
// inside the same containerRef <div>. Repeatedly mounting/unmounting the
// Settings remote and checking that container's child-node count never
// grows is a direct check that teardown actually runs each time, rather
// than just assuming it from reading the source.

test("repeated navigation into and out of the Settings remote leaves no duplicate DOM nodes", async ({
  page,
}) => {
  await signIn(page, CONTAINER_VUE_URL);

  await page.goto(`${CONTAINER_VUE_URL}/settings`);
  await expect(
    page.getByRole("heading", { name: "Settings Overview" }),
  ).toBeVisible();

  const mountContainer = page.getByTestId("remote-mount");
  const firstMountChildCount = await mountContainer.evaluate(
    (el) => el.childElementCount,
  );
  expect(firstMountChildCount).toBeGreaterThan(0);

  for (let i = 0; i < 5; i++) {
    await page.getByRole("link", { name: "Marketing" }).click();
    await expect(page.getByRole("heading", { name: "Marketing" })).toBeVisible();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(
      page.getByRole("heading", { name: "Settings Overview" }),
    ).toBeVisible();
  }

  const finalChildCount = await mountContainer.evaluate(
    (el) => el.childElementCount,
  );
  expect(finalChildCount).toBe(firstMountChildCount);
});
