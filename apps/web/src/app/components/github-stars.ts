import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";

import { LINK } from "@/constants/links";
import { UTM_SOURCE } from "@/constants/nav";
import { addQueryParams } from "@/lib/url";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { buttonVariants } from "@/src/app/components/ui/button";
import { UiTooltip } from "@/src/app/components/ui/tooltip";
import { FeedbackService } from "@/src/app/services/feedback";

const compact = new Intl.NumberFormat("en-US", {
  compactDisplay: "short",
  notation: "compact",
});
const full = new Intl.NumberFormat("en-US");

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [BrandIcon, UiTooltip],
  selector: "app-github-stars",
  template: `
    <a
      [class]="classes"
      [href]="href"
      rel="noopener"
      target="_blank"
      [uiTooltip]="tooltip()"
      (click)="feedback.play('success')"
    >
      <svg brandIcon="github" class="-translate-y-px"></svg>
      <span class="text-muted-foreground text-xs tabular-nums">{{
        count()
      }}</span>
    </a>
  `,
})
export class GitHubStars {
  readonly stargazersCount = input.required<number>();

  protected readonly classes = buttonVariants({ size: "sm", variant: "ghost" });
  protected readonly href = addQueryParams(LINK.GITHUB, UTM_SOURCE);
  protected readonly feedback = inject(FeedbackService);
  protected readonly count = computed(() =>
    compact.format(this.stargazersCount()).toLowerCase()
  );
  protected readonly tooltip = computed(
    () => `${full.format(this.stargazersCount())} stars`
  );
}
