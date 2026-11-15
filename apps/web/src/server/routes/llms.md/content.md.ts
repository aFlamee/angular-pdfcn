import { defineEventHandler, setResponseHeader } from "h3";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { AGENT_DOCS_DIRECTIVE_MARKDOWN } from "@/lib/agent-discovery/directive";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "text/markdown; charset=utf-8");
  const base = SITE.URL;

  return `# ${SITE.NAME}

${SITE.DESCRIPTION.LONG}

${AGENT_DOCS_DIRECTIVE_MARKDOWN}

## Quick links

- [Get started](${base}${ROUTES.DOCS_INSTALLATION}.md)
- [Browse components](${base}${ROUTES.DOCS_COMPONENTS}.md)
- [Documentation](${base}${ROUTES.DOCS}.md)
- [LLM index (llms.txt)](${base}${ROUTES.LLMS})
- [API catalog](${base}${ROUTES.API_CATALOG})
- [OpenAPI description](${base}${ROUTES.OPENAPI})
- [Agent skills index](${base}${ROUTES.AGENT_SKILLS_INDEX})
`;
});
