# Build Validation Checklist (SG14 Key Topic 3)

Repeatable steps to validate a production build across all apps: Container
(React), Auth, Dashboard, Marketing, Settings, the `shared` federation
module, and the Vue container.

Run everything from the repo root unless noted otherwise.

## 1. Type check

```bash
for app in shared mfe-auth mfe-dashboard mfe-marketing mfe-settings mfe-container mfe-container-vue; do
  (cd "$app" && npm run typecheck)
done
```

`shared` is plain JS and has no `typecheck` script — skip it, or drop it from
the loop. Pass: every app exits 0 with no errors.

## 2. `vite build` succeeds for every app

```bash
./scripts/validate-build.sh check
```

This builds all 7 apps (fails fast on the first build error) and then runs
checks 3, 4, and 6 below against the resulting `dist/` output. Pass: "==
Summary: N passed, 0 failed ==".

## 3. `dist/assets/` structure and base path

Covered by `./scripts/validate-build.sh check`, which for each app confirms:
- `dist/assets/` exists and lists the file count
- `dist/index.html` references assets as `/assets/...` (root-relative) — no
  app sets a custom Vite `base`, so this is the expected form for every app

To inspect manually: `ls -la <app>/dist/assets/` and open `<app>/dist/index.html`.

## 4. `remoteEntry.js` generated and reachable

Generation is checked by `./scripts/validate-build.sh check` (confirms
`dist/remoteEntry.js` exists for all 7 apps — hosts included, since
`@module-federation/vite` emits one for every app regardless of role).

Reachability (needs the apps actually being served):

```bash
./local-sim.sh &          # or ./local-sim.sh --react / --vue
./scripts/validate-build.sh reachable
```

Pass: HTTP 200 from `http://localhost:<port>/remoteEntry.js` for every app
(ports: shared 5178, auth 5174, dashboard 5175, marketing 5176, settings
5177, container 5173, container-vue 5179).

## 5. Duplicate shared dependencies (React singleton dedup)

This is a runtime property, not a static one — each remote's build always
contains a fallback copy of `react`/`react-dom` in case it loads standalone,
so checking `dist/` output alone can't confirm dedup. Verify it live instead:

1. `./local-sim.sh --react`
2. Open `http://localhost:5173` (Container) in a browser, open DevTools console
3. Navigate to the Dashboard route — `mfe-dashboard/src/pages/OverviewPage.tsx`
   logs `shared/store __id in mfe-dashboard: <id>`
4. Navigate to Auth — `mfe-auth/src/pages/AuthLandingPage.tsx` logs
   `shared/store __id in mfe-auth: <id>`
5. Navigate to Settings (Vue) — `mfe-settings/src/pages/OverviewPage.vue` logs
   `shared/store __id in mfe-settings: <id>`

Pass: all three `__id` values are identical across a single page session —
proof the `shared` module (and, by the same federation `shared` config,
React/React DOM) is loaded once and reused, not duplicated per remote.
A differing `__id` means a remote fetched its own copy instead of reusing
the host's shared scope.

## 6. Cache-busting filenames change after a dependency/version bump

```bash
./scripts/validate-build.sh snapshot   # before the bump
# ... bump a dependency or change source in one or more apps ...
./scripts/validate-build.sh diff       # after the bump
```

`diff` rebuilds every app and compares asset filenames (which embed a
content hash) against the snapshot. Pass: changed apps show new hashed
filenames; unchanged apps may legitimately show no diff if nothing in their
bundle changed.

## 7. Vue Settings remote mounts/unmounts cleanly post-build

1. `./local-sim.sh --vue`
2. Open `http://localhost:5179` (mfe-container-vue)
3. Navigate into Settings, then away to Auth or Marketing, then back into
   Settings, repeatedly (5+ times)
4. In DevTools Elements panel, confirm no duplicate root DOM nodes accumulate
   under the remote's mount container between navigations
5. Confirm no console errors/warnings about duplicate Vue app instances

`mfe-container-vue/src/RemoteOutlet.vue` calls `unmount()` on the previous
remote via a `watch(...).onCleanup` before mounting the next one — this step
confirms that teardown actually happens and leaves no orphaned nodes.

## 8. Lazy-loaded routes still code-split correctly post-build

Two ways to confirm:

- **Static**: after `./scripts/validate-build.sh check`, inspect
  `<app>/dist/assets/` — page-level lazy routes (e.g. `mfe-dashboard`'s
  `ReportsListPage`/`ReportDetailPage`, `SettingsPage`/`ProfileSettingsPage`)
  should appear as their own chunk files, separate from the main
  `index-*.js` entry chunk.
- **Runtime**: `./local-sim.sh`, open the app in a browser with DevTools
  Network tab open, reload on the landing route, and confirm the lazy
  route's chunk is *not* in the initial requests — it should only load when
  you navigate to that route, and a loading state (spinner) should appear
  briefly while it does.

---

## Quick reference

| # | Check | Command |
|---|---|---|
| 1 | Type check | `npm run typecheck` (per app) |
| 2 | Build succeeds | `./scripts/validate-build.sh check` |
| 3 | dist/assets + base path | `./scripts/validate-build.sh check` |
| 4 | remoteEntry.js generated/reachable | `./scripts/validate-build.sh check` then `reachable` |
| 5 | No duplicate shared deps | manual — browser console `__id` check (see §5) |
| 6 | Cache-busting after bump | `./scripts/validate-build.sh snapshot` → bump → `diff` |
| 7 | Vue remote mount/unmount | manual — click-through in browser (see §7) |
| 8 | Lazy routes code-split | `./scripts/validate-build.sh check` + Network tab (see §8) |
