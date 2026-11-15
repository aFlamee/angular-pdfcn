import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfPageNumber } from "@/registry/bases/takumi/components/page-number/page-number";
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
    PdfPageNumber,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <takumi-view [style]="{ minHeight: 680, position: 'relative' }">
            <takumi-view [style]="{ marginBottom: 60 }">
              <pdf-heading [level]="1">Multi-Page Report</pdf-heading>
              <pdf-text
                >Page numbers make long reports easier to review, reference, and
                print.</pdf-text
              >
              <pdf-text
                >The format token displays the current page together with the
                total page count.</pdf-text
              >
            </takumi-view>
            <takumi-view
              [style]="{ bottom: 0, left: 0, position: 'absolute', right: 0 }"
            >
              <pdf-page-number format="Page 1 of 1" align="center" />
            </takumi-view>
          </takumi-view>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class PageNumberDemo {}
