import { Component } from "@angular/core";

import { PdfAlert } from "@/registry/bases/forme/components/alert/alert";
import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [
    FormeDocument,
    FormePage,
    PdfAlert,
    PdfHeading,
    PdfSection,
    PdfText,
  ],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-section spacing="none">
          <pdf-heading [level]="1">Document Alerts</pdf-heading>
          <pdf-text
            >The PdfAlert component displays callout boxes with different
            severity levels.</pdf-text
          >
          <pdf-section>
            <pdf-alert variant="info" title="Information"
              >This document contains important information about your
              account.</pdf-alert
            >
            <pdf-alert variant="success" title="Success"
              >Your payment has been processed successfully.</pdf-alert
            >
            <pdf-alert variant="warning" title="Warning"
              >Please review the terms and conditions before
              proceeding.</pdf-alert
            >
            <pdf-alert variant="error" title="Error"
              >Missing required fields. Please complete all sections.</pdf-alert
            >
          </pdf-section>
        </pdf-section>
      </forme-page>
    </forme-document>
  `,
})
export default class AlertDemo {}
