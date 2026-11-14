import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfKeepTogether } from "@/registry/bases/forme/components/keep-together/keep-together";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [
    FormeDocument,
    FormePage,
    PdfHeading,
    PdfKeepTogether,
    PdfSection,
    PdfText,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-section spacing="none">
          <pdf-keep-together>
            <pdf-heading [level]="2">Section Title</pdf-heading>
            <pdf-section variant="callout" padding="sm">
              <pdf-text noMargin
                >This heading and callout stay together as one atomic block when
                the document flows onto another page.</pdf-text
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
      </forme-page>
    </forme-document>
  `,
})
export default class KeepTogetherDemo {}
