import { ROUTES } from "@/constants/routes";
import type { DocsTreeFolder } from "@/lib/content/types";
import { formatLabelFromSlug } from "@/lib/utils";

/** The docs folder from the repository root, for edit links. */
export const DOCS_DIR = `apps/web/content${ROUTES.DOCS}`;

export const EXCLUDED_SECTIONS = new Set([
  "installation",
  "changelog",
  "(root)",
]);

export const isComponentsFolder = (folder: DocsTreeFolder) =>
  folder.$id === "components" || folder.name === "Components";

export const isBlocksFolder = (folder: DocsTreeFolder) =>
  folder.$id === "blocks" || folder.name === "Blocks";

export const isThemesFolder = (folder: DocsTreeFolder) =>
  folder.$id === "themes" || folder.name === "Themes";

export type DocsSidebarPanel = "components" | "blocks" | "themes";

const isPathWithin = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export const getDocsSidebarPanel = (
  pathname: string
): DocsSidebarPanel | null => {
  if (isPathWithin(pathname, ROUTES.DOCS_COMPONENTS)) {
    return "components";
  }
  if (isPathWithin(pathname, ROUTES.DOCS_BLOCKS)) {
    return "blocks";
  }
  if (isPathWithin(pathname, ROUTES.DOCS_THEMES)) {
    return "themes";
  }
  return null;
};

const TITLE_OVERRIDES: Record<string, string> = {
  json: "JSON",
  "qr-code": "QR Code",
};

export const formatTitleFromSlug = (slug: string): string =>
  TITLE_OVERRIDES[slug] ?? formatLabelFromSlug(slug);

export const homeContentRoute = `${ROUTES.LLMS_MD}/content.md`;
export const docsContentRoute = `${ROUTES.LLMS_MD}${ROUTES.DOCS}`;

export const PAGES_NEW: string[] = [ROUTES.DOCS_CHANGELOG];
