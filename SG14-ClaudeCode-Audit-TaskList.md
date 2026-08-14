# Claude Code Task: SG14 Progress Audit (Production Workflow Simulation)

**Goal:** Check this repo/workspace against the SG14 key topics and deliverables below. For each item, report **Done / Partial / Not Started**, cite the file(s)/evidence you checked, and list what's missing for anything not fully done. Do not implement anything yet — this is an audit only.

Context: 4-app MFE setup — Container (React 19), Auth, Dashboard, Marketing, plus a Vue Dashboard remote (SG13). Vite 5 + `@originjs/vite-plugin-federation`. Prior sub-goals (SG5, SG7–SG13) established shared-dep singleton config, router ownership in Container, cross-app `CustomEvent` contracts, auth gating, lazy loading, production build/base-path handling, and cache-busting via versioned filenames.

---

## Key Topic 1: Feature-Based Folder Structure

Check each app (Container, Auth, Dashboard, Marketing, Vue Dashboard):

**Decision (2026-08-13): intentionally out of scope.** Each app's pages are plain, single-purpose views (5-6 files per app, e.g. `mfe-dashboard`'s Reports/Settings are 2 files each) with no distinct sub-domains that would benefit from isolation. A `src/features/<name>/` migration was prototyped on `mfe-dashboard` (reports + settings grouped into feature folders with barrels) and confirmed working (typecheck + build passed, code-splitting preserved), then reverted at the user's call — the current flat `pages/layouts/router` structure is simpler and sufficient for this app's size. Revisit only if an app's page count/complexity grows enough to justify the extra indirection.

