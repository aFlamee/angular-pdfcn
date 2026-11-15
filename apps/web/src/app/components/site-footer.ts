import { ChangeDetectionStrategy, Component } from "@angular/core";

import { LINK, ORIGINAL } from "@/constants/links";

/** The footer, with the credit to the original pdfcn. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block group-has-[.section-soft]/body:bg-surface/40 3xl:fixed:bg-transparent group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 dark:bg-transparent",
    style: "view-transition-name: site-footer",
  },
  selector: "app-site-footer",
  template: `
    <footer class="container-wrapper px-4 xl:px-6">
      <div class="flex h-(--footer-height) items-center justify-between">
        <div
          class="text-muted-foreground w-full px-1 text-center text-xs leading-loose sm:text-sm"
        >
          A community Angular port of
          <a
            [href]="ORIGINAL.GITHUB"
            target="_blank"
            rel="noreferrer"
            class="font-medium underline underline-offset-4"
            >pdfcn</a
          >
          by
          <a
            [href]="ORIGINAL.AUTHOR_URL"
            target="_blank"
            rel="noreferrer"
            class="font-medium underline underline-offset-4"
            >{{ ORIGINAL.AUTHOR }}</a
          >
          and its
          <a
            [href]="ORIGINAL.CONTRIBUTORS"
            target="_blank"
            rel="noreferrer"
            class="font-medium underline underline-offset-4"
            >contributors</a
          >. The source code is available on
          <a
            [href]="LINK.GITHUB"
            target="_blank"
            rel="noreferrer"
            class="font-medium underline underline-offset-4"
            >GitHub</a
          >.
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly LINK = LINK;
  protected readonly ORIGINAL = ORIGINAL;
}
