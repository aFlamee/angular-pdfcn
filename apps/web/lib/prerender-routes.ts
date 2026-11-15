import { ROUTES } from "../constants/routes";
import { loadDocs } from "./content/source";

/** Every route the static build writes. */
export const prerenderRoutes = () => {
  const { pages } = loadDocs();
  return Promise.resolve([
    ROUTES.HOME,
    ROUTES.SPONSOR,
    ROUTES.THEME_BUILDER,
    ROUTES.THEME_BUILDER_FORME,
    ROUTES.THEME_BUILDER_TAKUMI,
    "/404.html",
    ...pages.map((page) => page.url),
    ROUTES.DOCS_THEMING,
    ...pages.map((page) => `${page.url}.md`),
    ROUTES.LLMS,
    ROUTES.LLMS_FULL,
    `${ROUTES.LLMS_MD}/content.md`,
    ...pages.map((page) => `${ROUTES.LLMS_MD}${page.url}/content.md`),
    ROUTES.RSS,
    ROUTES.ROBOTS,
    ROUTES.SITEMAP,
    ROUTES.MANIFEST,
    ROUTES.OPENAPI,
    ROUTES.API_CATALOG,
    ROUTES.AGENT_SKILLS_INDEX,
    ROUTES.AGENT_SKILLS_SITE_SKILL,
    ROUTES.API_STATUS,
  ]);
};
