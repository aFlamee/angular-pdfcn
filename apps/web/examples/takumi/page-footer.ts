import { Component } from "@angular/core";

import { PdfPageFooter } from "@/registry/bases/takumi/components/page-footer/page-footer";
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
    PdfPageFooter,
    PdfText,
  ],
  template: `
    <takumi-document>
      <takumi-page [size]="{ height: 300, width: 595 }">
        <pdf-theme-provider>
          <takumi-view
            [style]="{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 220,
            }"
          >
            <pdf-text [style]="textStyle"
              >Invoice #1042 · Acme Corp · March 2026</pdf-text
            >
            <pdf-text [style]="textStyle"
              >The footer remains visually separated from the document
              body.</pdf-text
            >
            <takumi-view [style]="{ flex: 1 }" />
            <pdf-page-footer
              leftText="© 2026 Acme Corp"
              centerText="Confidential"
              rightText="Page 1 of 1"
              variant="simple"
            />
          </takumi-view>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class PageFooterDemo {
  protected readonly textStyle = {
    color: "#555555",
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 6,
  };
}
