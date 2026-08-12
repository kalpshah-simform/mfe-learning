import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import prefixSelector from "postcss-prefix-selector";
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
  css: {
    postcss: {
      plugins: [
        // Scopes Bootstrap's global reset (body/html/:root/bare-element
        // selectors) under .mfe-auth-scope so it can't affect the container
        // shell or mfe-dashboard's content once federated. includeFiles
        // restricts the transform to Bootstrap's own CSS — our own
        // already-prefixed tokens (index.css) and standalone-shell.css are
        // untouched.
        prefixSelector({
          prefix: ".mfe-auth-scope",
          includeFiles: [/bootstrap/],
        }),
      ],
    },
  },
  plugins: [
    react(),
    federationCacheHeaders(),
    federation({
      name: "mfe-auth",
      filename: "remoteEntry.js",
      dts: false,
      exposes: {
        "./Auth": "./src/auth.tsx",
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
    port: 5174,
    strictPort: true,
    origin: "http://localhost:5174",
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
});
