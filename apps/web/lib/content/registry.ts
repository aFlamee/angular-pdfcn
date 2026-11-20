// Registry items and repo sources, shown the way `shadcn add` installs them.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { LICENSE_NOTICE, REGISTRY_NAMESPACE } from "../install";
import { APP_ROOT } from "./source";

interface RegistryItem {
  name: string;
  files: { path: string; target: string }[];
  dependencies?: string[];
  registryDependencies?: string[];
}

const readRegistry = () => {
  const { items } = JSON.parse(
    readFileSync(path.join(APP_ROOT, "registry.json"), "utf-8")
  ) as { items: RegistryItem[] };
  const targets = new Map(
    items.flatMap((item) => item.files.map((file) => [file.path, file.target]))
  );
  return { items: new Map(items.map((item) => [item.name, item])), targets };
};

/** Shows registry imports as the paths `shadcn add` writes, like the published registry. */
const toInstalledPaths = (code: string, targets: Map<string, string>) =>
  code.replaceAll(/(["'])@\/(registry\/[^"']+)\1/g, (match, quote, source) => {
    const target = ["", ".ts", "/index.ts"]
      .map((extension) => targets.get(`${source}${extension}`))
      .find(Boolean);
    return target ? `${quote}@/${target.replace(/\.ts$/, "")}${quote}` : match;
  });

/** The packages and files `shadcn add` installs for an item and its registry dependencies. */
export const installPlan = (itemName: string, docFile: string) => {
  const { items, targets } = readRegistry();
  const prefix = `${REGISTRY_NAMESPACE}/`;
  const ordered: RegistryItem[] = [];
  const visit = (name: string) => {
    const item = items.get(name);
    if (!item) {
      throw new Error(`${docFile}: unknown registry item "${name}"`);
    }
    if (ordered.includes(item)) {
      return;
    }
    ordered.push(item);
    for (const dependency of item.registryDependencies ?? []) {
      visit(
        dependency.startsWith(prefix)
          ? dependency.slice(prefix.length)
          : dependency
      );
    }
  };
  visit(itemName);

  const packages = [
    ...new Set(
      ordered
        .flatMap((item) => item.dependencies ?? [])
        .map((dependency) => dependency.replace(/(.)@[^@]*$/, "$1"))
    ),
  ];
  // Files that are not ported yet are left out.
  const files = [
    ...new Map(
      ordered.flatMap((item) => item.files).map((file) => [file.path, file])
    ).values(),
  ]
    .filter((file) => existsSync(path.join(APP_ROOT, file.path)))
    .map((file) => ({
      code: `${toInstalledPaths(
        readFileSync(path.join(APP_ROOT, file.path), "utf-8"),
        targets
      ).trim()}\n\n${LICENSE_NOTICE}`,
      target: file.target,
    }));
  return { files, packages };
};

/** An example as users would write it, or `undefined` while it is not ported. */
export const exampleSource = (base: string, name: string) => {
  const file = path.join(APP_ROOT, "examples", base, `${name}.ts`);
  if (!existsSync(file)) {
    return;
  }
  return toInstalledPaths(readFileSync(file, "utf-8"), readRegistry().targets)
    .replace("export default class", "export class")
    .trim();
};

/** A repo file with installed import paths. */
export const fileSource = (src: string, docFile: string) => {
  const file = path.join(APP_ROOT, src);
  if (!existsSync(file)) {
    throw new Error(`${docFile}: no file at ${src}`);
  }
  return toInstalledPaths(
    readFileSync(file, "utf-8"),
    readRegistry().targets
  ).trim();
};
