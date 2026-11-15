import { defineEventHandler, setResponseHeader } from "h3";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { homeContentRoute } from "@/lib/docs";

const PROFILE = "https://www.rfc-editor.org/info/rfc9727";

const catalogLinkset = (base: string) => ({
  linkset: [
    {
      anchor: `${base}/`,
      "api-catalog": [
        {
          href: `${base}${ROUTES.API_CATALOG}`,
          type: `application/linkset+json; profile="${PROFILE}"`,
        },
      ],
      describedby: [
        {
          href: `${base}${ROUTES.AGENT_SKILLS_INDEX}`,
          type: "application/json",
        },
        {
          href: `${base}${ROUTES.AGENT_SKILLS_SITE_SKILL}`,
          type: "text/markdown",
        },
      ],
      "service-desc": [
        { href: `${base}${ROUTES.OPENAPI}`, type: "application/json" },
      ],
      "service-doc": [
        { href: `${base}${ROUTES.DOCS}`, type: "text/html" },
        { href: `${base}${ROUTES.LLMS}`, type: "text/plain" },
        { href: `${base}${ROUTES.LLMS_FULL}`, type: "text/plain" },
        { href: `${base}${homeContentRoute}`, type: "text/markdown" },
        { href: LINK.SHADCN_MCP_DOCS, type: "text/html" },
      ],
      status: [
        { href: `${base}${ROUTES.API_STATUS}`, type: "application/json" },
      ],
    },
    {
      anchor: `${base}${ROUTES.REGISTRY}`,
      "service-desc": [
        { href: `${base}${ROUTES.OPENAPI}`, type: "application/json" },
      ],
      "service-doc": [{ href: `${base}${ROUTES.DOCS}`, type: "text/html" }],
      status: [
        { href: `${base}${ROUTES.API_STATUS}`, type: "application/json" },
      ],
    },
  ],
});

export default defineEventHandler((event) => {
  setResponseHeader(
    event,
    "content-type",
    `application/linkset+json; profile="${PROFILE}"`
  );
  return JSON.stringify(catalogLinkset(SITE.URL));
});
