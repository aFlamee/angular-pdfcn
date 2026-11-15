import { ROUTES } from "./routes";
import { SITE } from "./site";

/** Tags outbound links with this site as the source. */
export const UTM_SOURCE = { utm_source: new URL(SITE.URL).hostname };

export const TOP_LEVEL_SECTIONS = [
  { href: ROUTES.DOCS, name: "Introduction" },
  { href: ROUTES.DOCS_INSTALLATION, name: "Installation" },
  { href: ROUTES.DOCS_COMPONENTS, name: "Components" },
  { href: ROUTES.DOCS_BLOCKS, name: "Blocks" },
  { href: ROUTES.DOCS_THEMING, name: "Theming" },
  { href: ROUTES.DOCS_MCP, name: "MCP" },
  { href: ROUTES.DOCS_REGISTRY, name: "Registry" },
  { href: ROUTES.LLMS, name: "llms.txt" },
  { href: ROUTES.DOCS_CHANGELOG, name: "Changelog" },
];
