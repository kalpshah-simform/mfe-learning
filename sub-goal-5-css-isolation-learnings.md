# MFE Sub-Goal 5: CSS/Style Isolation Strategy — Implementation Spec

## Stack
Vite + React 19, @module-federation/vite. Container (host) + 3 remotes: auth,
dashboard, marketing. All remotes mount into the container's DOM as hosted
(non-iframe) React trees — see `sub-goal-4-learnings.md` for the lifecycle
contract this isolation strategy builds on.

## Decision: naming convention over a hard CSS boundary
No Shadow DOM, no `@scope`, no iframe. Isolation is enforced by (1) a
namespacing convention applied by hand or by build tooling, plus (2) keeping
non-prefixable page-shell selectors out of the code path that gets federated.
This mirrors Sub-Goal 4's overall call: convention, not a sandbox.

## 1. Naming / prefix convention

Two different collision surfaces need two different fixes — know which one
you're looking at before reaching for a prefix:

- **CSS custom properties on `:root`** (e.g. `--text`, `--bg`, `--border`):
  `:root` is a document singleton — every remote's `:root` block writes into
  the *same* namespace. Fix: prefix the **property name** itself.
  `--<app>-<token>`, e.g. `--mfe-auth-text`, `--mfe-dash-text`,
  `--mfe-mkt-text`, `--mfe-container-text`. Update every `var(...)` reference
  in the same file/component when renaming — there is no shim, it's a
  find-and-replace.
- **Unscoped utility classes** (plain CSS, not CSS Modules/CSS-in-JS):
  prefix the **class name**. `.<app>-<name>`, e.g. `.mfe-auth-card`,
  `.mfe-auth-scope`. If the class is already CSS-Modules-hashed or defined
  via CSS-in-JS, leave it alone — it's already collision-safe, don't
  double-prefix.
- **Bare element/id selectors that are structurally global**
  (`body`, `html`, `*`, `#root`, and the `:root` selector itself): these
  **cannot** be fixed with a naming prefix — you can't rename a tag, and
  every remote's own dev `index.html` independently defines
  `id="root"`, which is *also* the container's own top-level mount div id
  once federated (confirmed by direct DOM test — an ID selector matches
  anywhere in the document, not just within the injecting remote's own
  subtree). Fix: **ownership**, not naming — see §2 rule 4 below.
