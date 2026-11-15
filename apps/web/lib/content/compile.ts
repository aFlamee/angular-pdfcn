// Compiles a docs `.md` file into the node tree that `DocsContent` renders.
import path from "node:path";

import type { Element as HastElement, Nodes as HastNodes } from "hast";
import { icons as lucideIcons } from "lucide";
import type { IconNode } from "lucide";
import type { Nodes as MdastNodes, RootContent } from "mdast";
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import { toHast } from "mdast-util-to-hast";
import { toString } from "mdast-util-to-string";
import { createHighlighter } from "shiki";

import { BRAND_ICONS } from "../brand-icons";
import type { BrandIconName } from "../brand-icons";
import { addCommand } from "../install";
import { packageManagerCommands } from "./commands";
import {
  componentsJsonCode,
  directiveAttributes,
  parseMarkdown,
  tsconfigPathsCode,
} from "./directives";
import { exampleSource, fileSource, installPlan } from "./registry";
import { sectionPages, splitFrontmatter } from "./source";
import type { BaseName, DocNode, DocPage, DocsTree, TocItem } from "./types";

const highlighter = await createHighlighter({
  langs: [
    "angular-ts",
    "angular-html",
    "bash",
    "css",
    "json",
    "md",
    "ts",
    "yaml",
  ],
  themes: ["github-dark", "github-light-default"],
});

// The classes the reference gave each markdown element (its `mdx-components.tsx`).
const ELEMENT_CLASSES: Record<string, string> = {
  a: "font-medium underline underline-offset-4",
  blockquote: "mt-6 border-l-2 pl-6 italic",
  code: "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none",
  h1: "font-heading mt-2 scroll-m-28 text-3xl font-bold tracking-tight",
  h2: "[&+]*:[code]:text-xl mt-10 scroll-m-28 font-heading text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+.steps]:mt-0! [&+.steps>h3]:mt-4! [&+h3]:mt-6! [&+p]:mt-4!",
  h3: "mt-12 scroll-m-28 font-heading text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl",
  h4: "font-heading mt-8 scroll-m-28 text-base font-medium tracking-tight",
  h5: "mt-8 scroll-m-28 text-base font-medium tracking-tight",
  h6: "mt-8 scroll-m-28 text-base font-medium tracking-tight",
  hr: "my-4 md:my-8",
  img: "rounded-md",
  li: "mt-2",
  ol: "my-6 ml-6 list-decimal",
  p: "leading-relaxed [&:not(:first-child)]:mt-6",
  strong: "font-medium",
  table:
    "relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0",
  td: "px-4 py-2 text-left whitespace-nowrap [[align=center]]:text-center [[align=right]]:text-right",
  th: "px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right",
  tr: "m-0 border-b",
  ul: "my-6 ml-6 list-disc",
};

const STEP_CLASS =
  "mt-8 scroll-m-32 font-heading text-lg font-medium tracking-tight";
const STEPS_CLASS =
  "steps [counter-reset:step] md:ml-4 md:border-l md:pl-8 [&>h3]:step";
const KEPT_ATTRIBUTES = ["id", "href", "src", "alt", "title", "align", "start"];

const highlight = (code: string, lang: string, lineNumbers: boolean) =>
  highlighter.codeToHtml(code, {
    defaultColor: false,
    lang: highlighter.getLoadedLanguages().includes(lang) ? lang : "text",
    themes: { dark: "github-dark", light: "github-light-default" },
    transformers: [
      {
        code(node) {
          node.properties["data-language"] = lang;
          if (lineNumbers) {
            node.properties["data-line-numbers"] = "";
          }
        },
        line(node) {
          node.properties["data-line"] = "";
          delete node.properties.class;
        },
        pre(node) {
          node.properties = {
            class:
              "no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0 !bg-transparent",
            "data-language": lang,
          };
        },
      },
    ],
  });

const codeNode = (
  code: string,
  lang: string,
  options: { title?: string; collapsible?: boolean } = {}
): DocNode => {
  const commands = packageManagerCommands(code);
  if (commands) {
    return { commands, type: "command" };
  }
  return {
    code,
    html: highlight(code, lang, Boolean(options.collapsible)),
    lang,
    type: "code",
    ...options,
  };
};

