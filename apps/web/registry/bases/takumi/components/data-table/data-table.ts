import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  Component,
  computed,
  Directive,
  input,
  inject,
  Injector,
} from "@angular/core";

import {
  PdfTable,
  TABLE,
} from "@/registry/bases/takumi/components/table/table";
import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import { TakumiText } from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import { createCompactStyles, formatValue } from "./data-table.styles";
import type {
  DataTableColumn,
  DataTableProps,
  DataTableSize,
} from "./data-table.types";

/** Header, body, and footer cells with their text and compact styles. */
const dataTableLayout = <T extends Record<string, unknown>>(
  theme: PdfcnTheme,
  {
    columns,
    data,
    footer,
    size = "default",
  }: Pick<DataTableProps<T>, "columns" | "data" | "footer" | "size">
) => {
  const compact = createCompactStyles(theme);
  const isCompact = size === "compact";
  const alignStyle = (col: DataTableColumn<T>) =>
    col.align ? ({ textAlign: col.align } as Style) : {};

  return {
    footer:
      footer &&
      columns.map((col) => {
        const value = col.key in footer ? footer[col.key] : "";
        return {
          col,
          context: { $implicit: value },
          footer: !!value,
          text: formatValue(value),
          textStyle: isCompact
            ? [value ? compact.footerText : compact.text, alignStyle(col)]
            : undefined,
        };
      }),
    header: columns.map((col) => ({
      col,
      text: col.header,
      textStyle: isCompact ? [compact.headerText, alignStyle(col)] : undefined,
    })),
    isCompact,
    rows: data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        return {
          col,
          context: { $implicit: value, row },
          text: formatValue(value),
          textStyle: isCompact ? [compact.text, alignStyle(col)] : undefined,
        };
      })
    ),
    styles: compact,
  };
};

/**
 * Stands in for the React original's per-row `Fragment`, which hides body rows
 * from `Table`: they keep the default variant and get no zebra stripes.
 */
@Directive({
  providers: [{ provide: PdfTable, useValue: null }],
  selector: "[pdfDataTableRowFragment]",
})
class DataTableRowFragment {}

/** Data table for PDF rendering with column definitions, footer support, and stripe options. */
@Component({
  imports: [DataTableRowFragment, TakumiText, NgTemplateOutlet, TABLE],
  selector: "pdf-data-table",
  template: `
    @let l = layout();
    @let cellStyle = l.isCompact ? l.styles.cell : undefined;
    <pdf-table
      [variant]="variant()"
      [zebraStripe]="stripe()"
      [noWrap]="noWrap()"
      [style]="style()"
    >
      <pdf-table-header>
        <pdf-table-row header>
          @for (cell of l.header; track cell.col.key) {
            <pdf-table-cell
              header
              [align]="cell.col.align ?? 'left'"
              [width]="cell.col.width"
              [style]="cellStyle"
              ><ng-container
                *ngTemplateOutlet="content; context: { $implicit: cell }"
            /></pdf-table-cell>
          }
        </pdf-table-row>
      </pdf-table-header>
      <pdf-table-body>
        @for (row of l.rows; track $index) {
          <pdf-table-row pdfDataTableRowFragment>
            @for (cell of row; track cell.col.key) {
              <pdf-table-cell
                [align]="cell.col.align ?? 'left'"
                [width]="cell.col.width"
                [style]="cellStyle"
                ><ng-container
                  *ngTemplateOutlet="
                    content;
                    context: { $implicit: cell, render: cell.col.render }
                  "
              /></pdf-table-cell>
            }
          </pdf-table-row>
        }
      </pdf-table-body>
      @if (l.footer; as footer) {
        <pdf-table-footer>
          <pdf-table-row footer>
            @for (cell of footer; track cell.col.key) {
              <pdf-table-cell
                [footer]="cell.footer"
                [align]="cell.col.align ?? 'left'"
                [width]="cell.col.width"
                [style]="cellStyle"
                ><ng-container
                  *ngTemplateOutlet="
                    content;
                    context: { $implicit: cell, render: cell.col.renderFooter }
                  "
              /></pdf-table-cell>
            }
          </pdf-table-row>
        </pdf-table-footer>
      }
    </pdf-table>
    <ng-template #content let-cell let-render="render">
      @if (render) {
        <ng-container
          *ngTemplateOutlet="render; context: cell.context; injector: injector"
        />
      } @else if (cell.textStyle) {
        <takumi-text [style]="cell.textStyle">{{ cell.text }}</takumi-text>
      } @else {
        <ng-container>{{ cell.text }}</ng-container>
      }
    </ng-template>
  `,
})
export class PdfDataTable<T extends Record<string, unknown>> {
  /** Templates passed in resolve the theme from where they render, as React context did. */
  protected readonly injector = inject(Injector);
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly variant = input<NonNullable<DataTableProps<T>["variant"]>>("grid");
  readonly footer = input<DataTableProps<T>["footer"]>();
  readonly stripe = input(false, { transform: booleanAttribute });
  readonly size = input<DataTableSize>("default");
  readonly noWrap = input(false, { transform: booleanAttribute });
  readonly style = input<DataTableProps<T>["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    dataTableLayout(this.theme(), {
      columns: this.columns(),
      data: this.data(),
      footer: this.footer(),
      size: this.size(),
    })
  );
}
