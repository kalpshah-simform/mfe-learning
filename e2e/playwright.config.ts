import { defineConfig } from "@playwright/test";

// Integration tests for SG14 Key Topic 4 — every check here needs a real
// browser driving the actual served apps together (not one app in
// isolation), so this spins up the full local simulation via local-sim.sh
// (see BUILD-VALIDATION.md / local-sim.sh at the repo root) and runs
// against it.
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
  },
  webServer: {
    command: "../local-sim.sh",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
