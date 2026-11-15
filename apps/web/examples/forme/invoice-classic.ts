import { Component } from "@angular/core";

import { InvoiceClassicDocument } from "@/registry/bases/forme/blocks/invoice-classic/invoice-classic";

@Component({
  imports: [InvoiceClassicDocument],
  template: `<pdf-invoice-classic />`,
})
export default class InvoiceClassicDemo {}
