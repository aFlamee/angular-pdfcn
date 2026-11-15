import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";

import { NotFound } from "@/src/app/components/not-found/not-found";
import { SeoService } from "@/src/app/services/seo";

/** Every unknown url, outside the site chrome. The build writes it as `/404.html`. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [NotFound],
  template: `<main appNotFound></main>`,
})
export default class NotFoundPage {
  constructor() {
    inject(SeoService).setPage({
      noIndex: true,
      path: inject(Router).url,
      title: "Page Not Found",
    });
  }
}
