import { Component } from "@angular/core";

import { PdfDivider } from "@/registry/bases/takumi/components/divider/divider";
import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    PdfcnThemeProvider,
    PdfDivider,
    PdfHeading,
    PdfText,
    TakumiView,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <takumi-view>
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
          </takumi-view>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class DividerDemo {}
