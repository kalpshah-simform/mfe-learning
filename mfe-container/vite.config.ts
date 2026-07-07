import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // `singleton` and `dts` are valid runtime options missing from this package's shipped types in v1.4.1
    federation({
      name: "mfe-container",
      remotes: {
        "mfe-dashboard": "http://localhost:5175/assets/remoteEntry.js",
        "mfe-marketing": "http://localhost:5176/assets/remoteEntry.js",
        "mfe-auth": "http://localhost:5174/assets/remoteEntry.js",
      },
      // Not shared: remotes each mount their own independent React root and bundle their
      // own self-consistent React copy (see vite.config.ts comments in the remote repos).
      dts: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});
