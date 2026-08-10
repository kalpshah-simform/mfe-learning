# mfe-container-vue

A Vue 3 + Vite host for the same Module Federation remotes used by
`mfe-container` (mfe-auth, mfe-dashboard, mfe-marketing, mfe-settings).

The remotes expose a framework-agnostic contract
(`bootstrap`/`mount`/`unmount`/`onParentNavigate`) rather than
React-specific bindings, so any host framework can drive them — this app
mounts each remote into a plain DOM container the same way `mfe-container`
does, just using Vue + vue-router instead of React + react-router-dom.

## Development

Copy `.env.example` to `.env` and point it at each remote's dev server (or
rely on the localhost defaults in `vite.config.ts`), then:

```bash
npm install
npm run dev
```

Runs on `http://localhost:5180`.
