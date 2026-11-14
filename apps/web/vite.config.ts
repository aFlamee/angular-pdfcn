import analog from "@analogjs/platform";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    analog({
      prerender: { routes: ["/"] },
      static: true,
    }),
  ],
  resolve: { alias: { "@": import.meta.dirname } },
});
