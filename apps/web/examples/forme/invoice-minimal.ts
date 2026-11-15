import { Component } from "@angular/core";

import { InvoiceMinimalDocument } from "@/registry/bases/forme/blocks/invoice-minimal/invoice-minimal";

@Component({
  imports: [InvoiceMinimalDocument],
  template: `<pdf-invoice-minimal />`,
})
export default class InvoiceMinimalDemo {}
