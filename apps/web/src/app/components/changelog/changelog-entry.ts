import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import type { DocPage } from "@/lib/content/types";
import { DocsContent } from "@/src/app/components/docs/docs-content";

/** One changelog entry with its full content. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [DocsContent],
  selector: "app-changelog-entry",
  template: `
    <article class="mb-12 border-b pb-12">
      <h2 class="font-heading text-xl font-semibold tracking-tight">
        {{ page().title }}
      </h2>
      <div class="prose-changelog mt-6 *:first:mt-0">
        <docs-content [nodes]="page().nodes" />
      </div>
    </article>
  `,
})
export class ChangelogEntry {
  readonly page = input.required<DocPage>();
}
