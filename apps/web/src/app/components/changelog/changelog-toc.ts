import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

import type { DocsPageMeta } from "@/lib/content/types";

/** The changelog's "On This Page" list: the latest entries and a link to the older ones. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [RouterLink],
  selector: "app-changelog-toc",
  template: `
    <div class="flex flex-col gap-2 p-4 pt-0 text-sm">
      <p
        class="sticky top-0 h-6 bg-background text-xs font-medium text-muted-foreground"
      >
        On This Page
      </p>
      @for (page of latest(); track page.url) {
        <a
          class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground"
          [routerLink]="page.url"
        >
          {{ page.title }}
        </a>
      }
      @if (hasOlder()) {
        <a
          class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground"
          [routerLink]="[]"
          fragment="more-updates"
        >
          More Updates
        </a>
      }
    </div>
  `,
})
export class ChangelogToc {
  readonly latest = input.required<DocsPageMeta[]>();
  readonly hasOlder = input.required<boolean>();
}
