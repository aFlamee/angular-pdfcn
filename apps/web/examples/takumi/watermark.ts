import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import { PdfWatermark } from "@/registry/bases/takumi/components/watermark/watermark";
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
    PdfText,
    PdfWatermark,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <takumi-view [style]="{ minHeight: 680, position: 'relative' }">
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
          </takumi-view>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class WatermarkDemo {}
