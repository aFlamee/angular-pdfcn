import { Component } from "@angular/core";

import { MarketingReportDocument } from "@/registry/bases/forme/blocks/report-marketing/report-marketing";

@Component({
  imports: [MarketingReportDocument],
  template: `<pdf-report-marketing />`,
})
export default class ReportMarketingDemo {}
