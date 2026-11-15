import { Component } from "@angular/core";

import { OperationsReportDocument } from "@/registry/bases/takumi/blocks/report-operations/report-operations";

@Component({
  imports: [OperationsReportDocument],
  template: `<pdf-report-operations />`,
})
export default class OperationsReportDemo {}