/** A lucide icon by kebab or Pascal name, or a brand icon such as `takumi`. */
const iconNode = (
  name: string,
  className: string | undefined,
  file: string
): DocNode => {
  if (name in BRAND_ICONS) {
    return { brand: name as BrandIconName, class: className, type: "icon" };
  }
  const pascal = name.replaceAll(/(^|-)(\w)/g, (_, _dash, letter: string) =>
    letter.toUpperCase()
  );
  const lucide = (lucideIcons as Record<string, IconNode>)[pascal];
  if (!lucide) {
    throw new Error(`${file}: unknown icon "${name}"`);
  }
  return { class: className, lucide, type: "icon" };
};

const el = (
  tag: string,
  className: string | undefined,
  children: DocNode[],
  attrs?: Record<string, string>
): DocNode => ({ attrs, children, class: className, tag, type: "el" });

export const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}\s_-]/gu, "")
    .replaceAll(/\s/g, "-");

interface CompileContext {
  file: string;
  tree: DocsTree;
  toc: TocItem[];
  slugs: Map<string, number>;
  inSteps: boolean;
}

const uniqueSlug = (context: CompileContext, text: string) => {
  const slug = slugify(text);
  const count = context.slugs.get(slug) ?? 0;
  context.slugs.set(slug, count + 1);
  return count ? `${slug}-${count}` : slug;
};

const fromHast = (node: HastNodes): DocNode[] => {
  if (node.type === "text") {
    return [node.value];
  }
  if (node.type === "root") {
    return node.children.flatMap(fromHast);
  }
  if (node.type !== "element") {
    return [];
  }
  if (node.tagName === "x-icon") {
    return [
      iconNode(
        String(node.properties.name),
        node.properties.className as string | undefined,
        ""
      ),
    ];
  }
  const attrs: Record<string, string> = {};
  for (const name of KEPT_ATTRIBUTES) {
    const value = node.properties[name];
    if (value !== undefined && value !== null) {
      attrs[name] = String(value);
    }
  }
  const children = node.children.flatMap(fromHast);
  const own = ELEMENT_CLASSES[node.tagName];
  if (node.tagName === "table") {
    return [
      el("div", "my-6 no-scrollbar w-full overflow-y-auto rounded-xl border", [
        el("table", own, children),
      ]),
    ];
  }
  // A checkbox in a GFM task list is the only input markdown makes.
  if (node.tagName === "input") {
    return [node.properties.checked ? "☑ " : "☐ "];
  }
  return [
    el(
      node.tagName,
      own,
      children,
      Object.keys(attrs).length ? attrs : undefined
    ),
  ];
};

const required = (
  attributes: Record<string, string>,
  name: string,
  context: CompileContext
) => {
  const value = attributes[name];
  if (!value) {
    throw new Error(`${context.file}: directive is missing "${name}"`);
  }
  return value;
};

const textDirectiveHandler = (
  _state: unknown,
  node: TextDirective
): HastElement => {
  if (node.name !== "icon") {
    return {
      children: [{ type: "text", value: `:${node.name}${toString(node)}` }],
      properties: {},
      tagName: "span",
      type: "element",
    };
  }
  const attributes = directiveAttributes(node);
  return {
    children: [],
    properties: { className: attributes.class, name: attributes.name },
    tagName: "x-icon",
    type: "element",
  };
};

const markdownToNodes = (node: MdastNodes): DocNode[] =>
  fromHast(
    toHast(node, {
      handlers: { textDirective: textDirectiveHandler as never },
    })
  );

/** The reference's `ComponentsList`: links to every page of a section, optionally for one base. */
const componentsList = (
  tree: DocsTree,
  folderName: string,
  base: string
): DocNode[] => {
  const pages = sectionPages(tree, folderName, base);
  return [
    el(
      "div",
      "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20",
      pages.map((page) =>
        el(
          "a",
          "inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base",
          [page.name],
          { href: page.url }
        )
      )
    ),
  ];
};

