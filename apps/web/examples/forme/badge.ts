import { Component } from "@angular/core";

import { PdfBadge } from "@/registry/bases/forme/components/badge/badge";
import {
  FormeDocument,
  FormePage,
  FormeView,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfBadge, FormeView],
  template: `
    <forme-document>
      <forme-page [size]="{ height: 200, width: 595 }" [margin]="40">
        <forme-view
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
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export default class BadgeDemo {}
