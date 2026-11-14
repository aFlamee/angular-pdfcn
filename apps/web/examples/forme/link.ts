import { Component } from "@angular/core";

import { PdfLink } from "@/registry/bases/forme/components/link/link";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfLink, PdfSection],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="30">
        <pdf-section spacing="none">
          <pdf-link href="https://pdfcn.dev">Documentation</pdf-link>
          <pdf-link href="#section-1" color="primary">Internal link</pdf-link>
        </pdf-section>
      </forme-page>
    </forme-document>
  `,
})
export default class LinkDemo {}
