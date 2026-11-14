import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import { PdfWatermark } from "@/registry/bases/forme/components/watermark/watermark";
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
    PdfText,
    PdfWatermark,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <forme-view [style]="{ minHeight: 680, position: 'relative' }">
          <pdf-watermark text="DRAFT" />
          <pdf-heading [level]="1">Draft Document</pdf-heading>
          <pdf-text
            >This report is under review and should not be distributed
            externally.</pdf-text
          >
          <pdf-text
            >The watermark sits behind the content while remaining clearly
            visible.</pdf-text
          >
          <pdf-text
            >Use watermarks for draft, confidential, sample, or approval
            states.</pdf-text
          >
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export default class WatermarkDemo {}
