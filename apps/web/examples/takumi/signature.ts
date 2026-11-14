import { Component } from "@angular/core";

import { PdfSignatureBlock } from "@/registry/bases/takumi/components/signature/signature";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfSignatureBlock],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-signature-block
            variant="single"
            label="Authorized By"
            name="John Doe"
            title="CEO, Acme Corp"
            date="15 February 2026"
          />
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class SignatureDemo {}
