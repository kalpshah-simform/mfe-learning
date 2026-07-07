# MFE Sub-Goal 4: Sub-App Isolation Strategy — Implementation Spec

## Stack
Vite + React 19, @originjs/vite-plugin-federation. Container (host) + 3 remotes: auth, dashboard, marketing.

## Decision: Hosted mode (not iframe/sandbox isolation)
Sub-apps share the host's JS runtime and window. React/ReactDOM/router are shared
singletons via Module Federation `shared` config (already aligned in prior sub-goal).
Isolation is enforced through convention, not a hard sandbox boundary.

## Required lifecycle contract (per remote)
Each remote must export three functions with this exact shape:

- `bootstrap(props)` — runs ONCE per remote, on first activation only.
  One-time setup: create app-level singletons/config. NO DOM rendering here.
- `mount(props)` — runs EVERY time the remote becomes active.
  Creates the React root and renders into the provided container:
  `const root = ReactDOM.createRoot(container); root.render(<App {...props}/>)`
  Store the `root` reference (module-level or closure) for unmount.
- `unmount(props)` — runs EVERY time the remote becomes inactive.
  Must fully clean up: `root.unmount()`, remove event listeners, clear intervals/timeouts,
  unsubscribe from any global stores/event bus. Missing cleanup here is the top cause
  of memory leaks and "ghost" behavior (hidden remote still reacting to global events).

Container never renders JSX directly for remotes — it only calls mount(container)/unmount().

## CSS/global isolation (since we're hosted, not sandboxed)
- CSS Modules or scoped styles per remote — no global CSS leaking across remotes.
- Namespace any global variables/window properties a remote sets (e.g. `window.__marketingApp`).
- No remote should mutate shared state outside an explicit, agreed-upon channel
  (event bus / shared store) — implicit global mutation is the main hosted-mode risk.

## Routing / history rules
- ONE shared browser history — do not let remotes hijack pushState independently.
- Each remote owns a distinct path prefix: /auth/*, /dashboard/*, /marketing/*.
  No overlapping routes between remotes.
- Container does coarse routing: matches URL prefix → decides which remote to
  mount/unmount (activity function pattern).
- Each remote runs its OWN internal router (React Router) scoped with
  `basename="/<remote-prefix>"` for internal navigation — container router and
  remote router are two separate layers, not one router doing both jobs.

## Action items for this sub-goal
1. Add bootstrap/mount/unmount exports to each remote's entry file, matching the
   contract above (check auth, dashboard, marketing — likely inconsistent right now).
2. Audit each remote for cleanup gaps in unmount (listeners, timers, subscriptions).
3. Verify no route prefix overlap between the 3 remotes' internal routers.
4. Confirm container's activity/matching function correctly maps URL prefixes to
   mount/unmount calls, and that remotes use `basename` correctly so nested routing
   doesn't conflict with the container's routing.
5. Scope CSS per remote (CSS Modules or equivalent) — check for any unscoped global styles.