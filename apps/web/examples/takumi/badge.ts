import { Component } from "@angular/core";

import { PdfBadge } from "@/registry/bases/takumi/components/badge/badge";
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
    PdfBadge,
    TakumiView,
  ],
  template: `
    <takumi-document>
      <takumi-page [size]="{ height: 200, width: 595 }">
        <pdf-theme-provider>
          <takumi-view
            [style]="{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 12,
            }"
          >
            <pdf-badge label="Small" variant="default" size="sm" />
            <pdf-badge label="Medium" variant="default" size="md" />
            <pdf-badge label="Large" variant="default" size="lg" />
          </takumi-view>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class BadgeDemo {}
