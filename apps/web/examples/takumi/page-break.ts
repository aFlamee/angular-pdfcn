import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfPageBreak } from "@/registry/bases/takumi/components/page-break/page-break";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    TakumiView,
    PdfcnThemeProvider,
    PdfHeading,
    PdfPageBreak,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <takumi-view>
            <pdf-heading [level]="1">Section 1</pdf-heading>
            <pdf-text>Content on the first page.</pdf-text>
            <pdf-page-break />
            <pdf-heading [level]="1">Section 2</pdf-heading>
            <pdf-text>Content on the second page.</pdf-text>
          </takumi-view>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class PageBreakDemo {}
