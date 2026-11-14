import { Component } from "@angular/core";

import { SecurityReportDocument } from "@/registry/bases/takumi/blocks/report-security/report-security";

@Component({
  imports: [SecurityReportDocument],
  template: `<pdf-security-report />`,
})
export default class SecurityReportDemo {}
