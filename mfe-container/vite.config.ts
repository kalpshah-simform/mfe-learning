import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { dependencies } from "./package.json";

// remoteEntry.js is the manifest a host fetches to discover this remote's
// chunks. If a CDN/browser caches a stale copy after a redeploy, it can
// point at chunk files that no longer exist and crash the host. Serve it
// no-cache while hashed chunks (safe to cache forever, since their name
// changes with their content) get a long-lived immutable cache.
function federationCacheHeaders(): Plugin {
  return {
    name: "federation-cache-headers",
    configurePreviewServer(server) {
      // Must run before Vite's internal static-file middleware (sirv), which
      // ends the response itself on a file hit rather than calling next() —
      // so a middleware added after it never runs. sirv also unconditionally
      // sets its own Cache-Control when it serves the file, so setting the
      // header here isn't enough; res.setHeader itself has to be patched to
      // pin the value we want.
      server.middlewares.use(
        (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const url = req.url?.split("?")[0];
          let desired: string | null = null;
          if (url?.match(/\/remoteEntry(\.ssr)?\.js$/)) {
            desired = "no-cache, no-store, must-revalidate";
          } else if (url?.startsWith("/assets/")) {
            desired = "public, max-age=31536000, immutable";
          }
          if (desired) {
            const setHeader = res.setHeader.bind(res);
            res.setHeader = (
              name: string,
              value: string | number | readonly string[],
            ) =>
              setHeader(
                name,
                name.toLowerCase() === "cache-control" ? desired! : value,
              );
          }
          next();
        },
      );
    },
  };
}

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
    federationCacheHeaders(),
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
