import { Component } from "@angular/core";

import { PdfSignatureBlock } from "@/registry/bases/forme/components/signature/signature";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfSignatureBlock],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-signature-block
          variant="single"
          label="Authorized By"
          name="John Doe"
          title="CEO, Acme Corp"
          date="15 February 2026"
        />
      </forme-page>
    </forme-document>
  `,
})
export default class SignatureDemo {}
