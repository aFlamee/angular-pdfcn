import type { RouteMeta } from "@analogjs/router";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";

import { DocsPage } from "@/src/app/components/docs/docs-page";
import { resolveDoc } from "@/src/app/lib/docs-source";
import type { ResolvedDoc } from "@/src/app/lib/docs-source";

export const routeMeta: RouteMeta = {
  resolve: { doc: resolveDoc },
  runGuardsAndResolvers: "pathParamsChange",
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [DocsPage],
  template: `<docs-page [doc]="doc()" />`,
})
export default class DocsSlugPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly doc = toSignal(
    this.route.data.pipe(map((data) => data["doc"] as ResolvedDoc)),
    {
      initialValue: this.route.snapshot.data["doc"] as ResolvedDoc,
    }
  );
}
