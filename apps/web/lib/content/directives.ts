// The markdown dialect of `content/docs`: GFM plus remark-directive.
import type { Root } from "mdast";
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { componentsJson, TSCONFIG_PATHS } from "../install";
import { buildSiteUrl } from "../site-url";

export const parseMarkdown = (body: string) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(body) as Root;

export const directiveAttributes = (
  node: ContainerDirective | LeafDirective | TextDirective
) => {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(node.attributes ?? {})) {
    if (typeof value === "string") {
      attributes[key] = value;
    }
  }
  return attributes;
};

/** `::components-json`: the one-time `components.json` for this site's registry. */
export const componentsJsonCode = () =>
  JSON.stringify(componentsJson(buildSiteUrl()), null, 2);

/** `::tsconfig-paths`: the `tsconfig.json` entry for the `@/` imports. */
export const tsconfigPathsCode = () =>
  JSON.stringify({ compilerOptions: { paths: TSCONFIG_PATHS } }, null, 2);
