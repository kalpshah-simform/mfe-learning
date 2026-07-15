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
    federation({
      name: "mfe-auth",
      filename: "remoteEntry.js",
      dts: false,
      exposes: {
        "./Auth": "./src/auth.tsx",
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
    port: 5174,
    strictPort: true,
    origin: "http://localhost:5174",
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
});
