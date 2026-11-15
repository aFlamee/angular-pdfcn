import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

import { cn } from "@/lib/utils";
import { Announcement } from "@/src/app/components/home/announcement";

/** A page title with a gradient and a description, which the caller projects. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [Announcement],
  selector: "app-page-hero",
  template: `
    <header class="relative flex flex-col items-center gap-4 text-center">
      @if (showAnnouncement()) {
        <div class="absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2">
          <app-announcement />
        </div>
      }
      <h1 [class]="titleClasses()">{{ title() }}</h1>
      <p [class]="descriptionClasses()"><ng-content /></p>
    </header>
  `,
})
export class PageHero {
  readonly title = input.required<string>();
  readonly titleClass = input("");
  readonly descriptionClass = input("");
  readonly showAnnouncement = input(false, { transform: booleanAttribute });

  protected readonly titleClasses = computed(() =>
    cn(
      "from-foreground via-foreground to-foreground/65 bg-linear-to-b bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl",
      this.titleClass()
    )
  );
  protected readonly descriptionClasses = computed(() =>
    cn(
      "text-muted-foreground max-w-lg text-base leading-relaxed text-balance",
      this.descriptionClass()
    )
  );
}
