import { Component } from "@angular/core";

import { InvoiceCorporateDocument } from "@/registry/bases/takumi/blocks/invoice-corporate/invoice-corporate";

@Component({
  imports: [InvoiceCorporateDocument],
  template: `<pdf-invoice-corporate />`,
})
export default class InvoiceCorporateDemo {}