- **Dead selectors** (verified zero matching markup anywhere in any app,
  e.g. the boilerplate `#social .button-icon` block that shipped in every
  remote's scaffolded CSS): delete, don't prefix. Prefixing dead code adds
  noise without removing risk.

## 2. Scoping strategy per remote, and why

| Remote | Mechanism | Why this one |
|---|---|---|
| **auth** | Plain CSS + hand-applied `--mfe-auth-*` / `.mfe-auth-*` prefix | No build-time hashing tool in the loop — for a remote whose own style surface is a handful of tokens and one or two utility classes, manual prefixing is less machinery than pulling in CSS Modules, and it's what surfaces the *raw* collision failure mode most clearly (this remote was the one used to first reproduce the bug). |
| **dashboard** | CSS Modules (`index.module.css`) | Class selectors get automatically content-hashed by Vite/postcss-modules at build time — zero runtime cost, and you get collision-safety "for free" without inventing names by hand. Caveat you must remember: CSS Modules only hashes **class** selectors — `:root`, `body`, `#root` in the same file are untouched by the transform and still need the manual prefix/ownership treatment from §1. |
| **marketing** | CSS-in-JS (Emotion `Global` + `styled`) | Chosen over styled-components specifically *for federation*: Emotion's `createCache({ key })` gives each remote an explicit, inspectable namespace (`data-emotion="mfe-marketing-global"` on the injected `<style>`) instead of relying on module-singleton luck. Tradeoff paid for this: the styling library ships in the JS bundle and executes at runtime — measured ~+50% bundle weight (raw and gzip) versus dashboard's CSS-Modules chunk, because CSS Modules' cost is 100% build-time and Emotion's is partly runtime (parser + cache + sheet manager). |
| **container** | CSS Modules (`App.module.css`) for component classes + hand-prefixed plain CSS (`index.css`) for `:root` tokens | The container is the *real* host page — its `index.html` has the actual `<div id="root">` and the actual `<body>`. It's the one legitimate owner of unscoped `body`/`html` rules; nothing here needed to move to a standalone-only file the way the remotes' did. |

Pick a mechanism per new remote using the same logic: CSS Modules when the
remote's own styling is component classes and nothing else; CSS-in-JS when
you need runtime-configurable/dynamic styling or explicit cache-key control;
plain CSS + manual prefix is acceptable for a small, static token surface but
doesn't scale past that without becoming error-prone.

**Rule 4 (ownership, not naming) — the fix for `#root`/`body`:** the module
exposed via Module Federation (`auth.tsx`, `dashboard.tsx`,
`marketing-bootstrap.tsx`) must **never** import CSS that declares bare
`#root`, `html`, or `body` rules. That page-shell CSS is only valid for a
remote's own standalone dev entry (`main.tsx` + its own `index.html`) and
lives in a file named `standalone-shell.css`, imported **only** by
`main.tsx`. Verified by direct DOM test: any remote's unscoped `#root` rule,
once federated, matches the container's own top-level React mount div —
reshaping the whole app shell, not just that remote's content — so this
isn't a style preference, it's a correctness requirement.

## 3. External-library isolation (third-party global CSS — Bootstrap, resets, etc.)

Two options were weighed for a remote that needs to pull in a full
third-party stylesheet (a CSS framework, a global reset library):

- **(a) `postcss-prefix-selector` at build time** — rewrites every rule in
  the vendor file to require a scoping ancestor class, and (this specific
  plugin's default behavior) replaces `:root`/`body`/`html` selectors with
  the scope class *itself* rather than merely prefixing them as ancestor —
  which also fixes custom-property leakage, since properties declared on the
  scope class only inherit to its descendants.
- **(b) Shadow DOM** — real platform-enforced encapsulation, no build step,
  nothing can escape either direction. Rejected for now: it's a mount-time
  architecture change (stylesheets must be injected inside the shadow root,
  not `document.head`; anything doing `document.querySelector` into a
  remote's markup from outside breaks by design), and it does **not** even
  solve the problem fully — CSS custom properties are specified to pierce
  shadow boundaries, so a framework's `--*` variables would still leak.

**Decision: (a).** Applied per remote:

1. Install the vendor package normally (e.g. `bootstrap`, `destyle.css`).
2. Import its stylesheet in the **federated** entry point (the file actually
   exposed to Module Federation) — this is fine, unlike page-shell CSS,
   because the fix below scopes it before it ever reaches `<head>` unscoped.
3. In `vite.config.ts`, add to `css.postcss.plugins`:
   ```ts
   import prefixSelector from "postcss-prefix-selector";
   // ...
   css: {
     postcss: {
       plugins: [
         prefixSelector({
           prefix: ".mfe-<app>-scope",
           includeFiles: [/<vendor-package-name>/],
         }),
       ],
     },
   },
   ```
   `includeFiles` is load-bearing: it restricts the transform to the vendor
   file only, so the remote's own already-prefixed tokens and
   CSS-Modules/CSS-in-JS output are never touched.
4. Wrap the remote's exposed root component in
   `<div className="mfe-<app>-scope">` — a **plain, unstyled** wrapper. Do
   not put layout rules on the scope div itself (learned the hard way in an
   earlier phase: a wrapper that carries page-shell layout styles distorts
   the container's shell when federated). Its only job is to exist as the
   selector target the vendor CSS now requires.
5. Verify by grepping the built CSS for a bare, un-prefixed top-level
   `body{`, `html{`, or element selector from the vendor file — there
   should be none; everything should be nested under `.mfe-<app>-scope`.

## Checklist for a new remote

1. Own style tokens on `:root` → prefix property names `--mfe-<app>-*`.
2. Own utility classes → CSS Modules (if purely static classes) or prefix
   `.mfe-<app>-*` by hand (if staying plain CSS) — pick one, don't mix
   within the same file.
3. Any `body`/`html`/`#root` rule the remote needs for its own standalone
   page → put it in `standalone-shell.css`, imported only by `main.tsx`,
   never by the file exposed via Module Federation.
4. Pulling in a third-party global stylesheet → `postcss-prefix-selector`
   scoped via `includeFiles` to that package, plus a plain `.mfe-<app>-scope`
   wrapper div around the exposed root component.
5. Before calling it done: grep the built CSS output for unscoped
   `body{`/`html{`/bare element selectors from anything the remote imports —
   should find none outside `standalone-shell.css`'s own bundle.
