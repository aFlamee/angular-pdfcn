import { Component } from "@angular/core";

import { PdfCard } from "@/registry/bases/takumi/components/card/card";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfCard, PdfText],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-card title="Project Summary" variant="default" padding="md">
            <pdf-text noMargin
              >This card groups related content with a title and body area. Use
              cards to visually separate sections of your PDF
              document.</pdf-text
            >
          </pdf-card>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class CardDemo {}
