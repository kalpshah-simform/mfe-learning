import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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
const sharedUrl =
  process.env.VITE_SHARED_REMOTE_URL || "http://localhost:5178/remoteEntry.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe-container",
      filename: "remoteEntry.js",
      dts: false,
      // Default 'version-first' strategy needs to know every remote's shared-dep
      // versions upfront to pick the best compatible one, which is why the plugin
      // eagerly preloads (fetches + evaluates) all three remotes on every page
      // load regardless of route. All remotes here pin the same dependency
      // versions, so 'loaded-first' (resolve to whichever loads first, register
      // each remote only when it's actually imported) is safe and restores real
      // per-route lazy loading.
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
        shared: {
          type: "module",
          name: "shared",
          entry: sharedUrl,
          entryGlobalName: "shared",
          shareScope: "default",
        },
      },
      shared: {
        react: { requiredVersion: dependencies.react, singleton: true },
        "react-dom": {
          requiredVersion: dependencies["react-dom"],
          singleton: true,
        },
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5173,
    strictPort: true,
    origin: "http://localhost:5173",
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});
