import type { TemplateRef } from "@angular/core";

import type { TableVariant } from "@/registry/bases/takumi/components/table/table.types";
import type { PDFComponentProps } from "@/registry/types/pdf-components";

/** DataTable row density size. */
export type DataTableSize = "default" | "compact";

/** Template context of a `render` cell: the cell value and its row. */
export interface DataTableCellContext<T = Record<string, unknown>> {
  $implicit: unknown;
  row: T;
}

/** Template context of a `renderFooter` cell: the footer value. */
export interface DataTableFooterContext {
  $implicit: unknown;
}

/**
 * Column definition for a DataTable.
 * Props - `key` | `header` | `align` | `width` | `render` | `renderFooter`
 * @see {@link DataTableColumn}
 */
export interface DataTableColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  align?: "left" | "center" | "right";
  width?: string | number;
  /**
   * Custom cell template. Must contain takumi-* primitives (`<takumi-text>`,
   * `<takumi-view>`, etc.), NOT HTML DOM elements.
   */
  render?: TemplateRef<DataTableCellContext<T>>;
  /**
   * Custom footer cell template. Same constraint: takumi-* primitives only.
   */
  renderFooter?: TemplateRef<DataTableFooterContext>;
}

/**
 * Data table for PDF rendering with column definitions, footer support, and stripe options.
 * Props - `columns` | `data` | `variant` | `footer` | `stripe` | `size` | `noWrap` | `style`
 * @see {@link DataTableProps}
 */
export interface DataTableProps<T = Record<string, unknown>> extends Omit<
  PDFComponentProps,
  "children"
> {
  columns: DataTableColumn<T>[];
  data: T[];
  /**
   * @default 'grid'
   */
  variant?: TableVariant;
  footer?: Partial<Record<keyof T & string, string | number>>;
  stripe?: boolean;
  /**
   * @default 'default'
   */
  size?: DataTableSize;
  noWrap?: boolean;
}
