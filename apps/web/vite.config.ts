import path from "node:path";

import analog from "@analogjs/platform";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { docsContent } from "./lib/content/vite-plugin";
import { prerenderRoutes } from "./lib/prerender-routes";
import { buildSiteUrl } from "./lib/site-url";

const siteUrl = JSON.stringify(buildSiteUrl());

export default defineConfig({
  define: { "import.meta.env.SITE_URL": siteUrl },
  plugins: [
    docsContent(),
    tailwindcss(),
    analog({
      nitro: {
        alias: { "@": import.meta.dirname },
        replace: { "import.meta.env.SITE_URL": siteUrl },
      },
      prerender: { routes: prerenderRoutes },
      static: true,
      vite: { tsconfig: path.join(import.meta.dirname, "tsconfig.json") },
    }),
  ],
  resolve: { alias: { "@": import.meta.dirname } },
});
