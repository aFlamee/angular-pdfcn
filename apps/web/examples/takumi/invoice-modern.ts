import { Component } from "@angular/core";

import { InvoiceModernDocument } from "@/registry/bases/takumi/blocks/invoice-modern/invoice-modern";

@Component({
  imports: [InvoiceModernDocument],
  template: `<pdf-invoice-modern />`,
})
export default class InvoiceModernDemo {}
