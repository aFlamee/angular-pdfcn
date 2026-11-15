import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfHeading, PdfSection],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="30">
        <pdf-section spacing="none">
          <pdf-heading [level]="1">Main Title</pdf-heading>
          <pdf-heading [level]="2" align="center" color="primary"
            >Subtitle</pdf-heading
          >
          <pdf-heading [level]="3" [style]="{ color: '#1e3a5f' }"
            >Custom Styled</pdf-heading
          >
        </pdf-section>
      </forme-page>
    </forme-document>
  `,
})
export default class HeadingDemo {}
