import type { Type } from "@angular/core";

export type BaseName = "forme" | "takumi";

const modules = import.meta.glob<{ default: Type<unknown> }>(
  "./{forme,takumi}/*.ts",
  { eager: true }
);

/** Every example's default export, keyed by base and file name. */
export const demos: Record<BaseName, Record<string, Type<unknown>>> = {
  forme: {},
  takumi: {},
};
for (const [file, module] of Object.entries(modules)) {
  const [, base, name] = file.match(/^\.\/(\w+)\/(.+)\.ts$/) ?? [];
  demos[base as BaseName][name] = module.default;
}
