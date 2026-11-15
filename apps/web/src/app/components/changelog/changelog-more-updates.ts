import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

import type { DocsPageMeta } from "@/lib/content/types";

/** Splits an entry title such as `August 13, 2026 - Initial Release` into date and title. */
const splitTitle = (title: string) => {
  const [date, ...titleParts] = title.split(" - ");
  return { date, title: titleParts.join(" - ") };
};

/** Links to the changelog entries older than the latest ones. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [RouterLink],
  selector: "app-changelog-more-updates",
  template: `
    <div class="mb-24 scroll-mt-24" id="more-updates">
      <h2 class="mb-6 font-heading text-xl font-semibold tracking-tight">
        More Updates
      </h2>
      <div class="grid auto-rows-fr gap-3 sm:grid-cols-2">
        @for (page of pages(); track page.url) {
          @let parts = splitTitle(page.title);
          <a
            class="flex w-full flex-col rounded-xl bg-surface px-4 py-3 text-surface-foreground transition-colors hover:bg-surface/80"
            [routerLink]="page.url"
          >
            <span class="text-xs text-muted-foreground">{{ parts.date }}</span>
            <span class="text-sm font-medium">{{ parts.title }}</span>
          </a>
        }
      </div>
    </div>
  `,
})
export class ChangelogMoreUpdates {
  readonly pages = input.required<DocsPageMeta[]>();

  protected readonly splitTitle = splitTitle;
}
