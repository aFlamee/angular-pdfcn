import { Component } from "@angular/core";

import { PdfSection } from "@/registry/bases/forme/components/section/section";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfSection, PdfText],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="30">
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
      </forme-page>
    </forme-document>
  `,
})
export default class TextDemo {}
