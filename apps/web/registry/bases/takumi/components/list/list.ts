import { NgTemplateOutlet } from "@angular/common";
import { booleanAttribute, Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiText,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import { createListStyles } from "./list.styles";
import type { ListItem, ListVariant, PdfListProps } from "./list.types";

type Styles = ReturnType<typeof createListStyles>;
type GapProp = "xs" | "sm" | "md";

/** One rendered row. Bullet and multi-level rows carry a marker and nested rows. */
interface ListRow {
  variant: ListVariant;
  item: ListItem;
  rowStyle: Style[];
  label?: string;
  boxStyle?: Style[];
  marker?: { wrap: Style; dot: Style };
  textStyle?: Style[];
  children?: { style: Style | undefined; rows: (ListRow | null)[] } | null;
}

const getGapStyle = (gap: GapProp, styles: Styles): Style => {
  if (gap === "xs") {
    return styles.itemRowGapXs;
  }
  if (gap === "md") {
    return styles.itemRowGapMd;
  }
  return styles.itemRowGapSm;
};

const buildRowStyles = (
  index: number,
  total: number,
  gap: GapProp,
  styles: Styles,
  align: "start" | "center" = "start"
): Style[] => {
  const row: Style[] = [
    align === "center" ? styles.itemRowCenter : styles.itemRow,
  ];
  if (index !== total - 1) {
    row.push(getGapStyle(gap, styles));
  }
  return row;
};

/** Bullet dot marker — solid filled for level 0, outline ring for nested levels. */
const dotMarker = (level: number, styles: Styles) =>
  level === 0
    ? { dot: styles.markerBulletDot, wrap: styles.markerBulletWrap }
    : { dot: styles.markerBulletSubDot, wrap: styles.markerBulletSubWrap };

// eslint-disable-next-line no-use-before-define, prefer-const
let renderBulletItem: (
  item: ListItem,
  index: number,
  total: number,
  gap: GapProp,
  styles: Styles,
  level: number
) => ListRow;
// eslint-disable-next-line no-use-before-define, prefer-const
let renderMultiLevelItem: (
  item: ListItem,
  index: number,
  total: number,
  gap: GapProp,
  styles: Styles,
  level: number
) => ListRow;

const renderNumberedItem = (
  item: ListItem,
  index: number,
  total: number,
  gap: GapProp,
  styles: Styles
): ListRow => ({
  item,
  label: `${index + 1}`,
  rowStyle: buildRowStyles(index, total, gap, styles, "center"),
  variant: "numbered",
});

const renderChecklistItem = (
  item: ListItem,
  index: number,
  total: number,
  gap: GapProp,
  styles: Styles
): ListRow => {
  const isChecked = item.checked ?? true;
  return {
    boxStyle: [styles.checkBox, isChecked ? styles.checkBoxChecked : {}],
    item,
    rowStyle: buildRowStyles(index, total, gap, styles, "center"),
    variant: "checklist",
  };
};

const renderIconItem = (
  item: ListItem,
  index: number,
  total: number,
  gap: GapProp,
  styles: Styles
): ListRow => ({
  item,
  rowStyle: buildRowStyles(index, total, gap, styles, "center"),
  variant: "icon",
});

const renderDescriptiveItem = (
  item: ListItem,
  index: number,
  total: number,
  gap: GapProp,
  styles: Styles
): ListRow => ({
  item,
  rowStyle: buildRowStyles(index, total, gap, styles),
  variant: "descriptive",
});

const renderItem = (
  item: ListItem,
  index: number,
  total: number,
  variant: ListVariant,
  gap: GapProp,
  styles: Styles,
  level: number
): ListRow | null => {
  switch (variant) {
    case "bullet": {
      return renderBulletItem(item, index, total, gap, styles, level);
    }
    case "numbered": {
      return renderNumberedItem(item, index, total, gap, styles);
    }
    case "checklist": {
      return renderChecklistItem(item, index, total, gap, styles);
    }
    case "icon": {
      return renderIconItem(item, index, total, gap, styles);
    }
    case "multi-level": {
      return renderMultiLevelItem(item, index, total, gap, styles, level);
    }
    case "descriptive": {
      return renderDescriptiveItem(item, index, total, gap, styles);
    }
    default: {
      break;
    }
  }
  return null;
};

const renderItemList = (
  items: ListItem[],
  variant: ListVariant,
  gap: GapProp,
  styles: Styles,
  level: number
) => ({
  rows: items.map((item, index) =>
    renderItem(item, index, items.length, variant, gap, styles, level)
  ),
  style: level > 0 ? styles.childrenContainer : undefined,
});

renderBulletItem = (item, index, total, gap, styles, level) => ({
  children:
    item.children && item.children.length > 0
      ? renderItemList(item.children, "bullet", gap, styles, level + 1)
      : null,
  item,
  marker: dotMarker(level, styles),
  rowStyle: buildRowStyles(index, total, gap, styles),
  textStyle: [styles.itemText],
  variant: "bullet",
});

renderMultiLevelItem = (item, index, total, gap, styles, level) => ({
  children:
    item.children && item.children.length > 0
      ? renderItemList(item.children, "multi-level", gap, styles, level + 1)
      : null,
  item,
  marker: dotMarker(level, styles),
  rowStyle: buildRowStyles(index, total, gap, styles),
  textStyle: [
    level === 0 ? styles.itemText : styles.itemTextSub,
    level === 0 ? styles.itemTextBold : {},
  ],
  variant: "multi-level",
});

const listLayout = (
  theme: PdfcnTheme,
  {
    items,
    variant = "bullet",
    gap = "sm",
    style,
    _level = 0,
  }: Omit<PdfListProps, "noWrap">
) => {
  const styles = createListStyles(theme);

  const containerStyles: Style[] = [styles.container];
  if (_level > 0) {
    containerStyles.push(styles.childrenContainer);
  }
  const styleArray = style ? [...containerStyles, style] : containerStyles;

  return {
    container: styleArray,
    rows: items.map((item, index) =>
      renderItem(item, index, items.length, variant, gap, styles, _level)
    ),
    styles,
  };
};

/** List of items with multiple style variants including bullet, numbered, checklist, and descriptive. */
@Component({
  imports: [TakumiText, TakumiView, NgTemplateOutlet],
  selector: "pdf-list",
  template: `
    @let s = layout().styles;
    <takumi-view [wrap]="!noWrap()" [style]="layout().container">
      <ng-container
        *ngTemplateOutlet="rowList; context: { $implicit: layout().rows }"
      />
    </takumi-view>
    <ng-template #rowList let-rows>
      @for (row of asRows(rows); track $index) {
        @if (row) {
          @switch (row.variant) {
            @case ("numbered") {
              <takumi-view [style]="row.rowStyle">
                <takumi-view [style]="s.markerNumberBadge">
                  <takumi-text [style]="s.markerNumberText">{{
                    row.label
                  }}</takumi-text>
                </takumi-view>
                <takumi-view [style]="s.itemTextWrap">
                  <takumi-text [style]="s.itemText">{{
                    row.item.text
                  }}</takumi-text>
                </takumi-view>
              </takumi-view>
            }
            @case ("checklist") {
              <takumi-view [style]="row.rowStyle">
                <takumi-view [style]="row.boxStyle" />
                <takumi-view [style]="s.itemTextWrap">
                  <takumi-text [style]="s.itemText">{{
                    row.item.text
                  }}</takumi-text>
                </takumi-view>
              </takumi-view>
            }
            @case ("icon") {
              <takumi-view [style]="row.rowStyle">
                <takumi-view [style]="s.iconBox">
                  <takumi-text [style]="s.iconMark">★</takumi-text>
                </takumi-view>
                <takumi-view [style]="s.itemTextWrap">
                  <takumi-text [style]="s.itemText">{{
                    row.item.text
                  }}</takumi-text>
                </takumi-view>
              </takumi-view>
            }
            @case ("descriptive") {
              <takumi-view [style]="row.rowStyle">
                <takumi-view [style]="s.descriptiveAccent" />
                <takumi-view [style]="s.descriptiveContent">
                  <takumi-text [style]="s.descriptiveTitle">{{
                    row.item.text
                  }}</takumi-text>
                  @if (row.item.description) {
                    <takumi-text [style]="s.descriptiveDesc">{{
                      row.item.description
                    }}</takumi-text>
                  }
                </takumi-view>
              </takumi-view>
            }
            @default {
              <takumi-view>
                <takumi-view [style]="row.rowStyle">
                  <takumi-view [style]="row.marker?.wrap">
                    <takumi-view [style]="row.marker?.dot" />
                  </takumi-view>
                  <takumi-view [style]="s.itemTextWrap">
                    <takumi-text [style]="row.textStyle">{{
                      row.item.text
                    }}</takumi-text>
                  </takumi-view>
                </takumi-view>
                @if (row.children) {
                  <takumi-view [style]="row.children.style">
                    <ng-container
                      *ngTemplateOutlet="
                        rowList;
                        context: { $implicit: row.children.rows }
                      "
                    />
                  </takumi-view>
                }
              </takumi-view>
            }
          }
        }
      }
    </ng-template>
  `,
})
export class PdfList {
  readonly items = input.required<ListItem[]>();
  readonly variant = input<ListVariant>("bullet");
  readonly gap = input<GapProp>("sm");
  readonly style = input<PdfListProps["style"]>();
  readonly noWrap = input(false, { transform: booleanAttribute });
  readonly _level = input(0);

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    listLayout(this.theme(), {
      _level: this._level(),
      gap: this.gap(),
      items: this.items(),
      style: this.style(),
      variant: this.variant(),
    })
  );

  protected readonly asRows = (rows: (ListRow | null)[]) => rows;
}
