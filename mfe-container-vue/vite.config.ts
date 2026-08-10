import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";
import { dependencies } from "./package.json";

const mfeAuthUrl =
  process.env.VITE_AUTH_REMOTE_URL || "http://localhost:5174/remoteEntry.js";
const mfeDashboardUrl =
  process.env.VITE_DASHBOARD_REMOTE_URL ||
  "http://localhost:5175/remoteEntry.js";
const mfeMarketingUrl =
  process.env.VITE_MARKETING_REMOTE_URL ||
  "http://localhost:5176/remoteEntry.js";
const mfeSettingsUrl =
  process.env.VITE_SETTINGS_REMOTE_URL ||
  "http://localhost:5177/remoteEntry.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "mfe-container-vue",
      filename: "remoteEntry.js",
      dts: false,
      // See mfe-container/vite.config.ts for why 'loaded-first' is used
      // instead of the default 'version-first' strategy: it avoids eagerly
      // preloading every remote on every page load and restores per-route
      // lazy loading.
      shareStrategy: "loaded-first",
      remotes: {
        "mfe-dashboard": {
          type: "module",
          name: "mfe-dashboard",
          entry: mfeDashboardUrl,
          entryGlobalName: "mfe-dashboard",
          shareScope: "default",
        },
        "mfe-marketing": {
          type: "module",
          name: "mfe-marketing",
          entry: mfeMarketingUrl,
          entryGlobalName: "mfe-marketing",
          shareScope: "default",
        },
        "mfe-auth": {
          type: "module",
          name: "mfe-auth",
          entry: mfeAuthUrl,
          entryGlobalName: "mfe-auth",
          shareScope: "default",
        },
        "mfe-settings": {
          type: "module",
          name: "mfe-settings",
          entry: mfeSettingsUrl,
          entryGlobalName: "mfe-settings",
          shareScope: "default",
        },
      },
      shared: {
        // This host renders no React itself — it only hands each remote a
        // DOM container and calls its bootstrap/mount/unmount contract — so,
        // unlike mfe-container, it has no react/react-dom to contribute to
        // the shared scope. "shared/store" is still listed so this app's
        // copy (if it were ever imported) would dedupe against the remotes'.
        "shared/store": {
          requiredVersion: dependencies.shared,
          singleton: true,
        },
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5180,
    strictPort: true,
    origin: "http://localhost:5180",
  },
  preview: {
    port: 5180,
    strictPort: true,
  },
});
