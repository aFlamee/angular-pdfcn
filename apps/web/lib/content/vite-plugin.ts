import path from "node:path";

import type { Plugin } from "vite";

import { compileDoc } from "./compile";
import { DOCS_ROOT, loadDocs } from "./source";

const VIRTUAL_ID = "virtual:docs";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/** Serves `virtual:docs` (tree, page list, page loaders) and compiles each docs `.md` file. */
export const docsContent = (): Plugin => ({
  enforce: "pre",
  load(id) {
    if (id !== RESOLVED_ID) {
      return null;
    }
    const { pages, tree } = loadDocs();
    for (const page of pages) {
      this.addWatchFile(path.join(DOCS_ROOT, page.path));
    }
    const loaders = pages
      .map(
        (page) =>
          `${JSON.stringify(page.url)}: () => import(${JSON.stringify(path.join(DOCS_ROOT, page.path))}).then((m) => m.default)`
      )
      .join(",\n");
    return [
      `export const tree = ${JSON.stringify(tree)};`,
      `export const pages = ${JSON.stringify(pages)};`,
      `export const loaders = {\n${loaders}\n};`,
    ].join("\n");
  },
  name: "docs-content",
  resolveId(id) {
    return id === VIRTUAL_ID ? RESOLVED_ID : null;
  },
  transform(source, id) {
    if (!id.startsWith(DOCS_ROOT) || !id.endsWith(".md")) {
      return null;
    }
    const page = compileDoc(
      path.relative(DOCS_ROOT, id),
      source,
      loadDocs().tree
    );
    return { code: `export default ${JSON.stringify(page)};`, map: null };
  },
});
