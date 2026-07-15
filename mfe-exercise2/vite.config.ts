import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { dependencies } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe-exercise2",
      filename: "remoteEntry.js",
      dts: false,
      remotes: {
        "mfe-dashboard": {
          type: "module",
          name: "mfe-dashboard",
          entry: "http://localhost:5175/remoteEntry.js",
          entryGlobalName: "mfe-dashboard",
          shareScope: "default",
        },
        "mfe-marketing": {
          type: "module",
          name: "mfe-marketing",
          entry: "http://localhost:5176/remoteEntry.js",
          entryGlobalName: "mfe-marketing",
          shareScope: "default",
        },
        "mfe-auth": {
          type: "module",
          name: "mfe-auth",
          entry: "http://localhost:5174/remoteEntry.js",
          entryGlobalName: "mfe-auth",
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
    port: 5178,
    strictPort: true,
    origin: "http://localhost:5178",
  },
  preview: {
    port: 5178,
    strictPort: true,
  },
});
