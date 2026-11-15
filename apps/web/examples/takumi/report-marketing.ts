import { Component } from "@angular/core";

import { MarketingReportDocument } from "@/registry/bases/takumi/blocks/report-marketing/report-marketing";

@Component({
  imports: [MarketingReportDocument],
  template: `<pdf-report-marketing />`,
})
export default class ReportMarketingDemo {}
