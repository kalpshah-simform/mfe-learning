import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { dependencies } from "./package.json";

const mfeAuthUrl =
  process.env.VITE_AUTH_REMOTE_URL || "http://localhost:5174/remoteEntry.js";
const mfeDashboardUrl =
  process.env.VITE_DASHBOARD_REMOTE_URL ||
  "http://localhost:5175/remoteEntry.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe-exercise1",
      filename: "remoteEntry.js",
      dts: false,
      remotes: {
        "mfe-auth": {
          type: "module",
          name: "mfe-auth",
          entry: mfeAuthUrl,
          entryGlobalName: "mfe-auth",
          shareScope: "default",
        },
        "mfe-dashboard": {
          type: "module",
          name: "mfe-dashboard",
          entry: mfeDashboardUrl,
          entryGlobalName: "mfe-dashboard",
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
    port: 3001,
    strictPort: true,
    origin: "http://localhost:3001",
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
});
