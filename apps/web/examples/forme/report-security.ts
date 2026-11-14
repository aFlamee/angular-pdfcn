import { Component } from "@angular/core";

import { SecurityReportDocument } from "@/registry/bases/forme/blocks/report-security/report-security";

@Component({
  imports: [SecurityReportDocument],
  template: `<pdf-security-report />`,
})
export default class SecurityReportDemo {}
