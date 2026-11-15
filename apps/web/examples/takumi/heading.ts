import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
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
    PdfHeading,
    PdfSection,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-section spacing="none">
            <pdf-heading [level]="1">Main Title</pdf-heading>
            <pdf-heading [level]="2" align="center" color="primary"
              >Subtitle</pdf-heading
            >
            <pdf-heading [level]="3" [style]="{ color: '#1e3a5f' }"
              >Custom Styled</pdf-heading
            >
          </pdf-section>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class HeadingDemo {}
