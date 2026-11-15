import { Component, input } from "@angular/core";

import { FormeView } from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/types/pdf-components";

export interface KeepTogetherProps {
  minPresenceAhead?: number;
  style?: Style;
}

@Component({
  imports: [FormeView],
  selector: "pdf-keep-together",
  template: `<forme-view [wrap]="false" [style]="$any(style())"
    ><ng-content
  /></forme-view>`,
})
export class PdfKeepTogether {
  readonly minPresenceAhead = input<number>();
  readonly style = input<KeepTogetherProps["style"]>();
}
