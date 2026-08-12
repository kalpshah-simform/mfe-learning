import { defineConfig } from "vite";
import { federation } from "@module-federation/vite";

// remoteEntry.js is the manifest a host fetches to discover this remote's
// chunks. If a CDN/browser caches a stale copy after a redeploy, it can
// point at chunk files that no longer exist and crash the host. Serve it
// no-cache while hashed chunks (safe to cache forever, since their name
// changes with their content) get a long-lived immutable cache.
function federationCacheHeaders() {
  return {
    name: "federation-cache-headers",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        let desired = null;
        if (url?.match(/\/remoteEntry(\.ssr)?\.js$/)) {
          desired = "no-cache, no-store, must-revalidate";
        } else if (url?.startsWith("/assets/")) {
          desired = "public, max-age=31536000, immutable";
        }
        if (desired) {
          const setHeader = res.setHeader.bind(res);
          res.setHeader = (name, value) =>
            setHeader(
              name,
              name.toLowerCase() === "cache-control" ? desired : value,
            );
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    federationCacheHeaders(),
    federation({
      name: "shared",
      filename: "remoteEntry.js",
      dts: false,
      exposes: {
        "./store": "./store.js",
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5178,
    strictPort: true,
    origin: "http://localhost:5178",
  },
  preview: {
    port: 5178,
    strictPort: true,
  },
});
