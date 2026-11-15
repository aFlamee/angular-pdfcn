import { Component } from "@angular/core";

import { PdfDivider } from "@/registry/bases/forme/components/divider/divider";
import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
  FormeView,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [
    FormeDocument,
    FormePage,
    PdfDivider,
    PdfHeading,
    PdfText,
    FormeView,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="30">
        <forme-view>
          <pdf-heading [level]="2">Section 1</pdf-heading>
          <pdf-text>Content here.</pdf-text>
          <pdf-divider />
          <pdf-heading [level]="2">Section 2</pdf-heading>
          <pdf-text>More content.</pdf-text>
          <pdf-divider variant="dashed" />
          <pdf-heading [level]="2">Section 3</pdf-heading>
          <pdf-text>More content.</pdf-text>
          <pdf-divider variant="dotted" />
          <pdf-heading [level]="2">Section 4</pdf-heading>
          <pdf-text>More content.</pdf-text>
          <pdf-divider label="Section Divider" />
          <pdf-heading [level]="2">Section 5</pdf-heading>
          <pdf-text>More content.</pdf-text>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export default class DividerDemo {}
