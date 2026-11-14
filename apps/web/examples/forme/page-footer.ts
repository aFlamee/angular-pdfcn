import { Component } from "@angular/core";

import { PdfPageFooter } from "@/registry/bases/forme/components/page-footer/page-footer";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  FormeDocument,
  FormePage,
  FormeView,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, FormeView, PdfPageFooter, PdfText],
  template: `
    <forme-document>
      <forme-page [size]="{ height: 300, width: 595 }" [margin]="30">
        <forme-view
          [style]="{ display: 'flex', flexDirection: 'column', minHeight: 220 }"
        >
          <pdf-text [style]="textStyle"
            >Invoice #1042 · Acme Corp · March 2026</pdf-text
          >
          <pdf-text [style]="textStyle"
            >The footer remains visually separated from the document
            body.</pdf-text
          >
          <forme-view [style]="{ flex: 1 }" />
          <pdf-page-footer
            leftText="© 2026 Acme Corp"
            centerText="Confidential"
            rightText="Page 1 of 1"
            variant="simple"
          />
        </forme-view>
      </forme-page>
    </forme-document>
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
