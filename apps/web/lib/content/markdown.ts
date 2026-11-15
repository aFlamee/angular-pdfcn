import { readFileSync } from "node:fs";
import path from "node:path";

import type { RootContent } from "mdast";
import type { ContainerDirective, LeafDirective } from "mdast-util-directive";
import { toString } from "mdast-util-to-string";

import { addCommand } from "../install";
import {
  componentsJsonCode,
  directiveAttributes,
  parseMarkdown,
  tsconfigPathsCode,
} from "./directives";
import { exampleSource, fileSource, installPlan } from "./registry";
import { DOCS_ROOT, loadDocs, sectionPages, splitFrontmatter } from "./source";
import type { DocsTree } from "./types";

interface MarkdownContext {
  file: string;
  source: string;
  tree: DocsTree;
}

const fence = (lang: string, code: string, title?: string) =>
  `\`\`\`${lang}${title ? ` title="${title}"` : ""}\n${code}\n\`\`\``;

const pageLinks = (tree: DocsTree, folderName: string, base: string) =>
  sectionPages(tree, folderName, base)
    .map((page) => `- [${page.name}](${page.url})`)
    .join("\n");

const installation = (itemName: string, file: string) => {
  const { files, packages } = installPlan(itemName, file);
  return [
    fence("bash", addCommand(itemName)),
    ...(packages.length > 0
      ? [
          "To install manually, add the dependencies:",
          fence("bash", `npm install ${packages.join(" ")}`),
          "Then copy these files into your project and update the import paths to match your setup:",
        ]
      : [
          "To install manually, copy these files into your project and update the import paths to match your setup:",
        ]),
    files.map((entry) => `- \`${entry.target}\``).join("\n"),
  ].join("\n\n");
};

type Directive = ContainerDirective | LeafDirective;

type DirectiveHandler = (
  node: Directive,
  attributes: Record<string, string>,
  context: MarkdownContext
) => string;

const childBlocks = (node: Directive, context: MarkdownContext) =>
  // oxlint-disable-next-line no-use-before-define -- mutual recursion
  blocks(node.children as RootContent[], context);

const nothing = () => "";

// Each directive as plain markdown. Previews and icons have no text form.
const DIRECTIVES: Record<string, DirectiveHandler> = {
  "add-command": (_node, { names }) =>
    fence("bash", addCommand(...names.split(/\s+/))),
  callout: (node, { title }, context) =>
    [title && `**${title}**`, childBlocks(node, context)]
      .filter(Boolean)
      .join("\n\n")
      .split("\n")
      .map((line) => (line ? `> ${line}` : ">"))
      .join("\n"),
  "components-json": () =>
    fence("json", componentsJsonCode(), "components.json"),
  "components-list": (_node, { base, folder }, context) =>
    pageLinks(context.tree, folder ?? "Components", base ?? "takumi"),
  example: (_node, { base, name }) => {
    const code = exampleSource(base, name);
    return code === undefined
      ? `The ${base}/${name} example is not ported yet.`
      : fence("ts", code);
  },
  "feature-card": (_node, { description, title }) =>
    `- **${title}**: ${description}`,
  // Feature cards read as one tight list.
  grid: (node, _attributes, context) =>
    childBlocks(node, context).replaceAll("\n\n- **", "\n- **"),
  icon: nothing,
  installation: (_node, { base, name }, context) =>
    installation(base ? `${base}/${name}` : name, context.file),
  "linked-card": (node, { href }) => `[${toString(node)}](${href})`,
  preview: nothing,
  source: (_node, { src, title }, context) =>
    fence(path.extname(src).slice(1), fileSource(src, context.file), title),
  steps: (node, _attributes, context) => childBlocks(node, context),
  tabs: (node, _attributes, context) =>
    node.children
      .flatMap((tab) =>
        tab.type === "containerDirective" && tab.name === "tab"
          ? [
              `#### ${directiveAttributes(tab)["label"]}`,
              childBlocks(tab, context),
            ]
          : []
      )
      .join("\n\n"),
  "theme-preview": nothing,
  "theme-preview-grid": (_node, _attributes, context) =>
    pageLinks(context.tree, "Themes", ""),
  "tsconfig-paths": () => fence("json", tsconfigPathsCode(), "tsconfig.json"),
};

const blocks = (nodes: RootContent[], context: MarkdownContext): string =>
  nodes
    .map((node) => {
      if (node.type === "containerDirective" || node.type === "leafDirective") {
        if (!Object.hasOwn(DIRECTIVES, node.name)) {
          throw new Error(`${context.file}: unknown directive "${node.name}"`);
        }
        return DIRECTIVES[node.name](node, directiveAttributes(node), context);
      }
      // Plain markdown stays as written, minus inline icons.
      return context.source
        .slice(node.position?.start.offset, node.position?.end.offset)
        .replaceAll(/:icon\{[^}]*\}\s?/g, "");
    })
    .filter(Boolean)
    .join("\n\n");

/** A docs page body as plain markdown, for the llms routes. Directives become markdown. */
export const docToMarkdown = (relativePath: string) => {
  const { body } = splitFrontmatter(
    readFileSync(path.join(DOCS_ROOT, relativePath), "utf-8")
  );
  return blocks(parseMarkdown(body).children, {
    file: relativePath,
    source: body,
    tree: loadDocs().tree,
  });
};
