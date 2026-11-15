import { Component } from "@angular/core";

import { OperationsReportDocument } from "@/registry/bases/takumi/blocks/report-operations/report-operations";

@Component({
  imports: [OperationsReportDocument],
  template: `<pdf-operations-report />`,
})
export default class OperationsReportDemo {}
