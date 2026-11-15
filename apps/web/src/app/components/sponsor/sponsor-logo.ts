import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import type { Sponsor } from "@/lib/sponsors";

const LOGO_CLASS =
  "h-8 w-auto opacity-60 transition-opacity group-hover:opacity-100";

/** A sponsor's light and dark logos, its single logo, or its name. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  selector: "app-sponsor-logo",
  template: `
    @let s = sponsor();
    @if (s.logoLight || s.logoDark) {
      <img
        [src]="s.logoLight ?? s.logoDark"
        [alt]="s.name"
        [class]="LOGO_CLASS + ' dark:hidden'"
      />
      <img
        [src]="s.logoDark ?? s.logoLight"
        [alt]="s.name"
        [class]="'hidden ' + LOGO_CLASS + ' dark:block'"
      />
    } @else if (s.logo) {
      <img [src]="s.logo" [alt]="s.name" [class]="LOGO_CLASS" />
    } @else {
      <span class="text-sm font-medium text-foreground">{{ s.name }}</span>
    }
  `,
})
export class SponsorLogo {
  readonly sponsor = input.required<Sponsor>();
  protected readonly LOGO_CLASS = LOGO_CLASS;
}
