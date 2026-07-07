import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // `singleton` and `dts` are valid runtime options missing from this package's shipped types in v1.4.1
    federation({
      name: "mfe-marketing",
      filename: "remoteEntry.js",
      exposes: {
        "./Marketing": "./src/marketing-bootstrap.tsx",
      },
      // Not shared: v1.4.1 doesn't route react-dom/client's internal `react` import through
      // shared-scope negotiation, so a singleton react-dom/client here fights the host's
      // separately-registered react instance and throws "Invalid hook call".
      dts: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5176,
    strictPort: true,
  },
  preview: {
    port: 5176,
    strictPort: true,
  },
});
