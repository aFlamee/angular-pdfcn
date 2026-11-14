import { Component } from "@angular/core";

import { InvoiceCreativeDocument } from "@/registry/bases/forme/blocks/invoice-creative/invoice-creative";

@Component({
  imports: [InvoiceCreativeDocument],
  template: `<pdf-invoice-creative />`,
})
export default class InvoiceCreativeDemo {}
