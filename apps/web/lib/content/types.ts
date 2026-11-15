import type { IconNode } from "lucide";

import type { BaseName } from "@/examples/__index__";
import type { BrandIconName } from "@/lib/brand-icons";

export type { BaseName };

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

export interface TocItem {
  depth: number;
  title: string;
  url: string;
}

export interface DocsTreePage {
  type: "page";
  name: string;
  url: string;
  description?: string;
}

export interface DocsTreeFolder {
  type: "folder";
  $id: string;
  name: string;
  children: DocsTreeNode[];
}

export type DocsTreeNode = DocsTreeFolder | DocsTreePage;

export interface DocsTree {
  name: string;
  children: DocsTreeNode[];
}

/** Compiled docs content: text, plain elements, and the interactive blocks. */
export type DocNode =
  | string
  | {
      type: "el";
      tag: string;
      class?: string;
      attrs?: Record<string, string>;
      children: DocNode[];
    }
  | {
      type: "code";
      code: string;
      /** Highlighted `<pre>` markup. */
      html: string;
      lang: string;
      title?: string;
      collapsible?: boolean;
    }
  | { type: "command"; commands: Record<PackageManager, string> }
  | {
      type: "tabs";
      /** Tabs with an id share their selection across pages, like the reference's CodeTabs. */
      id?: string;
      items: { value: string; label: string; children: DocNode[] }[];
    }
  | { type: "icon"; class?: string; lucide?: IconNode; brand?: BrandIconName }
  | { type: "preview"; base: BaseName; name: string; theme?: string }
  | { type: "theme-preview"; base: BaseName }
  | { type: "theme-preview-grid" };

export type DocElement = Extract<DocNode, { type: "el" }>;

export interface DocPage {
  title: string;
  description?: string;
  links?: { doc?: string; api?: string };
  toc: TocItem[];
  nodes: DocNode[];
}

export interface DocsPageMeta {
  url: string;
  /** Path below `content/docs`, such as `components/forme/table.md`. */
  path: string;
  slugs: string[];
  title: string;
  description?: string;
}
