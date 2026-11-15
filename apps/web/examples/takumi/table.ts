import { Component } from "@angular/core";

import { TABLE } from "@/registry/bases/takumi/components/table/table";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, TABLE],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-table variant="line" [zebraStripe]="false">
            <pdf-table-header>
              <pdf-table-row header>
                <pdf-table-cell>Item</pdf-table-cell>
                <pdf-table-cell align="center">Qty</pdf-table-cell>
                <pdf-table-cell align="right">Price</pdf-table-cell>
                <pdf-table-cell align="right">Total</pdf-table-cell>
              </pdf-table-row>
            </pdf-table-header>
            <pdf-table-body>
              <pdf-table-row>
                <pdf-table-cell>Design</pdf-table-cell>
                <pdf-table-cell align="center">1</pdf-table-cell>
                <pdf-table-cell align="right">$150.00</pdf-table-cell>
                <pdf-table-cell align="right">$150.00</pdf-table-cell>
              </pdf-table-row>
              <pdf-table-row>
                <pdf-table-cell>Development</pdf-table-cell>
                <pdf-table-cell align="center">1</pdf-table-cell>
                <pdf-table-cell align="right">$2,500.00</pdf-table-cell>
                <pdf-table-cell align="right">$2,500.00</pdf-table-cell>
              </pdf-table-row>
              <pdf-table-row>
                <pdf-table-cell>Testing</pdf-table-cell>
                <pdf-table-cell align="center">1</pdf-table-cell>
                <pdf-table-cell align="right">$800.00</pdf-table-cell>
                <pdf-table-cell align="right">$800.00</pdf-table-cell>
              </pdf-table-row>
            </pdf-table-body>
            <pdf-table-footer>
              <pdf-table-row footer>
                <pdf-table-cell>Total</pdf-table-cell>
                <pdf-table-cell>{{ " " }}</pdf-table-cell>
                <pdf-table-cell>{{ " " }}</pdf-table-cell>
                <pdf-table-cell align="right">$3,450.00</pdf-table-cell>
              </pdf-table-row>
            </pdf-table-footer>
          </pdf-table>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class TableDemo {}
