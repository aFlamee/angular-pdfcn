import { Component } from "@angular/core";

import { PdfDataTable } from "@/registry/bases/takumi/components/data-table/data-table";
import type { DataTableColumn } from "@/registry/bases/takumi/components/data-table/data-table.types";
import { PdfHeading } from "@/registry/bases/takumi/components/heading/heading";
import { PdfSection } from "@/registry/bases/takumi/components/section/section";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

const data = [
  { dept: "Engineering", id: 1, name: "Alice Johnson", status: "Active" },
  { dept: "Marketing", id: 2, name: "Bob Smith", status: "Active" },
  { dept: "Design", id: 3, name: "Carol Lee", status: "Inactive" },
  { dept: "Engineering", id: 4, name: "Dan Wilson", status: "Active" },
  { dept: "Sales", id: 5, name: "Eve Brown", status: "Active" },
  { dept: "Support", id: 6, name: "Frank Chen", status: "Active" },
  { dept: "Product", id: 7, name: "Grace Kim", status: "Active" },
  { dept: "Marketing", id: 8, name: "Hank Davis", status: "Inactive" },
];

const columns: DataTableColumn<(typeof data)[number]>[] = [
  { align: "center", header: "ID", key: "id" },
  { header: "Name", key: "name" },
  { header: "Department", key: "dept" },
  { align: "center", header: "Status", key: "status" },
];

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    PdfcnThemeProvider,
    PdfDataTable,
    PdfHeading,
    PdfSection,
  ],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-section spacing="none">
            <pdf-heading [level]="3">Team Directory</pdf-heading>
            <pdf-data-table
              size="compact"
              variant="striped"
              [columns]="columns"
              [data]="data"
            />
          </pdf-section>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class DataTableDemo {
  protected readonly columns = columns;
  protected readonly data = data;
}
