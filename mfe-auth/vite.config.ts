import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // `singleton` and `dts` are valid runtime options missing from this package's shipped types in v1.4.1
    federation({
      name: "mfe-auth",
      filename: "remoteEntry.js",
      exposes: {
        "./Auth": "./src/auth.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
      dts: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  ],
  build: {
    target: "esnext",
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
});
