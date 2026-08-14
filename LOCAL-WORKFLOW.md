# Local Workflow (SG14)

End-to-end workflow for developing and validating a change on this branch
locally, before it goes anywhere near a real deploy. This ties together the
three pieces that already exist separately: `local-sim.sh` (simulate the
whole federated system locally), `BUILD-VALIDATION.md` (manual build
checks), and `e2e/` (integration tests) — see each for full detail; this
file is the map connecting them into one flow.

## The apps

| App | Role | Port | Framework |
|---|---|---|---|
| `mfe-container` | Host | 5173 | React 19 |
| `mfe-container-vue` | Host (same remotes, Vue instead) | 5179 | Vue 3 |
| `mfe-auth` | Remote | 5174 | React |
| `mfe-dashboard` | Remote | 5175 | React |
| `mfe-marketing` | Remote | 5176 | React |
| `mfe-settings` | Remote | 5177 | Vue |
| `shared` | Remote (singleton store only) | 5178 | — |

Both containers mount the same four remotes via Module Federation
(`@module-federation/vite`). Ports are fixed (`strictPort: true`) in each
app's `vite.config.ts` so they're stable across runs.

## Step 1 — Feature folder structure (Key Topic 1)

No action needed per app — see `SG14-ClaudeCode-Audit-TaskList.md` Key
Topic 1: feature-based folders were evaluated and intentionally deferred
(pages are simple, single-purpose, no sub-domain complex enough to justify
it yet). Structure stays flat `pages/layouts/router` per app until that
changes.

## Step 2 — Local branch simulation (Key Topic 2)

Build every app and serve it on its fixed port, simulating what a real
deploy of this branch would look like end-to-end — not just `npm run dev`
against one app in isolation.

```bash
./local-sim.sh            # both containers + all remotes
./local-sim.sh --react     # mfe-container + remotes only
./local-sim.sh --vue       # mfe-container-vue + remotes only
```

Remote URLs are env-driven (`VITE_AUTH_REMOTE_URL` etc., see each
container's `.env.example`) rather than hardcoded, so this same script
works whether remotes are local or point elsewhere.

Ctrl+C stops every server the script started.

## Step 3 — Manual build validation (Key Topic 3)

With the simulation running (or standalone), run the automated build
checks and consult `BUILD-VALIDATION.md` for the parts that need a browser:

```bash
./scripts/validate-build.sh check       # dist/assets structure, base path,
                                         # remoteEntry.js generation, cache-busting hashes
./scripts/validate-build.sh reachable   # remoteEntry.js reachable on each port (needs local-sim.sh running)
./scripts/validate-build.sh snapshot    # before a dependency/version bump
# ... bump the dependency ...
./scripts/validate-build.sh diff        # confirms hashes actually changed
```

The two checks that can't be automated from build artifacts alone
(duplicate shared-dep dedup, Vue remote mount/unmount) are written up as
manual browser steps in `BUILD-VALIDATION.md` §5 and §7 — though both are
now also covered by automated tests in Step 4, so treat the manual steps as
a fallback for spot-checking rather than routine to run in tandem with them.

## Step 4 — Integration testing (Key Topic 4)

Playwright tests that verify the cross-app runtime behavior a single app in
isolation can't (auth gating, lazy loading, shared browser history, the
`auth:login` CustomEvent contract, the shared-store/React singleton, the
Vue remote's mount/unmount lifecycle, `remoteEntry.js` cache-busting after a
rebuild, and graceful failure when a remote's server is down):

```bash
cd e2e
npm install && npx playwright install chromium   # once
npm test
```

This starts `local-sim.sh` automatically and tears it down after — see
`e2e/README.md`.

## Putting it together: validating a branch before it ships

1. Check out the branch.
2. `./local-sim.sh` — confirms every app still builds and boots together.
3. `./scripts/validate-build.sh check` — confirms build output structure
   is still correct.
4. `cd e2e && npm test` — confirms cross-app behavior still holds.
5. If a dependency/version was bumped as part of the change, additionally
   run the `snapshot`/`diff` cache-busting check (Step 3).

If all four pass, the branch behaves the same way locally as a real
multi-app deploy would, without needing an actual deploy to find out.

## Troubleshooting

- **Port already in use / `strictPort` error**: something else is bound to
  one of the ports above — `ss -tlnp | grep 517` to find and stop it before
  re-running `local-sim.sh`.
- **A remote shows "Couldn't load '<remote>'. Is its dev server running?"
  instead of mounting**: exactly that — check the relevant app's preview
  server is actually up on its port. Clicking Retry reloads the page (a
  federation runtime's failed remote-load is cached in-memory, so nothing
  short of a reload actually re-fetches it — see the comment above the
  Retry handler in `App.tsx`/`RemoteOutlet.vue`).
- **`e2e` tests fail with a port-in-use error from `local-sim.sh`**: another
  simulation is already running; either stop it or let Playwright's config
  (`reuseExistingServer`) reuse it.
