import { Component } from "@angular/core";

import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
  FormeView,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, FormeView, PdfPageHeader, PdfText],
  template: `
    <forme-document>
      <forme-page [size]="{ height: 240, width: 595 }" [margin]="30">
        <forme-view>
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
        </forme-view>
      </forme-page>
    </forme-document>
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
