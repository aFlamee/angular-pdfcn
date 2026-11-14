import { defineConfig } from "oxlint";
import angular from "ultracite/oxlint/angular";
import core from "ultracite/oxlint/core";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, angular, vitest],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".agents/**",
    ".cursor/**",
    ".changeset/**",
    ".claude/**",
    "apps/web/public/r/**",
    "apps/web/fixtures/**",
  ],
  rules: {
    // Template helpers are instance members so templates can call them.
    "eslint/class-methods-use-this": "off",
    // A component family (table, row, cell) lives in one file, like the original.
    "eslint/max-classes-per-file": "off",
    // Angular components are decorated classes, often with no members.
    "typescript/no-extraneous-class": "off",
  },
});
