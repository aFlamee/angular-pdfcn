import { Component } from "@angular/core";

import { PdfKeyValue } from "@/registry/bases/takumi/components/key-value/key-value";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfKeyValue],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-key-value direction="horizontal" divided [items]="items" />
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class KeyValueDemo {
  protected readonly items = [
    { key: "Invoice #", value: "INV-2026-0042" },
    { key: "Issue Date", value: "15 February 2026" },
    { key: "Due Date", value: "17 March 2026" },
    { key: "Status", value: "Unpaid", valueColor: "destructive" },
    { key: "Total", value: "$4,200.00", valueColor: "primary" },
  ];
}
