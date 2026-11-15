---
title: "Data Table"
description: "Tabular data with columns and rows."
---

::preview{base="forme" name="data-table"}

## Installation

::installation{base="forme" name="data-table"}

## Usage

::example{base="forme" name="data-table"}

### Variants

Use any `TableVariant` for the table treatment and `size="compact"` for denser reports.

```angular-html
<pdf-data-table
  [columns]="columns"
  [data]="rows"
  variant="striped"
  size="compact"
/>
```

## API Reference

### PdfDataTable

| Input     | Type                                                                                        | Default     |
| --------- | ------------------------------------------------------------------------------------------- | ----------- |
| `columns` | `DataTableColumn<T>[]`                                                                      | -           |
| `data`    | `T[]`                                                                                       | -           |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | `'grid'`    |
| `footer`  | `Partial<Record<keyof T, string \| number>>`                                                | -           |
| `stripe`  | `boolean`                                                                                   | `false`     |
| `size`    | `'default' \| 'compact'`                                                                    | `'default'` |
| `noWrap`  | `boolean`                                                                                   | `false`     |
| `style`   | `Style`                                                                                     | -           |

### DataTableColumn

`key` is the row-field accessor. For example, `key: "name"` reads `row.name`.

`render` and `renderFooter` take a `TemplateRef`. A cell template gets the value as `$implicit` and the row as `row`. A footer template gets the footer value as `$implicit`.

```angular-ts
@Component({
  selector: "app-totals",
  imports: [PdfDataTable],
  template: `
    <ng-template #amount let-value let-row="row"
      >{{ row.currency }} {{ value }}</ng-template
    >
    <pdf-data-table [columns]="columns()" [data]="rows" />
  `,
})
export class Totals {
  protected readonly rows: Row[] = [
    { amount: 120, currency: "USD", item: "Design" },
  ];
  private readonly amount =
    viewChild<TemplateRef<DataTableCellContext<Row>>>("amount");
  protected readonly columns = computed((): DataTableColumn<Row>[] => [
    { header: "Item", key: "item" },
    { align: "right", header: "Amount", key: "amount", render: this.amount() },
  ]);
}
```

| Field          | Type                                   | Default  |
| -------------- | -------------------------------------- | -------- |
| `key`          | `keyof T & string`                     | -        |
| `header`       | `string`                               | -        |
| `align`        | `'left' \| 'center' \| 'right'`        | `'left'` |
| `width`        | `string \| number`                     | -        |
| `render`       | `TemplateRef<DataTableCellContext<T>>` | -        |
| `renderFooter` | `TemplateRef<DataTableFooterContext>`  | -        |