const registryItemNodes = (
  itemName: string,
  context: CompileContext
): DocNode[] => {
  const { files, packages } = installPlan(itemName, context.file);
  const step = (text: string) => el("h3", STEP_CLASS, [text]);
  const manual: DocNode[] = [];
  if (packages.length > 0) {
    manual.push(
      step("Install the following dependencies:"),
      codeNode(`npm install ${packages.join(" ")}`, "bash")
    );
  }
  manual.push(step("Copy and paste the following code into your project."));
  for (const file of files) {
    manual.push(
      codeNode(file.code, "angular-ts", {
        collapsible: true,
        title: file.target,
      })
    );
  }
  manual.push(step("Update the import paths to match your project setup."));

  return [
    {
      id: "installation",
      items: [
        {
          children: [codeNode(addCommand(itemName), "bash")],
          label: "Command",
          value: "cli",
        },
        {
          children: [el("div", STEPS_CLASS, manual)],
          label: "Manual",
          value: "manual",
        },
      ],
      type: "tabs",
    },
  ];
};

const exampleNodes = (base: string, name: string): DocNode[] => {
  const code = exampleSource(base, name);
  if (code === undefined) {
    return [
      el("p", "leading-relaxed text-muted-foreground mt-6", [
        `The ${base}/${name} example is not ported yet.`,
      ]),
    ];
  }
  return [codeNode(code, "angular-ts", { collapsible: true })];
};

const sourceNodes = (
  src: string,
  title: string | undefined,
  context: CompileContext
): DocNode[] => [
  codeNode(
    fileSource(src, context.file),
    path.extname(src) === ".ts" ? "angular-ts" : path.extname(src).slice(1),
    { collapsible: true, title }
  ),
];

type Directive = ContainerDirective | LeafDirective;

type DirectiveHandler = (
  node: Directive,
  attributes: Record<string, string>,
  context: CompileContext
) => DocNode[];

const compileChildren = (node: Directive, context: CompileContext) =>
  // oxlint-disable-next-line no-use-before-define -- mutual recursion
  compileNodes(node.children as RootContent[], context);

const DIRECTIVES: Record<string, DirectiveHandler> = {
  "add-command": (_node, attributes, context) => [
    codeNode(
      addCommand(...required(attributes, "names", context).split(/\s+/)),
      "bash"
    ),
  ],
  callout: (node, attributes, context) => [
    el(
      "div",
      "bg-surface text-surface-foreground relative mt-6 grid w-auto grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border border-none px-4 py-3 text-sm md:-mx-1 has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3",
      [
        ...(attributes.title
          ? [
              el(
                "div",
                "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
                [attributes.title]
              ),
            ]
          : []),
        el(
          "div",
          "text-card-foreground/80 col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
          compileChildren(node, context)
        ),
      ],
      { "data-slot": "alert" }
    ),
  ],
  "components-json": () => [
    codeNode(componentsJsonCode(), "json", { title: "components.json" }),
  ],
  "components-list": (_node, attributes, context) =>
    componentsList(
      context.tree,
      attributes.folder ?? "Components",
      attributes.base ?? "takumi"
    ),
  example: (_node, attributes, context) =>
    exampleNodes(
      required(attributes, "base", context),
      required(attributes, "name", context)
    ),
  "feature-card": (_node, attributes, context) => [
    el(
      "div",
      "bg-card text-card-foreground flex flex-col gap-2 rounded-xl border py-4 shadow-none",
      [
        el("div", "flex items-center gap-2 px-4", [
          el(
            "div",
            "bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-md text-primary",
            [
              iconNode(
                required(attributes, "icon", context),
                "size-4",
                context.file
              ),
            ]
          ),
          el("div", "leading-none text-base font-medium", [
            required(attributes, "title", context),
          ]),
        ]),
        el("div", "px-4 text-sm text-muted-foreground", [
          required(attributes, "description", context),
        ]),
      ]
    ),
  ],
  grid: (node, attributes, context) => [
    el(
      "div",
      attributes.class ?? "not-prose grid gap-4 sm:grid-cols-2 mt-4",
      compileChildren(node, context)
    ),
  ],
  icon: (_node, attributes, context) => [
    iconNode(
      required(attributes, "name", context),
      attributes.class,
      context.file
    ),
  ],
  installation: (_node, attributes, context) => {
    const name = required(attributes, "name", context);
    return registryItemNodes(
      attributes.base ? `${attributes.base}/${name}` : name,
      context
    );
  },
  "linked-card": (node, attributes, context) => [
    el(
      "a",
      "bg-surface text-surface-foreground hover:bg-surface/80 flex w-full flex-col items-center rounded-xl p-6 transition-colors sm:p-10",
      compileChildren(node, context),
      { href: required(attributes, "href", context) }
    ),
  ],
  preview: (_node, attributes, context) => [
    {
      base: required(attributes, "base", context) as BaseName,
      name: required(attributes, "name", context),
      theme: attributes.theme,
      type: "preview",
    },
  ],
  source: (_node, attributes, context) =>
    sourceNodes(
      required(attributes, "src", context),
      attributes.title,
      context
    ),
  steps: (node, _attributes, context) => {
    const previous = context.inSteps;
    context.inSteps = true;
    const steps = compileChildren(node, context);
    context.inSteps = previous;
    return [el("div", STEPS_CLASS, steps)];
  },
  tabs: (node, attributes, context) => [
    {
      id: attributes.id,
      items: node.children.flatMap((child) => {
        if (child.type !== "containerDirective" || child.name !== "tab") {
          return [];
        }
        const { label, value } = directiveAttributes(child);
        return [
          {
            children: compileChildren(child, context),
            label: label ?? value ?? "",
            value: value ?? slugify(label ?? ""),
          },
        ];
      }),
      type: "tabs",
    },
  ],
  "theme-preview": (_node, attributes) => [
    { base: (attributes.base ?? "takumi") as BaseName, type: "theme-preview" },
  ],
  "theme-preview-grid": () => [{ type: "theme-preview-grid" }],
  "tsconfig-paths": () => [
    codeNode(tsconfigPathsCode(), "json", { title: "tsconfig.json" }),
  ],
};

