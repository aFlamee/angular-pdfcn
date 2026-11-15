import type { RouteMeta } from "@analogjs/router";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RedirectCommand, Router } from "@angular/router";
import { map } from "rxjs";

import { ROUTES } from "@/constants/routes";
import { BASE_NAMES } from "@/lib/bases";
import type { BaseName } from "@/lib/content/types";
import { ThemeBuilder } from "@/src/app/components/theme-builder/theme-builder";
import { SeoService } from "@/src/app/services/seo";

const BASE_COPY: Record<BaseName, string> = {
  forme:
    "Design and export a reusable pdfcn theme with a live PDF preview powered by Forme.",
  takumi:
    "Design and export a reusable pdfcn theme with a live PDF preview powered by Takumi.",
};

// An unknown base shows the 404 like the reference's `notFound()`.
export const routeMeta: RouteMeta = {
  canActivate: [
    (route) =>
      BASE_NAMES.includes(route.params["base"]) ||
      new RedirectCommand(inject(Router).parseUrl("/404.html"), {
        skipLocationChange: true,
      }),
  ],
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [ThemeBuilder],
  template: `<app-theme-builder [base]="base()" />`,
})
export default class ThemeBuilderBasePage {
  private readonly route = inject(ActivatedRoute);
  protected readonly base = toSignal(
    this.route.paramMap.pipe(map((params) => params.get("base") as BaseName)),
    { initialValue: this.route.snapshot.paramMap.get("base") as BaseName }
  );

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const base = this.base();
      seo.setPage({
        description: BASE_COPY[base],
        path: `${ROUTES.THEME_BUILDER}/${base}`,
        title: "Theme Builder",
      });
    });
  }
}
