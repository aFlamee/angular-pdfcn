import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfPageBreak } from "@/registry/bases/forme/components/page-break/page-break";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
  FormeView,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    PdfHeading,
    PdfPageBreak,
    PdfText,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="30">
        <forme-view>
          <pdf-heading [level]="1">Section 1</pdf-heading>
          <pdf-text>Content on the first page.</pdf-text>
          <pdf-page-break />
          <pdf-heading [level]="1">Section 2</pdf-heading>
          <pdf-text>Content on the second page.</pdf-text>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export default class PageBreakDemo {}
