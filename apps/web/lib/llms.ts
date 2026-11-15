import { AGENT_DOCS_DIRECTIVE_MARKDOWN } from "@/lib/agent-discovery/directive";
import { docToMarkdown } from "@/lib/content/markdown";
import { loadDocs } from "@/lib/content/source";
import type { DocsPageMeta, DocsTree, DocsTreeNode } from "@/lib/content/types";

/** A docs page as markdown, headed by its title, description, and the agent directive. */
export const getLLMText = (page: DocsPageMeta) => {
  const sections = [
    page.description,
    AGENT_DOCS_DIRECTIVE_MARKDOWN,
    docToMarkdown(page.path),
  ].filter(Boolean);

  return `# ${page.title}

${sections.join("\n\n")}`;
};

/** The markdown of the docs page at `url`, if there is one. */
export const docsPageMarkdown = (url: string) => {
  const page = loadDocs().pages.find((candidate) => candidate.url === url);
  return page && getLLMText(page);
};

const markdownLink = (title: string, url: string) =>
  `[${title.replaceAll(/([[\]])/g, String.raw`\$1`)}](${url.replaceAll(/([()])/g, String.raw`\$1`)})`;

const listItem = (text: string, indent: number, description = "") =>
  `${"  ".repeat(indent)}- ${text}${description.trim() ? `: ${description.trim()}` : ""}`;

const indexNode = (node: DocsTreeNode, indent: number, base: string): string =>
  node.type === "page"
    ? listItem(
        markdownLink(node.name, `${base}${node.url}.md`),
        indent,
        node.description
      )
    : [
        listItem(node.name, indent),
        ...node.children.map((child) => indexNode(child, indent + 1, base)),
      ].join("\n");

/** The docs tree as a nested markdown list linking each page's `.md` mirror, like fumadocs' `llms().index()`. */
export const llmsIndex = (tree: DocsTree, base: string) =>
  [
    `## ${tree.name}`,
    "",
    ...tree.children.map((node) => indexNode(node, 0, base)),
  ].join("\n");
