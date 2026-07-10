import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import prefixSelector from "postcss-prefix-selector";
import { dependencies } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        // Scopes destyle.css's global reset (body/html/:root/bare-element
        // selectors) under .mfe-dash-scope so it can't affect the container
        // shell or mfe-auth's content once federated. includeFiles
        // restricts the transform to destyle.css's own file — our own
        // already-prefixed tokens (index.module.css) and
        // standalone-shell.css are untouched.
        prefixSelector({
          prefix: ".mfe-dash-scope",
          includeFiles: [/destyle/],
        }),
      ],
    },
  },
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
