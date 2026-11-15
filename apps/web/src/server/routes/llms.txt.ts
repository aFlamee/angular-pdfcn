import { defineEventHandler, setResponseHeader } from "h3";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { loadDocs } from "@/lib/content/source";
import { llmsIndex } from "@/lib/llms";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "text/plain; charset=utf-8");
  const base = SITE.URL;

  return `# ${SITE.NAME}

> ${SITE.DESCRIPTION.LONG} Use this index to discover the available documentation pages, markdown mirrors, and registry resources before browsing.

${llmsIndex(loadDocs().tree, base)}

## Machine-readable Resources

- [Full documentation](${base}${ROUTES.LLMS_FULL})
- [Homepage markdown](${base}${ROUTES.LLMS_MD}/content.md)
- [OpenAPI description](${base}${ROUTES.OPENAPI})
- [API catalog](${base}${ROUTES.API_CATALOG})
- [Agent skill](${base}${ROUTES.AGENT_SKILLS_SITE_SKILL})
- [shadcn MCP server documentation](${LINK.SHADCN_MCP_DOCS})
`;
});
