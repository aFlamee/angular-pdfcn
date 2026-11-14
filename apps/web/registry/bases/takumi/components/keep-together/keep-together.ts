import { Component, computed, input } from "@angular/core";

import { TakumiView } from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/types/pdf-components";

export interface KeepTogetherProps {
  minPresenceAhead?: number;
  style?: Style;
}

@Component({
  imports: [TakumiView],
  selector: "pdf-keep-together",
  template: `<takumi-view [style]="keepTogetherStyle()"
    ><ng-content
  /></takumi-view>`,
})
export class PdfKeepTogether {
  readonly minPresenceAhead = input<number>();
  readonly style = input<KeepTogetherProps["style"]>();

  protected readonly keepTogetherStyle = computed(
    () => [{ breakInside: "avoid" }, this.style()].filter(Boolean) as never
  );
}
