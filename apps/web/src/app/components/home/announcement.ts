import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ArrowRight } from "lucide";

import { ROUTES } from "@/constants/routes";
import { UiBadge } from "@/src/app/components/ui/badge";
import { UiIcon } from "@/src/app/components/ui/icon";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [RouterLink, UiBadge, UiIcon],
  selector: "app-announcement",
  template: `
    <a
      uiBadge
      variant="secondary"
      class="rounded-full"
      [routerLink]="ROUTES.THEME_BUILDER"
    >
      New Theme builder <svg [uiIcon]="ArrowRight"></svg>
    </a>
  `,
})
export class Announcement {
  protected readonly ArrowRight = ArrowRight;
  protected readonly ROUTES = ROUTES;
}
