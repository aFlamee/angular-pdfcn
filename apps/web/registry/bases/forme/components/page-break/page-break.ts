import { Component, input } from "@angular/core";

import { FormePageBreak } from "@/registry/bases/forme/lib/pdf-primitives";
import type { PDFComponentProps } from "@/registry/types/pdf-components";

export interface PageBreakProps extends Omit<PDFComponentProps, "children"> {
  children?: never;
}

@Component({
  imports: [FormePageBreak],
  selector: "pdf-page-break",
  template: "<forme-page-break />",
})
export class PdfPageBreak {
  readonly style = input<PageBreakProps["style"]>();
}
