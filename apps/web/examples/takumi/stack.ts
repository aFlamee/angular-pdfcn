import { Component } from "@angular/core";

import { PdfDivider } from "@/registry/bases/takumi/components/divider/divider";
import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfStack } from "@/registry/bases/takumi/components/stack/stack";
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
    PdfDivider,
    PdfHeading,
    PdfStack,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-stack gap="md">
            <pdf-heading [level]="2">Section</pdf-heading>
            <pdf-text>First paragraph in the stack.</pdf-text>
            <pdf-text>Second paragraph with consistent spacing.</pdf-text>
            <pdf-divider spacing="lg" />
            <pdf-stack gap="lg">
              <pdf-heading [level]="3">Wider gap</pdf-heading>
              <pdf-text
                >Content grouped with a larger vertical rhythm.</pdf-text
              >
            </pdf-stack>
          </pdf-stack>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class StackDemo {}
