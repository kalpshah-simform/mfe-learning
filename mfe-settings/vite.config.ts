import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";
import { dependencies } from "./package.json";

const sharedUrl =
  process.env.VITE_SHARED_REMOTE_URL ||
  "http://localhost:5178/remoteEntry.js";

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    federationCacheHeaders(),
    federation({
      name: "mfe-settings",
      filename: "remoteEntry.js",
      dts: false,
      exposes: {
        "./Settings": "./src/settings.ts",
      },
      remotes: {
        shared: {
          type: "module",
          name: "shared",
          entry: sharedUrl,
          entryGlobalName: "shared",
          shareScope: "default",
        },
      },
      shared: {
        vue: { requiredVersion: dependencies.vue, singleton: true },
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5177,
    strictPort: true,
    origin: "http://localhost:5177",
  },
  preview: {
    port: 5177,
    strictPort: true,
  },
});
