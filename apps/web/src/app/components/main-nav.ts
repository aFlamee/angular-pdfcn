import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

import { injectPathname } from "@/src/app/components/app-routes";
import { UiButton } from "@/src/app/components/ui/button";

export interface NavItem {
  href: string;
  label: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "items-center gap-0.5" },
  imports: [RouterLink, UiButton],
  selector: "nav[appMainNav]",
  template: `
    @for (item of items(); track item.href) {
      <a
        uiButton
        variant="ghost"
        size="sm"
        sound="click"
        [routerLink]="item.href"
        [class]="pathname() === item.href ? 'text-primary' : ''"
        >{{ item.label }}</a
      >
    }
  `,
})
export class MainNav {
  readonly items = input.required<NavItem[]>();

  protected readonly pathname = injectPathname();
}
