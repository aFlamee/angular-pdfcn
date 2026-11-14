import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfKeepTogether } from "@/registry/bases/takumi/components/keep-together/keep-together";
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
    PdfKeepTogether,
    PdfSection,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-section spacing="none">
            <pdf-keep-together>
              <pdf-heading [level]="2">Section Title</pdf-heading>
              <pdf-section variant="callout" padding="sm">
                <pdf-text noMargin
                  >This heading and callout stay together as one atomic block
                  when the document flows onto another page.</pdf-text
                >
              </pdf-section>
            </pdf-keep-together>
            <pdf-keep-together [minPresenceAhead]="80">
              <pdf-heading [level]="3">Subsection Heading</pdf-heading>
              <pdf-text
                >Reserve enough room before starting this subsection so its
                heading is never stranded at the bottom of a page.</pdf-text
              >
            </pdf-keep-together>
            <pdf-keep-together>
              <pdf-heading [level]="4">Signature Block</pdf-heading>
              <pdf-section variant="card" padding="sm">
                <pdf-text noMargin>Approved by: ____________________</pdf-text>
              </pdf-section>
            </pdf-keep-together>
          </pdf-section>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class KeepTogetherDemo {}
