import { Component } from "@angular/core";

import { PdfAlert } from "@/registry/bases/takumi/components/alert/alert";
import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfSection } from "@/registry/bases/takumi/components/section/section";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    PdfcnThemeProvider,
    PdfAlert,
    PdfHeading,
    PdfSection,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
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
                >Missing required fields. Please complete all
                sections.</pdf-alert
              >
            </pdf-section>
          </pdf-section>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class AlertDemo {}
