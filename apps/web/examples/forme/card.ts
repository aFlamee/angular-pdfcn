import { Component } from "@angular/core";

import { PdfCard } from "@/registry/bases/forme/components/card/card";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfCard, PdfText],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-card title="Project Summary" variant="default" padding="md">
          <pdf-text noMargin
            >This card groups related content with a title and body area. Use
            cards to visually separate sections of your PDF document.</pdf-text
          >
        </pdf-card>
      </forme-page>
    </forme-document>
  `,
})
export default class CardDemo {}
