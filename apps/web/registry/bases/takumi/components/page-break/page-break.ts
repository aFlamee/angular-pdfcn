import { Component, computed, input } from "@angular/core";

import { TakumiView } from "@/registry/bases/takumi/lib/pdf-primitives";
import type { PDFComponentProps } from "@/registry/types/pdf-components";

export interface PageBreakProps extends Omit<PDFComponentProps, "children"> {
  children?: never;
}

@Component({
  imports: [TakumiView],
  selector: "pdf-page-break",
  template: `<takumi-view [style]="pageBreakStyle()" />`,
})
export class PdfPageBreak {
  readonly style = input<PageBreakProps["style"]>();

  protected readonly pageBreakStyle = computed(
    () => [{ breakBefore: "page" }, this.style()].filter(Boolean) as never
  );
}
