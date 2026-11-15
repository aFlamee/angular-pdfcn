import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ArrowLeft, ArrowRight } from "lucide";

import { cn } from "@/lib/utils";
import { UiButton } from "@/src/app/components/ui/button";
import type { ButtonVariants } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiTooltip } from "@/src/app/components/ui/tooltip";

/** A previous or next page link. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [RouterLink, UiButton, UiIcon, UiTooltip],
  selector: "docs-nav-link",
  template: `
    <a
      uiButton
      variant="secondary"
      sound="click"
      [size]="size()"
      [class]="classes()"
      [routerLink]="href()"
      [uiTooltip]="tooltip() ?? ''"
    >
      @if (direction() === "back") {
        <svg [uiIcon]="ArrowLeft"></svg>
      }
      <ng-content />
      @if (direction() === "forward") {
        <svg [uiIcon]="ArrowRight"></svg>
      }
    </a>
  `,
})
export class DocsNavLink {
  readonly href = input.required<string>();
  readonly direction = input.required<"back" | "forward">();
  readonly size = input<ButtonVariants["size"]>("icon");
  readonly tooltip = input<string>();
  readonly class = input("");

  protected readonly ArrowLeft = ArrowLeft;
  protected readonly ArrowRight = ArrowRight;
  protected readonly classes = computed(() => cn("shadow-none", this.class()));
}
