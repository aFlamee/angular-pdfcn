import { Component } from "@angular/core";

import { InvoiceCreativeDocument } from "@/registry/bases/takumi/blocks/invoice-creative/invoice-creative";

@Component({
  imports: [InvoiceCreativeDocument],
  template: `<pdf-invoice-creative />`,
})
export default class InvoiceCreativeDemo {}
