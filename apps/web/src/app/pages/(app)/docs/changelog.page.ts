import type { RouteMeta } from "@analogjs/router";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import type { ResolveFn } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Rss } from "lucide";
import { loaders, pages } from "virtual:docs";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { getChangelogPages } from "@/lib/changelog";
import type { DocPage, DocsPageMeta } from "@/lib/content/types";
import { ChangelogEntry } from "@/src/app/components/changelog/changelog-entry";
import { ChangelogMoreUpdates } from "@/src/app/components/changelog/changelog-more-updates";
import { ChangelogToc } from "@/src/app/components/changelog/changelog-toc";
import { DocsTocFooter } from "@/src/app/components/docs/docs-toc-footer";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { SeoService } from "@/src/app/services/seo";

const NUMBER_OF_LATEST_PAGES = 5;

const DESCRIPTION = `Latest updates and announcements for ${SITE.NAME}.`;

interface ResolvedChangelog {
  latest: { meta: DocsPageMeta; page: DocPage }[];
  older: DocsPageMeta[];
}

/** Loads the latest entries' content. Older entries only link to their pages. */
const resolveChangelog: ResolveFn<ResolvedChangelog> = async () => {
  const entries = getChangelogPages(pages);
  return {
    latest: await Promise.all(
      entries.slice(0, NUMBER_OF_LATEST_PAGES).map(async (meta) => ({
        meta,
        page: await loaders[meta.url](),
      }))
    ),
    older: entries.slice(NUMBER_OF_LATEST_PAGES),
  };
};

export const routeMeta: RouteMeta = {
  resolve: { changelog: resolveChangelog },
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    ChangelogEntry,
    ChangelogMoreUpdates,
    ChangelogToc,
    DocsTocFooter,
    UiButton,
    UiIcon,
  ],
  template: `
    <div
      class="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full"
      data-slot="docs"
    >
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="h-(--top-spacing) shrink-0"></div>
        <div
          class="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <h1
                class="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl"
              >
                Changelog
              </h1>
              <a
                uiButton
                size="sm"
                variant="secondary"
                [href]="ROUTES.RSS"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg [uiIcon]="Rss"></svg>
                RSS
              </a>
            </div>
            <p
              class="text-muted-foreground text-[1.05rem] text-balance sm:text-base"
            >
              {{ DESCRIPTION }}
            </p>
          </div>
          <div class="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            @for (entry of changelog.latest; track entry.meta.url) {
              <app-changelog-entry [page]="entry.page" />
            }
            @if (changelog.older.length) {
              <app-changelog-more-updates [pages]="changelog.older" />
            }
          </div>
        </div>
      </div>
      <div
        class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--footer-height)+2rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex"
      >
        <div class="h-(--top-spacing) shrink-0"></div>
        <div class="no-scrollbar mx-8 overflow-y-auto border-b">
          <app-changelog-toc
            [latest]="latestMeta"
            [hasOlder]="changelog.older.length > 0"
          />
        </div>
        <docs-toc-footer class="mx-8" docId="" />
      </div>
    </div>
  `,
})
export default class ChangelogPage {
  protected readonly changelog = inject(ActivatedRoute).snapshot.data[
    "changelog"
  ] as ResolvedChangelog;
  protected readonly latestMeta = this.changelog.latest.map(
    (entry) => entry.meta
  );

  protected readonly DESCRIPTION = DESCRIPTION;
  protected readonly ROUTES = ROUTES;
  protected readonly Rss = Rss;

  constructor() {
    inject(SeoService).setPage({
      description: DESCRIPTION,
      ogType: "article",
      path: ROUTES.DOCS_CHANGELOG,
      title: "Changelog",
    });
  }
}
