import { Component } from "@angular/core";

import { PdfPageHeader } from "@/registry/bases/takumi/components/page-header/page-header";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    PdfcnThemeProvider,
    TakumiView,
    PdfPageHeader,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page [size]="{ height: 240, width: 595 }">
        <pdf-theme-provider>
          <takumi-view>
            <pdf-page-header
              title="Invoice #1042"
              subtitle="Acme Corp"
              rightText="March 2026"
              rightSubText="Due: 2026-03-31"
              variant="simple"
            />
            <pdf-text [style]="textStyle"
              >Prepared for Northwind Industries</pdf-text
            >
            <pdf-text [style]="textStyle"
              >This document demonstrates the simple page header
              variant.</pdf-text
            >
          </takumi-view>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class PageHeaderDemo {
  protected readonly textStyle = {
    color: "#555555",
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 6,
  };
}