- [x] **NOT APPLICABLE (by decision)** — Source is organized under `src/features/<feature-name>/` rather than purely by technical layer (`components/`, `hooks/`, `services/` as top-level siblings). All apps intentionally keep `pages/layouts/router` layering — see decision above.
- [x] **NOT APPLICABLE (by decision)** — Each feature folder has a single `index.ts` (or equivalent) barrel exposing only that feature's public surface — not a whole-app barrel. No feature folders by design.
- [ ] **PARTIAL** — `shared/` (or equivalent) exists for genuinely cross-feature code (UI primitives, utils) — confirm it isn't being used as a dumping ground for feature-specific code. Root `shared/` exists but is a federation micro-app exposing one singleton store, not a per-app `src/shared/`.
- [x] **NOT APPLICABLE (by decision)** — No feature folder directly imports another feature folder's internals (only via its `index.ts`, or via `shared/`). Nothing to violate — no feature structure by design.
- [x] **DONE** — The exposed federation entry (`exposes` in each remote's Vite config) points to a composed public entry, not directly into a feature folder's internals. Each remote exposes one composed root: `./Auth: src/auth.tsx`, `./Dashboard: src/dashboard.tsx`, `./Marketing: src/marketing.tsx`.

Report: which apps have migrated, which haven't, and any partial/inconsistent structure across apps. **Decision: no app migrates — plain pages are sufficient at current scale (see note above).**

## Key Topic 2: Local Branch Simulation

- [x] **DONE** — Each app has a fixed local dev/preview port documented somewhere (e.g., `.env`, README, or config) — Container, Auth, Dashboard, Marketing. Ports fixed (`strictPort: true`) in each `vite.config.ts`; `mfe-container-vue/README.md` inconsistency (said 5180, config says 5179) fixed to match `vite.config.ts` (5179).
- [x] **DONE** — Container's remote URLs are resolved from environment variables (e.g., `VITE_AUTH_REMOTE_URL`, `VITE_DASHBOARD_REMOTE_URL`, `VITE_MARKETING_REMOTE_URL`) rather than hardcoded. Confirmed in both `mfe-container` and `mfe-container-vue` vite configs with `.env`/`.env.example` files.
- [x] **DONE** — There is a documented or scripted way to build all four apps and serve their `dist/` output locally on those fixed ports (e.g., an npm script, a shell script, or written steps). Added a root `serve` script to `mfe-container`/`mfe-container-vue` package.json (previously missing) and a root-level `local-sim.sh` that builds every app (shared, auth, dashboard, marketing, settings, both containers) and runs `preview` for each concurrently on its fixed port, with `--react`/`--vue` flags to run one container stack at a time.
- [x] **DONE** — Confirm whether this has actually been *run* at least once (check for build output, `dist/` folders, or any notes/logs indicating a simulation was performed) vs. only being possible in theory. Re-verified by running `./local-sim.sh --react`: all 6 apps built successfully and served on ports 5173–5178, each confirmed reachable with HTTP 200.

Report: is the mechanism set up, and has it actually been exercised end-to-end at least once.

## Key Topic 3: Manual Build Validation

Check for evidence of each validation step (a checklist file, README section, script, or scripts in `package.json`):

- [x] **DONE** — Type check step exists and can be run per app (`tsc --noEmit` or similar). Added standalone `"typecheck"` script (`tsc -b --noEmit` / `vue-tsc -b --noEmit`) to all 6 TS apps' `package.json`; verified passing via `npm run typecheck` in each.
- [x] **DONE** — `vite build` succeeds for each app — confirm by running it if safe to do so, or checking for recent successful build artifacts. Verified by actually running the build for all 7 apps via `./scripts/validate-build.sh check`.
- [x] **DONE** — A documented/manual process exists for inspecting `dist/assets/` structure and confirming base path correctness. `BUILD-VALIDATION.md` §3 + automated in `scripts/validate-build.sh check` (confirms `dist/assets/` exists and `index.html` references root-relative `/assets/`).
- [x] **DONE** — A documented/manual process exists for confirming `remoteEntry.js` is generated and reachable. Generation checked in `scripts/validate-build.sh check`; reachability checked via new `scripts/validate-build.sh reachable` (curls each app's fixed port) — see `BUILD-VALIDATION.md` §4.
- [x] **DONE** — A documented/manual process exists for checking duplicate shared dependencies (React, React Router, etc.) in the built output. This is a runtime property, not a static one — documented as a manual browser check in `BUILD-VALIDATION.md` §5 using the existing `shared/store.js` `__id` probe already logged by `mfe-auth`, `mfe-dashboard`, `mfe-settings`.
- [x] **DONE** — A documented/manual process exists for confirming cache-busting filenames change between builds after a dependency/version bump. `scripts/validate-build.sh snapshot` / `diff` — snapshots asset filenames, rebuilds, and diffs. Verified end-to-end with a simulated source change in `mfe-marketing` (hash changed as expected, then reverted).
- [x] **DONE** — A documented/manual process exists for confirming the Vue Dashboard remote still mounts/unmounts cleanly post-build. Documented as a manual click-through in `BUILD-VALIDATION.md` §7 against `mfe-container-vue`'s `RemoteOutlet.vue` cleanup logic.
- [x] **DONE** — A documented/manual process exists for confirming lazy-loaded routes still code-split correctly post-build. Documented in `BUILD-VALIDATION.md` §8 — static chunk-file check (via `validate-build.sh check`) plus a Network-tab runtime check.

Report: all 8 checks now exist as an actual repeatable process — combination of `scripts/validate-build.sh` (automatable checks) and `BUILD-VALIDATION.md` (written steps for the checks that inherently require a browser).

## Key Topic 4: Integration Testing

Check for any test files, scripts, or written procedures covering these specific cross-boundary behaviors:

- [x] **DONE** — Auth gating: Dashboard reflects Container's `isSignedIn` state correctly; protected routes redirect when signed out. Covered by `e2e/tests/auth-gating.spec.ts` (4 tests: redirect from `/dashboard` and `/settings` signed out, sign-in grants access and preserves the redirect target, `/auth` bounces back to `/dashboard` once signed in). All passing.
- [x] **DONE** — Lazy-loaded remotes show a loading state and don't block unrelated routes. Covered by `e2e/tests/lazy-loading.spec.ts` (2 tests: spinner appears/disappears around a delayed remote fetch; a slow-loading remote doesn't block navigating to an unrelated route). All passing.
- [x] **DONE** — Shared router: navigation into/out of a remote preserves browser history correctly, no duplicate `BrowserRouter`. Covered by `e2e/tests/router-history.spec.ts` (3 tests). **Finding**: in-remote sub-page navigation (e.g. Marketing Home→About) updates the URL via `navigate(path, {replace:true})` in `App.tsx`'s `onNavigate`, so those transitions do *not* stack as separate back-button history — only Container-nav-driven moves between remotes do. Tests were written to match this actual behavior rather than assuming push semantics everywhere; worth confirming with the team whether that's the intended UX.
- [x] **DONE** — Cross-app `CustomEvent` contracts: an emitted event is received correctly, and listeners are removed on unmount (no leaks). Covered by `e2e/tests/custom-events.spec.ts` (2 tests: dispatched event is received while mounted; a post-unmount dispatch is not handled, proving listener cleanup). All passing.
- [x] **DONE** — Only one instance of React (and other singleton shared deps) is active at runtime across Container + mounted remotes. Covered by `e2e/tests/singleton-react.spec.ts`, using the codebase's own `shared/store.js` `__id` probe, compared across `mfe-auth` and `mfe-dashboard` within one page session (no full reload, which would reset it). Passing — same `__id` observed both times.
- [x] **DONE** — Vue Dashboard remote mounts/unmounts cleanly via the `RemoteApp` interface with no leaks or duplicate DOM nodes on repeated navigation. Covered by `e2e/tests/vue-remote-mount.spec.ts` — mounts/unmounts the Settings remote 5× and confirms the mount container's child-element count never grows. Added `data-testid="remote-mount"` to the mount `<div>` in both `mfe-container/src/App.tsx` and `mfe-container-vue/src/RemoteOutlet.vue` for a stable test selector. Passing.
- [x] **DONE** — After a version bump, Container fetches the new `remoteEntry.js` rather than a stale cached one. Covered by `e2e/tests/stale-remote-entry.spec.ts` (2 tests). **Fixed**: `mfe-container/vite.config.ts` was missing the `federationCacheHeaders` plugin present in every other app, so its own `remoteEntry.js` only got a bare `no-cache` instead of `no-cache, no-store, must-revalidate`. Added the same plugin (matching `mfe-marketing`'s implementation verbatim) — verified via `curl` that container's `remoteEntry.js` now returns the full directive, and the e2e suite still passes 15/15. Second test does a real rebuild of `mfe-dashboard` with a source change and confirms Container serves the updated content on next load, then reverts the change.

All 7 items now have Playwright integration tests in `e2e/` (see `e2e/README.md` for setup/run instructions), run against the real served apps via `local-sim.sh`. 15/15 tests passing as of 2026-08-13.

---

## Deliverables Status

- [x] **DONE** — **Documented Local Workflow Model** — does a file exist describing the local branch simulation + build validation workflow end-to-end? `LOCAL-WORKFLOW.md` — a single narrative doc tying together Key Topics 1–4: app/port map, `local-sim.sh` usage, `BUILD-VALIDATION.md`/`scripts/validate-build.sh` usage, `e2e/` usage, a step-by-step "validating a branch before it ships" sequence, and a troubleshooting section. Verified `validate-build.sh check` (28/28) runs clean as documented.
- [x] **DONE** — **End-to-End Validation Checklist** — does a file exist that turns Key Topics 3–4 above into an actual repeatable checklist (not just prose)? Key Topic 3: `BUILD-VALIDATION.md` + `scripts/validate-build.sh` (all 8 checks). Key Topic 4: `e2e/` Playwright suite (all 7 checks, 15/15 passing) + `e2e/README.md`. Both are real repeatable processes, not just prose.

---

## Output Format

Please respond with:

1. A summary table: Key Topic / Deliverable → Status (Done / Partial / Not Started) → 1-line evidence or gap
2. A prioritized "what's missing" list — the smallest set of next actions to move from current state to fully done
3. Any inconsistencies found across apps (e.g., Container migrated to feature folders but Marketing hasn't)

Do not create or modify any files during this audit — read-only investigation only.