const directiveNodes = (node: Directive, context: CompileContext) => {
  if (!Object.hasOwn(DIRECTIVES, node.name)) {
    throw new Error(`${context.file}: unknown directive "${node.name}"`);
  }
  return DIRECTIVES[node.name](node, directiveAttributes(node), context);
};

const compileNodes = (
  nodes: RootContent[],
  context: CompileContext
): DocNode[] =>
  nodes.flatMap((node): DocNode[] => {
    if (node.type === "containerDirective" || node.type === "leafDirective") {
      return directiveNodes(node, context);
    }
    if (node.type === "code") {
      return [
        codeNode(node.value, node.lang ?? "text", {
          title: node.meta?.match(/title="([^"]+)"/)?.[1],
        }),
      ];
    }
    if (node.type === "html") {
      throw new Error(
        `${context.file}: raw HTML is not supported, use a directive`
      );
    }
    if (node.type === "heading" && context.inSteps && node.depth === 3) {
      return [
        el(
          "h3",
          STEP_CLASS,
          markdownToNodes({
            children: node.children,
            type: "paragraph",
          }).flatMap((child) =>
            typeof child === "object" &&
            child.type === "el" &&
            child.tag === "p"
              ? child.children
              : [child]
          )
        ),
      ];
    }
    const compiled = markdownToNodes(node);
    if (node.type === "heading" && node.depth >= 2) {
      const title = toString(node);
      const id = uniqueSlug(context, title);
      const [heading] = compiled;
      if (typeof heading === "object" && heading.type === "el") {
        heading.attrs = { ...heading.attrs, id };
      }
      if (node.depth <= 3) {
        context.toc.push({ depth: node.depth, title, url: `#${id}` });
      }
    }
    return compiled;
  });

export const compileDoc = (
  file: string,
  source: string,
  tree: DocsTree
): DocPage => {
  const { body, data } = splitFrontmatter(source);
  const root = parseMarkdown(body);
  const context: CompileContext = {
    file,
    inSteps: false,
    slugs: new Map(),
    toc: [],
    tree,
  };
  const nodes = compileNodes(root.children, context);
  return {
    description: data.description,
    links: data.links,
    nodes,
    title: data.title,
    toc: context.toc,
  };
};
