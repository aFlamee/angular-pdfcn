import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ArrowRight, Component as ComponentIcon } from "lucide";

import { ROUTES } from "@/constants/routes";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex flex-wrap items-center justify-center gap-4" },
  imports: [RouterLink, UiButton, UiIcon],
  selector: "app-home-ctas",
  template: `
    <a
      uiButton
      sound="click"
      class="px-4"
      [routerLink]="ROUTES.DOCS_INSTALLATION"
    >
      Get Started
      <svg [uiIcon]="ArrowRight" class="hidden sm:inline"></svg>
    </a>
    <a
      uiButton
      variant="outline"
      sound="click"
      class="px-4"
      [routerLink]="ROUTES.DOCS_COMPONENTS"
    >
      <svg [uiIcon]="ComponentIcon" class="hidden sm:inline"></svg>
      Browse Components
    </a>
  `,
})
export class HomeCtas {
  protected readonly ArrowRight = ArrowRight;
  protected readonly ComponentIcon = ComponentIcon;
  protected readonly ROUTES = ROUTES;
}
