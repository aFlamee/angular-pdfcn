import { Component } from "@angular/core";

import { PdfDataTable } from "@/registry/bases/forme/components/data-table/data-table";
import type { DataTableColumn } from "@/registry/bases/forme/components/data-table/data-table.types";
import { PdfHeading } from "@/registry/bases/forme/components/heading/heading";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

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
  imports: [FormeDocument, FormePage, PdfDataTable, PdfHeading, PdfSection],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-section spacing="none">
          <pdf-heading [level]="3">Team Directory</pdf-heading>
          <pdf-data-table
            size="compact"
            variant="striped"
            [columns]="columns"
            [data]="data"
          />
        </pdf-section>
      </forme-page>
    </forme-document>
  `,
})
export default class DataTableDemo {
  protected readonly columns = columns;
  protected readonly data = data;
}
