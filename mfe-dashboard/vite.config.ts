import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { dependencies } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe-dashboard",
      filename: "remoteEntry.js",
      dts: false,
      exposes: {
        "./Dashboard": "./src/dashboard.tsx",
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
    port: 5175,
    strictPort: true,
    origin: "http://localhost:5175",
  },
  preview: {
    port: 5175,
    strictPort: true,
  },
});
