import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { addCommand } from "@/lib/install";

import { pages } from "../../lib/docs-source";
import type { WebMcpTool } from "./web-mcp";

const DOC_PAGES = [
  ...pages.map(({ description, title, url }) => ({
    description,
    path: url,
    title,
  })),
  {
    description: "LLM-friendly documentation index",
    path: ROUTES.LLMS,
    title: "llms.txt",
  },
];

export const openDocsTool: WebMcpTool<{ path?: string }> = {
  description: `Navigate to a ${SITE.NAME} documentation page. Use this to learn about components, theming, installation, or any other topic.`,
  execute: ({ path }) => {
    const target = path || ROUTES.DOCS;
    window.location.assign(target);
    return { ok: true, path: target };
  },
  inputSchema: {
    properties: {
      path: {
        description:
          "Documentation path (e.g. /docs/installation, /docs/components). If omitted, opens the main docs page.",
        type: "string",
      },
    },
    type: "object",
  },
  name: `${SITE.NAME}_open_docs`,
};

export const listDocsTool: WebMcpTool = {
  annotations: {
    readOnlyHint: true,
  },
  description:
    "List all available documentation pages with their paths and descriptions. Use this to discover what documentation is available.",
  execute: () => DOC_PAGES,
  inputSchema: {
    properties: {},
    type: "object",
  },
  name: `${SITE.NAME}_list_docs`,
};

export const getInstallCommandTool: WebMcpTool<{ component: string }> = {
  annotations: {
    readOnlyHint: true,
  },
  description: `Get the npx shadcn add command to install a specific ${SITE.NAME} component or block into the user's project.`,
  execute: ({ component }) => ({
    command: addCommand(component),
    component,
    docsUrl: ROUTES.DOCS_INSTALLATION,
    registryUrl: `${SITE.URL}/r/${component}.json`,
  }),
  inputSchema: {
    properties: {
      component: {
        description:
          "Component or block name (e.g. takumi/text, forme/invoice-classic)",
        type: "string",
      },
    },
    required: ["component"],
    type: "object",
  },
  name: `${SITE.NAME}_get_install_command`,
};
