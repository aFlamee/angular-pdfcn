import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";
import { ArrowUpRight } from "lucide";

import { ROUTES } from "@/constants/routes";
import { docsContentRoute, formatTitleFromSlug } from "@/lib/docs";
import { absoluteUrl } from "@/lib/utils";
import {
  DocsBaseSwitcher,
  getDocsBaseSwitcherProps,
} from "@/src/app/components/docs/docs-base-switcher";
import { DocsContent } from "@/src/app/components/docs/docs-content";
import { DocsCopyPage } from "@/src/app/components/docs/docs-copy-page";
import { DocsKeyboardShortcuts } from "@/src/app/components/docs/docs-keyboard-shortcuts";
import { DocsNavLink } from "@/src/app/components/docs/docs-nav-link";
import { DocsShareMenu } from "@/src/app/components/docs/docs-share-menu";
import { DocsToc } from "@/src/app/components/docs/docs-toc";
import { DocsTocFooter } from "@/src/app/components/docs/docs-toc-footer";
import { BreadcrumbJsonLd } from "@/src/app/components/json-ld";
import type { BreadcrumbItem } from "@/src/app/components/json-ld";
import { UiBadge } from "@/src/app/components/ui/badge";
import { UiIcon } from "@/src/app/components/ui/icon";
import type { ResolvedDoc } from "@/src/app/lib/docs-source";
import { SeoService } from "@/src/app/services/seo";

/** One docs page: title bar, content, previous and next links, and the table of contents. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    BreadcrumbJsonLd,
    DocsBaseSwitcher,
    DocsContent,
    DocsCopyPage,
    DocsKeyboardShortcuts,
    DocsNavLink,
    DocsShareMenu,
    DocsToc,
    DocsTocFooter,
    UiBadge,
    UiIcon,
  ],
  selector: "docs-page",
  template: `
    @let page = doc().page;
    <app-breadcrumb-json-ld [items]="breadcrumbs()" />
    <docs-keyboard-shortcuts
      [previous]="doc().previous?.url"
      [next]="doc().next?.url"
    />
    <div
      data-slot="docs"
      class="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full"
    >
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="h-(--top-spacing) shrink-0"></div>
        <div
          class="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300"
        >
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <h1
                  class="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl"
                >
                  {{ page.title }}
                </h1>
                <div class="docs-nav flex items-center gap-2">
                  <div class="hidden sm:block">
                    <docs-copy-page
                      [markdownUrl]="markdownUrl()"
                      [url]="url()"
                    />
                  </div>
                  <div class="ml-auto flex gap-2">
                    <docs-share-menu [title]="page.title" [url]="url()" />
                    @if (doc().previous; as previous) {
                      <docs-nav-link
                        [href]="previous.url"
                        direction="back"
                        class="extend-touch-target size-8 md:size-7"
                        tooltip="Previous Page"
                      >
                        <span class="sr-only">Previous</span>
                      </docs-nav-link>
                    }
                    @if (doc().next; as next) {
                      <docs-nav-link
                        [href]="next.url"
                        direction="forward"
                        class="extend-touch-target size-8 md:size-7"
                        tooltip="Next Page"
                      >
                        <span class="sr-only">Next</span>
                      </docs-nav-link>
                    }
                  </div>
                </div>
              </div>
              @if (page.description) {
                <p
                  class="text-muted-foreground text-[1.05rem] text-balance sm:text-base"
                >
                  {{ page.description }}
                </p>
              }
            </div>
            @if (page.links; as links) {
              <div class="flex items-center space-x-2 pt-4">
                @if (links.doc) {
                  <a
                    uiBadge
                    variant="secondary"
                    [href]="links.doc"
                    target="_blank"
                    rel="noreferrer"
                    >Docs <svg [uiIcon]="ArrowUpRight"></svg
                  ></a>
                }
                @if (links.api) {
                  <a
                    uiBadge
                    variant="secondary"
                    [href]="links.api"
                    target="_blank"
                    rel="noreferrer"
                    >API Reference <svg [uiIcon]="ArrowUpRight"></svg
                  ></a>
                }
              </div>
            }
          </div>
          <div
            class="w-full flex-1 *:data-[slot=alert]:first:mt-0 *:data-[slot=pdf-preview]:first:mt-0"
          >
            @if (baseSwitcher(); as switcher) {
              <docs-base-switcher
                class="mb-4"
                [base]="switcher.base"
                [section]="switcher.section"
                [slug]="switcher.slug"
              />
            }
            <docs-content [nodes]="page.nodes" />
          </div>
        </div>
        <div
          class="mx-auto hidden h-16 w-full max-w-2xl items-center gap-2 px-4 sm:flex md:px-0"
        >
          @if (doc().previous; as previous) {
            <docs-nav-link [href]="previous.url" direction="back" size="sm">{{
              previous.title
            }}</docs-nav-link>
          }
          @if (doc().next; as next) {
            <docs-nav-link
              [href]="next.url"
              direction="forward"
              size="sm"
              class="ml-auto"
              >{{ next.title }}</docs-nav-link
            >
          }
        </div>
      </div>
      <div
        class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--footer-height)+2rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex"
      >
        <div class="h-(--top-spacing) shrink-0"></div>
        @if (page.toc.length) {
          <div class="no-scrollbar overflow-y-auto mx-8 border-b">
            <docs-toc [toc]="page.toc" />
          </div>
        }
        <docs-toc-footer class="mx-8" [docId]="doc().meta.path" />
      </div>
    </div>
  `,
})
export class DocsPage {
  readonly doc = input.required<ResolvedDoc>();

  protected readonly ArrowUpRight = ArrowUpRight;
  protected readonly url = computed(() => absoluteUrl(this.doc().meta.url));
  protected readonly markdownUrl = computed(
    () =>
      `${docsContentRoute}${this.doc()
        .meta.slugs.map((slug) => `/${slug}`)
        .join("")}/content.md`
  );
  protected readonly baseSwitcher = computed(() =>
    getDocsBaseSwitcherProps(this.doc().meta.slugs)
  );

  protected readonly breadcrumbs = computed(() => {
    const { slugs, title, url } = this.doc().meta;
    const items: BreadcrumbItem[] = [{ name: "Home", path: ROUTES.HOME }];
    if (slugs.length > 0) {
      items.push({ name: "Docs", path: ROUTES.DOCS });
      let path: string = ROUTES.DOCS;
      for (const slug of slugs.slice(0, -1)) {
        path += `/${slug}`;
        items.push({ name: formatTitleFromSlug(slug), path });
      }
    }
    items.push({ name: title, path: url });
    return items;
  });

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const { meta, page } = this.doc();
      seo.setPage({
        description: page.description,
        ogType: "article",
        path: meta.url,
        title: page.title,
      });
    });
  }
}
