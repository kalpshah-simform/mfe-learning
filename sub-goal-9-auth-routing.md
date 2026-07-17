# Micro Frontend Authentication Architecture — Summary Report

**Sub-Goal 9: Authentication Architecture**
**Scope:** Conceptual overview for team alignment (no implementation yet)

---

## 1. Overview

In a micro frontend (MFE) setup, authentication cannot live independently inside each remote — that would mean every remote re-implements login checks, token handling, and redirect logic, with no guarantee they agree on whether the user is signed in. The pattern adopted here is **centralized authentication in the container**, with the **auth remote reduced to a UI-only concern**.

This mirrors the routing architecture decision from Sub-Goal 7: the container is the single source of truth, and remotes are reactive participants that respond to state owned elsewhere.

---

## 2. Centralized Authentication in the Container

The container app owns:

- The **authentication state** (is the user signed in, user profile/session data, tokens)
- The **logic** for determining whether a session is valid (token presence, expiry checks, refresh)
- The **decision** of what happens when auth state changes (redirect to login, redirect to dashboard, etc.)

Why centralize:

- **Single source of truth** — avoids each remote independently deciding "am I authenticated?" and potentially disagreeing.
- **Consistent session handling** — token refresh, logout, and expiry are handled once, not duplicated three times across auth, dashboard, and marketing.
- **Security boundary** — sensitive session/token logic lives in one place, reducing surface area for mistakes or leaks across remotes.

The container does not render login forms or auth UI itself — it delegates that to the auth remote, but it retains ownership of *state* and *decisions*.

---

## 3. Auth Remote Handles UI Only

The auth remote's responsibility is narrowed to **presentation**:

- Renders login form, signup form, forgot-password flow, etc.
- Collects user input and submits credentials
- On success/failure, **reports the outcome back to the container** — it does not itself decide "the user is now authenticated app-wide."

This is a deliberate separation of concerns:

| Concern | Owner |
|---|---|
| Rendering auth UI (forms, validation messages, loading states) | Auth remote |
| Knowing whether the user is signed in | Container |
| Persisting session / tokens | Container |
| Deciding what happens after successful login (redirect, unlock routes) | Container |

This keeps the auth remote replaceable — if the login UI changes vendors or gets redesigned, the container's authentication contract doesn't need to change, only the remote implementing it.

---

## 4. `isSignedIn` State

`isSignedIn` is the **shared boolean signal** that represents authentication status across the whole shell.

- It lives in the container (as the source of truth), similar to how routing state lives in the container per Sub-Goal 7's model.
- It's exposed to remotes through the same kind of communication mechanism established in Sub-Goal 8 (Cross-App Communication) — e.g. passed down as a prop/callback, or broadcast via the shared event bus/store.
- Remotes **read** `isSignedIn` reactively; they don't own or mutate it directly. The auth remote *triggers* a change (via a callback like `onLoginSuccess`), but the container is the one that flips the flag.

This keeps `isSignedIn` consistent with the broader MFE principle established across earlier sub-goals: state ownership stays with the container, remotes react to it.

---

## 5. Protected Routes

Protected routes are routes that should only be reachable when `isSignedIn` is true (e.g. `/dashboard`).

Because the container owns both **routing** (Sub-Goal 7) and **auth state** (this sub-goal), it's naturally positioned to **gate routes** using `isSignedIn`:

- Container checks `isSignedIn` before rendering a protected route.
- If false → redirect to login (rendered by the auth remote).
- If true → allow navigation to proceed to the protected remote (e.g. dashboard).

This is the same "container as gatekeeper" pattern as the two-layer router architecture from Sub-Goal 7, extended with an auth condition layered on top of the path-based routing decision.

---

## 6. Lazy Protected Routes

Combines two previously separate concerns:

1. **Lazy loading** — remotes are only fetched (`remoteEntry.js`, `React.lazy()`) when their route is actually visited, not upfront.
2. **Protection** — that lazy load should only happen *after* the auth check passes.

The important nuance: **don't lazy-load the protected remote before confirming `isSignedIn`.** Otherwise you'd fetch and initialize a remote (e.g. dashboard) for a user who isn't even allowed to see it — wasted network/bundle cost, and a brief flash of protected content is a risk if not sequenced correctly.

The correct order is:

```
isSignedIn check → pass → trigger React.lazy() load of dashboard remote → render
                 → fail → redirect to auth remote (login UI)
```

This mirrors Sub-Goal 7's "route-based remote loading" deliverable, but now gated by an auth condition rather than pure path matching.

---

## 7. How This Connects to Prior Sub-Goals

| Sub-Goal | Concept | Connection to Auth Architecture |
|---|---|---|
| 4 (Sub-App Isolation) | Lifecycle contract (bootstrap/mount/unmount) | Auth remote follows the same lifecycle contract as other remotes |
| 5 (Shared Dependency Management) | Singleton behavior via `requiredVersion` | If auth remote shares React/router with container, same dedup approach applies |
| 7 (Routing Architecture) | Container as routing source of truth, `onNavigate` callback | Auth state gating layers on top of the routing decision |
| 8 (Cross-App Communication) | Event/callback-based state propagation | `isSignedIn` and login outcomes propagate through the same communication abstraction |

---

## 8. Summary for the Team

- **Container = brain.** Owns `isSignedIn`, session/token logic, and the decision to allow or block navigation.
- **Auth remote = face.** Only renders login/signup UI and reports outcomes upward — it doesn't decide app-wide auth state.
- **Protected routes = container-enforced gate.** Checked before rendering, not delegated to the remote being protected.
- **Lazy protected routes = ordering matters.** Auth check happens *before* the protected remote is fetched/loaded, not after.

This keeps authentication consistent with the architectural pattern established throughout the MFE curriculum: **container owns cross-cutting state and decisions; remotes stay focused and reactive.**