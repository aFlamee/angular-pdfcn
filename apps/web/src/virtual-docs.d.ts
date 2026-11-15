declare module "virtual:docs" {
  import type { DocPage, DocsPageMeta, DocsTree } from "@/lib/content/types";

  export const tree: DocsTree;
  export const pages: DocsPageMeta[];
  export const loaders: Record<string, () => Promise<DocPage>>;
}
