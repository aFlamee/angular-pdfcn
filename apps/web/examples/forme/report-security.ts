import { Component } from "@angular/core";

import { SecurityReportDocument } from "@/registry/bases/forme/blocks/report-security/report-security";

@Component({
  imports: [SecurityReportDocument],
  template: `<pdf-report-security />`,
})
export default class SecurityReportDemo {}
