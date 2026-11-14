import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import type { WritableSignal } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiText,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import { createTableStyles } from "./table.styles";
import type {
  TableCellProps,
  TableProps,
  TableRowProps,
  TableSectionProps,
  TableVariant,
} from "./table.types";

const tableCellStyles = (
  theme: PdfcnTheme,
  {
    header,
    footer,
    align,
    width,
    style,
    variant = "line",
    _last,
  }: TableCellProps
) => {
  const styles = createTableStyles(theme);
  const cellStyles: Style[] =
    width === undefined
      ? [styles.cell]
      : [styles.cellFixed, { width } as Style];

  const cellVariantStyle = (
    {
      bordered: styles.cellBordered,
      compact: styles.cellCompact,
      minimal: styles.cellMinimal,
      "primary-header": styles.cellPrimaryHeader,
      striped: styles.cellStriped,
    } as Partial<Record<TableVariant, Style>>
  )[variant];
  if (cellVariantStyle) {
    cellStyles.push(cellVariantStyle);
  }

  if (variant === "grid" && !_last) {
    cellStyles.push(styles.cellGridBorder);
  } else if (variant === "bordered" && !_last) {
    cellStyles.push(styles.cellBorderedBorder);
  }

  if (align) {
    cellStyles.push({ textAlign: align } as Style);
  }

  const styleArray = style ? [...cellStyles, style] : cellStyles;

  let textStyle: Style = styles.cellText;
  if (header) {
    textStyle = {
      bordered: styles.cellTextHeaderBordered,
      compact: styles.cellTextHeaderCompact,
      grid: styles.cellTextHeaderGrid,
      line: styles.cellTextHeaderLine,
      minimal: styles.cellTextHeaderMinimal,
      "primary-header": styles.cellTextHeaderPrimaryHeader,
      striped: styles.cellTextHeaderStriped,
    }[variant];
  } else if (footer) {
    textStyle = styles.cellTextFooter;
  } else if (variant === "compact") {
    textStyle = styles.cellTextCompact;
  }

  return {
    cell: styleArray,
    text: [
      textStyle,
      align ? { textAlign: align } : {},
      { margin: 0, padding: 0 },
    ],
  };
};

const rowStyle = (
  theme: PdfcnTheme,
  { header, footer, stripe, style, variant = "line" }: TableRowProps
) => {
  const styles = createTableStyles(theme);
  const rowStyles: Style[] = [
    styles.row,
    {
      bordered: styles.rowBordered,
      compact: styles.rowCompact,
      grid: styles.rowGrid,
      line: styles.rowLine,
      minimal: styles.rowMinimal,
      "primary-header": styles.rowPrimaryHeader,
      striped: styles.rowStriped,
    }[variant],
  ];

  if (header) {
    rowStyles.push(
      {
        bordered: styles.rowHeaderBordered,
        compact: styles.rowHeaderCompact,
        grid: styles.rowHeaderGrid,
        line: styles.rowHeaderLine,
        minimal: styles.rowHeaderMinimal,
        "primary-header": styles.rowHeaderPrimaryHeader,
        striped: styles.rowHeaderStriped,
      }[variant]
    );
  }

  if (footer) {
    if (variant === "striped") {
      rowStyles.push(styles.rowFooterStriped);
    } else {
      rowStyles.push(styles.rowFooter);
    }
  }

  if (stripe && !header && !footer) {
    rowStyles.push(styles.rowStripe);
  }

  const styleArray = style ? [...rowStyles, style] : rowStyles;
  return [{ breakInside: "avoid" as const }, styleArray].flat().filter(Boolean);
};

const tableStyle = (
  theme: PdfcnTheme,
  { style, variant = "line" }: TableProps
) => {
  const styles = createTableStyles(theme);
  const tableStyles: Style[] = [
    styles.table,
    {
      bordered: styles.tableBordered,
      compact: styles.tableCompact,
      grid: styles.tableGrid,
      line: styles.tableLine,
      minimal: styles.tableMinimal,
      "primary-header": styles.tablePrimaryHeader,
      striped: styles.tableStriped,
    }[variant],
  ];

  const styleArray = style ? [...tableStyles, style] : tableStyles;
  return styleArray;
};

/** Adds `item` to `list` in creation order and removes it on destroy. */
const register = <T>(list: WritableSignal<T[]>, item: T) => {
  list.update((items) => [...items, item]);
  inject(DestroyRef).onDestroy(() =>
    list.update((items) => items.filter((entry) => entry !== item))
  );
};

