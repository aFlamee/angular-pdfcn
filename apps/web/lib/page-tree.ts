import { ROUTES } from "@/constants/routes";
import { DEFAULT_BASE } from "@/lib/bases";
import type {
  DocsTree,
  DocsTreeFolder,
  DocsTreePage,
} from "@/lib/content/types";
import {
  EXCLUDED_SECTIONS,
  isBlocksFolder,
  isComponentsFolder,
  isThemesFolder,
} from "@/lib/docs";

export interface TreeGroup {
  label: string;
  pages: DocsTreePage[];
}

export const getAllPagesFromFolder = (
  folder: DocsTreeFolder
): DocsTreePage[] => {
  const pages: DocsTreePage[] = [];

  for (const child of folder.children) {
    if (child.type === "page") {
      pages.push(child);
    } else {
      pages.push(...getAllPagesFromFolder(child));
    }
  }

  return pages;
};

export const getPagesFromFolder = (folder: DocsTreeFolder): DocsTreePage[] =>
  folder.children.filter(
    (child): child is DocsTreePage => child.type === "page"
  );

const matchesBase = (folder: DocsTreeFolder, base: string): boolean =>
  folder.$id === base ||
  folder.$id.endsWith(`/${base}`) ||
  folder.name.toLowerCase() === base.toLowerCase();

export const findBaseFolder = (
  folder: DocsTreeFolder,
  base: string
): DocsTreeFolder | undefined =>
  folder.children.find(
    (child): child is DocsTreeFolder =>
      child.type === "folder" && matchesBase(child, base)
  );

export const getFolderPages = (
  folder: DocsTreeFolder,
  base?: string
): DocsTreePage[] => {
  if (base) {
    const baseFolder = findBaseFolder(folder, base);
    if (!baseFolder) {
      return [];
    }

    return getAllPagesFromFolder(baseFolder);
  }

  return getAllPagesFromFolder(folder);
};

export const getCurrentBase = (pathname: string): string => {
  const baseScopedMatch = pathname.match(
    /\/docs\/(?:components|blocks|theming)\/([^/]+)(?:\/|$)/
  );
  if (baseScopedMatch) {
    return baseScopedMatch[1];
  }

  return DEFAULT_BASE;
};

export const getTreeGroups = (
  tree: DocsTree,
  currentBase: string
): TreeGroup[] => {
  const groups: TreeGroup[] = [];

  for (const item of tree.children) {
    if (item.type !== "folder") {
      continue;
    }
    if (EXCLUDED_SECTIONS.has(item.$id)) {
      continue;
    }

    if (isThemesFolder(item)) {
      const pages = getAllPagesFromFolder(item).filter(
        (page) =>
          !page.url.endsWith("/themes") && !page.url.endsWith("/themes/")
      );
      if (pages.length > 0) {
        groups.push({ label: "Themes", pages });
      }
    } else if (isComponentsFolder(item)) {
      // Components sit in one folder per base (takumi, forme).
      const baseFolder = findBaseFolder(item, currentBase);
      const pages = baseFolder
        ? getAllPagesFromFolder(baseFolder).filter(
            (page) =>
              page.url !== ROUTES.DOCS_COMPONENTS &&
              page.url !== `${ROUTES.DOCS_COMPONENTS}/${currentBase}`
          )
        : getAllPagesFromFolder(item).filter(
            (page) => page.url !== ROUTES.DOCS_COMPONENTS
          );
      if (pages.length > 0) {
        groups.push({ label: "Components", pages });
      }
    } else if (isBlocksFolder(item)) {
      const pages = getFolderPages(item, currentBase).filter(
        (page) =>
          page.url !== ROUTES.DOCS_BLOCKS &&
          page.url !== `${ROUTES.DOCS_BLOCKS}/${currentBase}`
      );
      if (pages.length > 0) {
        groups.push({ label: item.name, pages });
      }
    } else if (item.$id !== "theming" && item.name !== "Theming") {
      // Theming pages are reached through the Sections nav.
      const pages = getPagesFromFolder(item);
      if (pages.length > 0) {
        groups.push({ label: item.name, pages });
      }
    }
  }

  return groups;
};
