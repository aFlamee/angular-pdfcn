import path from "node:path";

import analog from "@analogjs/platform";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { docsContent } from "./lib/content/vite-plugin";
import { prerenderRoutes } from "./lib/prerender-routes";

export default defineConfig({
  plugins: [
    docsContent(),
    tailwindcss(),
    analog({
      nitro: {
        alias: { "@": import.meta.dirname },
        // Plain static files on every host. vercel.json also clears VERCEL, which Analog checks.
        preset: "static",
      },
      prerender: { routes: prerenderRoutes },
      static: true,
      vite: { tsconfig: path.join(import.meta.dirname, "tsconfig.json") },
    }),
  ],
  resolve: { alias: { "@": import.meta.dirname } },
});
