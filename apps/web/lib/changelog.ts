import type { DocsPageMeta } from "@/lib/content/types";

/** Changelog entries, newest first. Entry file names start with their date. */
export const getChangelogPages = (pages: readonly DocsPageMeta[]) =>
  pages
    .filter((page) => page.slugs[0] === "changelog" && page.slugs.length > 1)
    .toSorted((a, b) => b.slugs[1].localeCompare(a.slugs[1]));

/** The date an entry's file name starts with, such as `2026-08-13`. */
export const changelogDate = (page: DocsPageMeta) =>
  new Date(page.slugs[1].slice(0, "yyyy-mm-dd".length));
