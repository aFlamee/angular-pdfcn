import { Component } from "@angular/core";

import { FinancialReportDocument } from "@/registry/bases/forme/blocks/report-financial/report-financial";

@Component({
  imports: [FinancialReportDocument],
  template: `<pdf-report-financial />`,
})
export default class ReportFinancialDemo {}
