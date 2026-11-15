import { Component } from "@angular/core";

import { PdfLink } from "@/registry/bases/takumi/components/link/link";
import { PdfSection } from "@/registry/bases/takumi/components/section/section";
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
    PdfLink,
    PdfSection,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-section spacing="none">
            <pdf-link href="https://pdfcn.dev">Documentation</pdf-link>
            <pdf-link href="#section-1" color="primary">Internal link</pdf-link>
          </pdf-section>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class LinkDemo {}
