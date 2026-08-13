# Integration tests (SG14 Key Topic 4)

Playwright tests that verify cross-app runtime behavior across the served
apps together — auth gating, lazy loading, shared browser history, the
`auth:login` CustomEvent contract, the shared-store/React singleton, the Vue
remote's mount/unmount lifecycle, and `remoteEntry.js` cache-busting after a
rebuild. See each spec file's header comment for the specific SG14 Key
Topic 4 item it covers.

## Setup (once)

```bash
cd e2e
npm install
npx playwright install chromium
```

## Run

```bash
cd e2e
npm test
```

This starts the full local simulation via `../local-sim.sh` automatically
(building every app and serving it on its fixed port — see
`BUILD-VALIDATION.md` at the repo root) and tears it down after. If you
already have `../local-sim.sh` running in another terminal, the config
reuses it instead of starting a second one.

One spec (`stale-remote-entry.spec.ts`) rebuilds `mfe-dashboard` mid-test to
verify a rebuild is actually picked up — it reverts its temporary source
change and rebuilds again in a `finally` block, but if a test run is
interrupted before that finally block completes, check
`git status mfe-dashboard` afterward.
