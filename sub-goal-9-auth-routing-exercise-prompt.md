# Learning Exercise Prompt — Implement Sub-Goal 9 (Auth-Gated Routing)

Implement the authentication architecture described in `sub-goal-9-auth-routing.md` across `mfe-container`, `mfe-auth`, and `mfe-dashboard`. Currently `onAuthChange` in `mfe-container/src/App.tsx` only logs its payload — there is no real `isSignedIn` state, no route protection, and no lazy-load gating.

## Requirements

1. **Container owns `isSignedIn`.** Add state in `App.tsx` that flips to `true` when the mounted auth remote calls `onAuthChange({ isAuthenticated: true, ... })` (already wired in `LoginPage.tsx` via `useAuthChange`).
2. **Persist across refresh.** Back `isSignedIn` with `sessionStorage` (or `localStorage`, pick one and justify it) so a page refresh doesn't bounce a signed-in user back to `/auth`. Initialize state from storage on mount, and keep storage in sync whenever the flag changes.
3. **Protect `/dashboard`.** Before `RemoteOutlet` loads the `dashboard` remote, check `isSignedIn`. If false, redirect to `/auth` **and preserve the originally requested path** (e.g. `/auth?redirect=/dashboard/reports` or router state) so login can send the user back to where they meant to go instead of always landing on the dashboard root.
4. **Order matters.** The dashboard remote's `remote.load()` (the dynamic `import()`) must not fire until the `isSignedIn` check has passed — don't fetch-then-discard.
5. **React to sign-out.** If `isSignedIn` ever becomes `false` while on a protected route (logout, session expiry), un-mount the dashboard remote and redirect to `/auth`.
6. Leave the auth remote UI-only — it should keep calling `onAuthChange` and never decide app-wide auth state itself. On successful login, it (or the container) should honor the preserved `redirect` target from step 3.

Don't change the remote lifecycle contract (`bootstrap`/`mount`/`unmount`/`onParentNavigate`) — auth gating is a container-side concern layered on top of the existing `RemoteOutlet` logic, per the doc's Section 6.
