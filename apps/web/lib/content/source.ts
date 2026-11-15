// Reads `content/docs` the way fumadocs did: `meta.json` orders each folder, `(group)` folders add no URL segment.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { ROUTES } from "../../constants/routes";
import type {
  DocsPageMeta,
  DocsTree,
  DocsTreeFolder,
  DocsTreeNode,
  DocsTreePage,
} from "./types";

// Bundled server routes have no `import.meta.dirname`. They run from the app root.
export const APP_ROOT = import.meta.dirname
  ? path.resolve(import.meta.dirname, "../..")
  : process.cwd();
export const DOCS_ROOT = path.join(APP_ROOT, "content/docs");

interface FolderMeta {
  title?: string;
  pages?: string[];
}

export interface Frontmatter {
  title: string;
  description?: string;
  links?: { doc?: string; api?: string };
}

export const splitFrontmatter = (source: string) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return {
    body: match ? source.slice(match[0].length) : source,
    data: (match ? parseYaml(match[1]) : {}) as Frontmatter,
  };
};

const readMeta = (dir: string): FolderMeta => {
  const file = path.join(dir, "meta.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf-8")) : {};
};

const urlOf = (relativePath: string) => {
  const segments = relativePath
    .replace(/\.md$/, "")
    .split("/")
    .filter((segment) => !/^\(.+\)$/.test(segment) && segment !== "index");
  return {
    slugs: segments,
    url: segments.length ? `${ROUTES.DOCS}/${segments.join("/")}` : ROUTES.DOCS,
  };
};

const readPage = (relativePath: string): DocsPageMeta => {
  const { data } = splitFrontmatter(
    readFileSync(path.join(DOCS_ROOT, relativePath), "utf-8")
  );
  return {
    description: data.description,
    path: relativePath,
    title: data.title,
    ...urlOf(relativePath),
  };
};

const entriesOf = (relativeDir: string) => {
  const dir = path.join(DOCS_ROOT, relativeDir);
  const names = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/, ""));
  const order = readMeta(dir).pages;
  // meta.json `[""]` and missing entries fall back to every entry, in name order.
  const listed = order?.filter((name) => names.includes(name)) ?? [];
  return listed.length ? listed : names.toSorted();
};

const buildFolder = (relativeDir: string, pages: DocsPageMeta[]) => {
  const children: DocsTreeNode[] = [];
  for (const name of entriesOf(relativeDir)) {
    const relative = relativeDir ? `${relativeDir}/${name}` : name;
    if (existsSync(path.join(DOCS_ROOT, `${relative}.md`))) {
      const page = readPage(`${relative}.md`);
      pages.push(page);
      children.push({
        description: page.description,
        name: page.title,
        type: "page",
        url: page.url,
      });
    } else {
      const meta = readMeta(path.join(DOCS_ROOT, relative));
      children.push({
        $id: relative,
        children: buildFolder(relative, pages),
        name: meta.title ?? name,
        type: "folder",
      } satisfies DocsTreeFolder);
    }
  }
  return children;
};

/**
 * The sidebar tree and every docs page: the tree's pages in order, then pages no `meta.json` lists,
 * such as the changelog entries, like fumadocs' `getPages()`.
 */
export const loadDocs = () => {
  const pages: DocsPageMeta[] = [];
  const tree: DocsTree = {
    children: buildFolder("", pages),
    name: readMeta(DOCS_ROOT).title ?? "Documentation",
  };
  const listed = new Set(pages.map((page) => page.path));
  const unlisted = readdirSync(DOCS_ROOT, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith(".md") && !listed.has(file))
    .toSorted();
  return { pages: [...pages, ...unlisted.map(readPage)], tree };
};

const pagesOf = (folder: DocsTreeFolder): DocsTreePage[] =>
  folder.children.flatMap((child) =>
    child.type === "page" ? [child] : pagesOf(child)
  );

/** The reference's `ComponentsList` pages: every page of a section, or of one base in it. */
export const sectionPages = (
  tree: DocsTree,
  folderName: string,
  base: string
): DocsTreePage[] => {
  const folder = tree.children.find(
    (node): node is DocsTreeFolder =>
      node.type === "folder" && node.name === folderName
  );
  if (!folder) {
    return [];
  }
  const sectionUrl = `${ROUTES.DOCS}/${folderName.toLowerCase()}`;
  const baseFolder = folder.children.find(
    (child): child is DocsTreeFolder =>
      child.type === "folder" && child.$id.endsWith(`/${base}`)
  );
  return (baseFolder ? pagesOf(baseFolder) : pagesOf(folder)).filter(
    (page) => page.url !== sectionUrl && page.url !== `${sectionUrl}/${base}`
  );
};
