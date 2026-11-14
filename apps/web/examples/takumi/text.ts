import { Component } from "@angular/core";

import { PdfSection } from "@/registry/bases/takumi/components/section/section";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    PdfcnThemeProvider,
    PdfSection,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-section spacing="none">
            <pdf-text
              >Default body text for paragraphs, descriptions, and document
              content.</pdf-text
            >
            <pdf-text variant="xs" color="mutedForeground"
              >Caption text for metadata and supporting details.</pdf-text
            >
            <pdf-text variant="lg"
              >Lead paragraph with a larger typographic scale.</pdf-text
            >
          </pdf-section>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class TextDemo {}
