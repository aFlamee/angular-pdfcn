import { Component } from "@angular/core";

import { InvoiceCorporateDocument } from "@/registry/bases/forme/blocks/invoice-corporate/invoice-corporate";

@Component({
  imports: [InvoiceCorporateDocument],
  template: `<pdf-invoice-corporate />`,
})
export default class InvoiceCorporateDemo {}
