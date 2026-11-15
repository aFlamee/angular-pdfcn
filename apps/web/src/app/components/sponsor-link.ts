import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HeartHandshake } from "lucide";

import { ROUTES } from "@/constants/routes";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [RouterLink, UiButton, UiIcon],
  selector: "app-sponsor-link",
  template: `
    <a
      uiButton
      size="sm"
      variant="ghost"
      sound="click"
      class="max-sm:size-8"
      [routerLink]="ROUTES.SPONSOR"
    >
      <svg [uiIcon]="HeartHandshake" class="text-pink-500"></svg>
      <span class="max-sm:sr-only">Sponsor</span>
    </a>
  `,
})
export class SponsorLink {
  protected readonly ROUTES = ROUTES;
  protected readonly HeartHandshake = HeartHandshake;
}
