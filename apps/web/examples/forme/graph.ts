import { Component } from "@angular/core";

import { PdfGraph } from "@/registry/bases/forme/components/graph/graph";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfGraph],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-graph
          variant="bar"
          title="Monthly Revenue"
          subtitle="FY 2025"
          [data]="data"
          showValues
          [width]="480"
          [height]="260"
        />
      </forme-page>
    </forme-document>
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
