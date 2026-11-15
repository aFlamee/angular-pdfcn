import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { RedirectCommand, Router } from "@angular/router";
import { loaders, pages, tree } from "virtual:docs";

import { ROUTES } from "@/constants/routes";
import type { DocPage, DocsPageMeta, DocsTreeNode } from "@/lib/content/types";

export { pages, tree } from "virtual:docs";

export interface ResolvedDoc {
  meta: DocsPageMeta;
  page: DocPage;
  previous?: DocsPageMeta;
  next?: DocsPageMeta;
}

/** The url of a docs route, without a trailing slash, query, or hash. */
const docsUrl = (route: ActivatedRouteSnapshot) => {
  const segments = route.pathFromRoot.flatMap((snapshot) =>
    snapshot.url.map((segment) => segment.path)
  );
  return `/${segments.join("/")}`.replace(/\/$/, "") || ROUTES.HOME;
};

const flatten = (nodes: DocsTreeNode[]): string[] =>
  nodes.flatMap((node) =>
    node.type === "page" ? [node.url] : flatten(node.children)
  );

// Neighbours follow the sidebar, like fumadocs' findNeighbour. Pages outside it have none.
const sidebarUrls = flatten(tree.children);
const metaOf = (url: string | undefined) =>
  pages.find((page) => page.url === url);

/** Loads the page for the current docs url, with its neighbours in sidebar order. */
export const resolveDoc: ResolveFn<ResolvedDoc> = async (route) => {
  const url = docsUrl(route);
  const index = pages.findIndex((page) => page.url === url);
  if (index === -1) {
    return new RedirectCommand(inject(Router).parseUrl("/404.html"), {
      skipLocationChange: true,
    }) as never;
  }
  const position = sidebarUrls.indexOf(url);
  return {
    meta: pages[index],
    next: position === -1 ? undefined : metaOf(sidebarUrls[position + 1]),
    page: await loaders[url](),
    previous: position === -1 ? undefined : metaOf(sidebarUrls[position - 1]),
  };
};
