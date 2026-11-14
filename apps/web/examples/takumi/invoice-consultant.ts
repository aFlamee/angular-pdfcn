import { Component } from "@angular/core";

import { InvoiceConsultantDocument } from "@/registry/bases/takumi/blocks/invoice-consultant/invoice-consultant";

@Component({
  imports: [InvoiceConsultantDocument],
  template: `<pdf-invoice-consultant />`,
})
export default class InvoiceConsultantDemo {}
