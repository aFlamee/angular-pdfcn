import { Component } from "@angular/core";

import { PdfGraph } from "@/registry/bases/takumi/components/graph/graph";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfGraph],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-graph
            variant="bar"
            title="Monthly Revenue"
            subtitle="FY 2025"
            [data]="data"
            showValues
            [width]="480"
            [height]="260"
          />
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class GraphDemo {
  protected readonly data = [
    { label: "Jan", value: 42_000 },
    { label: "Feb", value: 38_000 },
    { label: "Mar", value: 55_000 },
    { label: "Apr", value: 61_000 },
    { label: "May", value: 49_000 },
    { label: "Jun", value: 72_000 },
  ];
}
