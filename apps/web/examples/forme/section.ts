import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfHeading, PdfSection, PdfText],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="30">
        <pdf-section spacing="none">
          <pdf-section spacing="lg">
            <pdf-heading [level]="2">Introduction</pdf-heading>
            <pdf-text
              >This section uses generous spacing for a primary document
              area.</pdf-text
            >
          </pdf-section>
          <pdf-section spacing="md">
            <pdf-heading [level]="2">Details</pdf-heading>
            <pdf-text
              >This section groups related content with medium
              spacing.</pdf-text
            >
          </pdf-section>
        </pdf-section>
      </forme-page>
    </forme-document>
  `,
})
export default class SectionDemo {}
