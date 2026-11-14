import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfQRCode } from "@/registry/bases/forme/components/qrcode/qrcode";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
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
    PdfHeading,
    PdfQRCode,
    PdfSection,
    PdfStack,
    PdfText,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-section spacing="none">
          <pdf-heading [level]="1">Invoice #12345</pdf-heading>
          <pdf-text>Amount Due: $500.00</pdf-text>
          <pdf-section>
            <pdf-stack direction="horizontal" gap="lg" align="start">
              <pdf-qrcode
                value="https://pdfcn.dev/pay/invoice-12345"
                [size]="100"
                caption="Scan to pay"
              />
              <pdf-qrcode
                value="https://pdfcn.dev/verify/invoice-12345"
                [size]="80"
                caption="Verify document"
              />
            </pdf-stack>
          </pdf-section>
          <pdf-text variant="sm" color="mutedForeground"
            >QR codes are rendered as crisp vector graphics in the generated
            PDF.</pdf-text
          >
        </pdf-section>
      </forme-page>
    </forme-document>
  `,
})
export default class QRCodeDemo {}
