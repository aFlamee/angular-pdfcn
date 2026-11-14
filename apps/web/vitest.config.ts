import angular from "@analogjs/vite-plugin-angular";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [angular({ jit: false, tsconfig: "tsconfig.json" })],
  resolve: { alias: { "@": import.meta.dirname } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Let the Angular linker process partially compiled packages.
    server: { deps: { inline: [/@angular/] } },
  },
});
