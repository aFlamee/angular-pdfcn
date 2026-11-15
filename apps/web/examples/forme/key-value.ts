import { Component } from "@angular/core";

import { PdfKeyValue } from "@/registry/bases/forme/components/key-value/key-value";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfKeyValue],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-key-value direction="horizontal" divided [items]="items" />
      </forme-page>
    </forme-document>
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
