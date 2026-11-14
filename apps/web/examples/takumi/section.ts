import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
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
    PdfHeading,
    PdfSection,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
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
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class SectionDemo {}
