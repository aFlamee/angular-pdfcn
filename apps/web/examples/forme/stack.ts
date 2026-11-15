import { Component } from "@angular/core";

import { PdfDivider } from "@/registry/bases/forme/components/divider/divider";
import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfStack } from "@/registry/bases/forme/components/stack/stack";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [
    FormeDocument,
    FormePage,
    PdfDivider,
    PdfHeading,
    PdfStack,
    PdfText,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="30">
        <pdf-stack gap="md">
          <pdf-heading [level]="2">Section</pdf-heading>
          <pdf-text>First paragraph in the stack.</pdf-text>
          <pdf-text>Second paragraph with consistent spacing.</pdf-text>
          <pdf-divider spacing="lg" />
          <pdf-stack gap="lg">
            <pdf-heading [level]="3">Wider gap</pdf-heading>
            <pdf-text>Content grouped with a larger vertical rhythm.</pdf-text>
          </pdf-stack>
        </pdf-stack>
      </forme-page>
    </forme-document>
  `,
})
export default class StackDemo {}