@Component({
  imports: [TakumiView, NgTemplateOutlet],
  selector: "pdf-table",
  template: `
    <ng-template #rows><ng-content /></ng-template>
    @if (noWrap()) {
      <takumi-view [style]="{ breakInside: 'avoid' }">
        <takumi-view [style]="tableStyle()"
          ><ng-container [ngTemplateOutlet]="rows"
        /></takumi-view>
      </takumi-view>
    } @else {
      <takumi-view [style]="tableStyle()"
        ><ng-container [ngTemplateOutlet]="rows"
      /></takumi-view>
    }
  `,
})
export class PdfTable {
  readonly variant = input<TableVariant>("line");
  readonly zebraStripe = input(false, { transform: booleanAttribute });
  readonly noWrap = input(false, { transform: booleanAttribute });
  readonly style = input<TableProps["style"]>();

  /** Rows inside `<pdf-table-body>`, in document order. */
  readonly bodyRows = signal<PdfTableRow[]>([]);
  readonly zebra = computed(
    () => this.variant() === "striped" || this.zebraStripe()
  );

  private readonly theme = injectPdfcnTheme();
  protected readonly tableStyle = computed(() =>
    tableStyle(this.theme(), { style: this.style(), variant: this.variant() })
  );
}

@Component({
  imports: [TakumiView],
  selector: "pdf-table-header",
  template: `<takumi-view [style]="style()"><ng-content /></takumi-view>`,
})
export class PdfTableHeader {
  readonly style = input<TableSectionProps["style"]>();
}

@Component({
  imports: [TakumiView],
  selector: "pdf-table-body",
  template: `<takumi-view [style]="style()"><ng-content /></takumi-view>`,
})
export class PdfTableBody {
  readonly style = input<TableSectionProps["style"]>();
}

@Component({
  imports: [TakumiView],
  selector: "pdf-table-footer",
  template: `<takumi-view [style]="style()"><ng-content /></takumi-view>`,
})
export class PdfTableFooter {
  readonly style = input<TableSectionProps["style"]>();
}

/** Inside a `<pdf-table>`, the table's variant and zebra striping apply. */
@Component({
  imports: [TakumiView],
  selector: "pdf-table-row",
  template: `<takumi-view [style]="rowStyle()"><ng-content /></takumi-view>`,
})
export class PdfTableRow {
  readonly header = input(false, { transform: booleanAttribute });
  readonly footer = input(false, { transform: booleanAttribute });
  readonly stripe = input(false, { transform: booleanAttribute });
  readonly variant = input<TableVariant>("line");
  readonly style = input<TableRowProps["style"]>();

  private readonly table = inject(PdfTable, { optional: true });
  readonly cells = signal<PdfTableCell[]>([]);
  readonly resolvedVariant = computed(
    () => this.table?.variant() ?? this.variant()
  );

  constructor() {
    if (this.table && inject(PdfTableBody, { optional: true })) {
      register(this.table.bodyRows, this);
    }
  }

  private readonly theme = injectPdfcnTheme();
  protected readonly rowStyle = computed(() =>
    rowStyle(this.theme(), {
      footer: this.footer(),
      header: this.header(),
      stripe: this.table
        ? this.table.zebra() && this.table.bodyRows().indexOf(this) % 2 === 1
        : this.stripe(),
      style: this.style(),
      variant: this.resolvedVariant(),
    })
  );
}

/** Inside a `<pdf-table-row>`, the row's `header`, `footer`, and variant apply. */
@Component({
  imports: [TakumiText, TakumiView],
  selector: "pdf-table-cell",
  template: `
    <takumi-view [style]="styles().cell">
      <takumi-text ifString [style]="styles().text"><ng-content /></takumi-text>
    </takumi-view>
  `,
})
export class PdfTableCell {
  readonly header = input(false, { transform: booleanAttribute });
  readonly footer = input(false, { transform: booleanAttribute });
  readonly align = input<TableCellProps["align"]>();
  readonly width = input<TableCellProps["width"]>();
  readonly variant = input<TableVariant>("line");
  readonly style = input<TableCellProps["style"]>();

  private readonly row = inject(PdfTableRow, { optional: true });

  constructor() {
    if (this.row) {
      register(this.row.cells, this);
    }
  }

  private readonly theme = injectPdfcnTheme();
  protected readonly styles = computed(() =>
    tableCellStyles(this.theme(), {
      _last: this.row?.cells().at(-1) === this,
      align: this.align(),
      footer: this.row ? this.row.footer() : this.footer(),
      header: this.row ? this.row.header() : this.header(),
      style: this.style(),
      variant: this.row ? this.row.resolvedVariant() : this.variant(),
      width: this.width(),
    })
  );
}

export const TABLE = [
  PdfTable,
  PdfTableHeader,
  PdfTableBody,
  PdfTableFooter,
  PdfTableRow,
  PdfTableCell,
] as const;
