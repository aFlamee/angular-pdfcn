import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterRenderEffect,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import type { TocItem } from "@/lib/content/types";
import { FeedbackService } from "@/src/app/services/feedback";

/** The page's headings, marking the one in view. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [RouterLink],
  selector: "docs-toc",
  template: `
    @if (toc().length) {
      <div class="flex flex-col gap-2 p-4 pt-0 text-sm">
        <p class="text-muted-foreground bg-background sticky top-0 h-6 text-xs">
          On This Page
        </p>
        @for (item of toc(); track item.url) {
          <a
            class="text-muted-foreground hover:text-foreground data-[active=true]:text-foreground text-[0.8rem] data-[active=true]:font-medium no-underline transition-colors data-[depth=3]:pl-4 data-[depth=4]:pl-6"
            [routerLink]="[]"
            [fragment]="item.url.slice(1)"
            [attr.data-active]="item.url === '#' + activeId()"
            [attr.data-depth]="item.depth"
            (click)="feedback.play('tick')"
            >{{ item.title }}</a
          >
        }
      </div>
    }
  `,
})
export class DocsToc {
  readonly toc = input.required<TocItem[]>();

  protected readonly activeId = signal<string | null>(null);
  protected readonly feedback = inject(FeedbackService);

  constructor() {
    let observer: IntersectionObserver | undefined;
    afterRenderEffect(() => {
      const ids = this.toc().map((item) => item.url.replace("#", ""));
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.activeId.set(entry.target.id);
            }
          }
        },
        { rootMargin: "0% 0% -80% 0%" }
      );
      for (const id of ids) {
        const heading = id && document.querySelector(`#${CSS.escape(id)}`);
        if (heading) {
          observer.observe(heading);
        }
      }
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }
}
