import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { dependencies } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe-marketing",
      filename: "remoteEntry.js",
      dts: false,
      exposes: {
        "./Marketing": "./src/marketing.tsx",
      },
      shared: {
        react: { requiredVersion: dependencies.react, singleton: true },
        "react-dom": {
          requiredVersion: dependencies["react-dom"],
          singleton: true,
        },
        "shared/store": { requiredVersion: dependencies.shared, singleton: true },
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5176,
    strictPort: true,
    origin: "http://localhost:5176",
  },
  preview: {
    port: 5176,
    strictPort: true,
  },
});
