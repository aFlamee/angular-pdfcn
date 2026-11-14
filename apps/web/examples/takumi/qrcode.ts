import { Component } from "@angular/core";

import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfQRCode } from "@/registry/bases/takumi/components/qrcode/qrcode";
import { PdfSection } from "@/registry/bases/takumi/components/section/section";
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
    PdfHeading,
    PdfQRCode,
    PdfSection,
    PdfStack,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
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
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class QRCodeDemo {}
