import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfPageNumber } from "@/registry/bases/forme/components/page-number/page-number";
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
    PdfPageNumber,
    PdfText,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <forme-view [style]="{ minHeight: 680, position: 'relative' }">
          <forme-view [style]="{ marginBottom: 60 }">
            <pdf-heading [level]="1">Multi-Page Report</pdf-heading>
            <pdf-text
              >Page numbers make long reports easier to review, reference, and
              print.</pdf-text
            >
            <pdf-text
              >The format token displays the current page together with the
              total page count.</pdf-text
            >
          </forme-view>
          <forme-view
            [style]="{ bottom: 0, left: 0, position: 'absolute', right: 0 }"
          >
            <pdf-page-number format="Page 1 of 1" align="center" />
          </forme-view>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export default class PageNumberDemo {}
