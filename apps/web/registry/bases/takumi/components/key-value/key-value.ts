import { booleanAttribute, Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import {
  StyleSheet,
  TakumiText,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/takumi/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type KeyValueDirection = "horizontal" | "vertical";
export type KeyValueSize = "sm" | "md" | "lg";

/**
 * A single key-value row with optional per-item color and style overrides.
 * Props - `key` | `value` | `valueColor` | `valueStyle` | `keyStyle`
 * @see {@link KeyValueEntry}
 */
export interface KeyValueEntry {
  key: string;
  value: string;
  valueColor?: string;
  valueStyle?: Style;
  keyStyle?: Style;
}

/**
 * List of key-value pairs with layout and style options.
 * Props - `items` | `direction` | `divided` | `size` | `labelFlex` | `labelColor` | `valueColor` | `boldValue` | `noWrap` | `dividerColor` | `dividerThickness` | `dividerMargin` | `style`
 * @see {@link KeyValueProps}
 */
export interface KeyValueProps extends PDFComponentProps {
  items: KeyValueEntry[];
  /**
   * @default 'horizontal'
   */
  direction?: KeyValueDirection;
  /**
   * @default false
   */
  divided?: boolean;
  /**
   * @default 'md'
   */
  size?: KeyValueSize;
  /**
   * @default 1
   */
  labelFlex?: number;
  labelColor?: string;
  valueColor?: string;
  /**
   * @default false
   */
  boldValue?: boolean;
  /**
   * @default false
   */
  noWrap?: boolean;
  dividerColor?: string;
  dividerThickness?: number;
  dividerMargin?: number;
}

const createKeyValueStyles = (t: PdfcnTheme) => {
  const { spacing, fontWeights } = t.primitives;
  const c = t.colors;
  const { body } = t.typography;
  const keyBase = {
    color: c.mutedForeground,
    fontFamily: body.fontFamily,
    fontWeight: fontWeights.medium,
  };
  const valueBase = {
    color: c.foreground,
    fontFamily: body.fontFamily,
    fontWeight: fontWeights.regular,
  };
  return StyleSheet.create({
    container: { flexDirection: "column" },
    divider: {
      borderBottomColor: c.border,
      borderBottomStyle: "solid",
      borderBottomWidth: spacing[0.5],
    },
    keyLg: { ...keyBase, fontSize: t.primitives.typography.base },
    keyMd: { ...keyBase, fontSize: body.fontSize },
    keySm: { ...keyBase, fontSize: t.primitives.typography.xs },
    rowHorizontal: {
      alignItems: "flex-start",
      flexDirection: "row",
      paddingVertical: spacing[1],
    },
    rowVertical: {
      flexDirection: "column",
      marginBottom: t.spacing.paragraphGap,
    },
    valueBold: { fontWeight: fontWeights.bold },
    valueLg: { ...valueBase, fontSize: t.primitives.typography.base },
    valueMd: { ...valueBase, fontSize: body.fontSize },
    valueSm: { ...valueBase, fontSize: t.primitives.typography.xs },
  });
};

const keyValueLayout = (
  theme: PdfcnTheme,
  {
    items,
    direction = "horizontal",
    divided = false,
    size = "md",
    labelFlex = 1,
    labelColor,
    valueColor,
    boldValue = false,
    dividerColor,
    dividerThickness,
    dividerMargin,
    style,
  }: KeyValueProps
) => {
  const styles = createKeyValueStyles(theme);
  const keyStyleMap = {
    lg: styles.keyLg,
    md: styles.keyMd,
    sm: styles.keySm,
  } as Record<KeyValueSize, Style>;
  const valueStyleMap = {
    lg: styles.valueLg,
    md: styles.valueMd,
    sm: styles.valueSm,
  } as Record<KeyValueSize, Style>;
  const containerStyles: Style[] = [styles.container];
  if (style) {
    containerStyles.push(...[style].flat());
  }

  return {
    container: containerStyles,
    rows: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const keyStyles: Style[] = [keyStyleMap[size]];
      if (labelColor) {
        keyStyles.push({ color: resolveColor(labelColor, theme.colors) });
      }
      if (item.keyStyle) {
        keyStyles.push(item.keyStyle);
      }
      const valStyles: Style[] = [valueStyleMap[size]];
      if (boldValue) {
        valStyles.push(styles.valueBold);
      }
      const resolvedValueColor = item.valueColor ?? valueColor;
      if (resolvedValueColor) {
        valStyles.push({
          color: resolveColor(resolvedValueColor, theme.colors),
        });
      }
      if (item.valueStyle) {
        valStyles.push(item.valueStyle);
      }

      if (direction === "horizontal") {
        const rowStyles: Style[] = [styles.rowHorizontal];
        if (divided && !isLast) {
          const dividerStyle: Style = {};
          if (dividerColor) {
            dividerStyle.borderBottomColor = resolveColor(
              dividerColor,
              theme.colors
            );
          }
          if (dividerThickness) {
            dividerStyle.borderBottomWidth = dividerThickness;
          }
          if (dividerMargin) {
            dividerStyle.marginBottom = dividerMargin;
          }
          rowStyles.push({ ...styles.divider, ...dividerStyle });
        }
        return {
          item,
          keyStyle: [...keyStyles, { flex: labelFlex }],
          rowStyle: rowStyles,
          valueStyle: [...valStyles, { flex: 1, textAlign: "right" } as Style],
        };
      }

      const rowStyles: Style[] = [styles.rowVertical];
      if (divided && !isLast) {
        rowStyles.push(styles.divider);
      }
      return {
        item,
        keyStyle: keyStyles,
        rowStyle: rowStyles,
        valueStyle: valStyles,
      };
    }),
  };
};

@Component({
  imports: [TakumiText, TakumiView],
  selector: "pdf-key-value",
  template: `
    <takumi-view [wrap]="!noWrap()" [style]="layout().container">
      @for (row of layout().rows; track row.item.key) {
        <takumi-view [style]="row.rowStyle">
          <takumi-text [style]="row.keyStyle">{{ row.item.key }}</takumi-text>
          <takumi-text [style]="row.valueStyle">{{
            row.item.value
          }}</takumi-text>
        </takumi-view>
      }
    </takumi-view>
  `,
})
export class PdfKeyValue {
  readonly items = input.required<KeyValueEntry[]>();
  readonly direction = input<KeyValueDirection>("horizontal");
  readonly divided = input(false, { transform: booleanAttribute });
  readonly size = input<KeyValueSize>("md");
  readonly labelFlex = input(1);
  readonly labelColor = input<string>();
  readonly valueColor = input<string>();
  readonly boldValue = input(false, { transform: booleanAttribute });
  readonly noWrap = input(false, { transform: booleanAttribute });
  readonly dividerColor = input<string>();
  readonly dividerThickness = input<number>();
  readonly dividerMargin = input<number>();
  readonly style = input<KeyValueProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    keyValueLayout(this.theme(), {
      boldValue: this.boldValue(),
      direction: this.direction(),
      divided: this.divided(),
      dividerColor: this.dividerColor(),
      dividerMargin: this.dividerMargin(),
      dividerThickness: this.dividerThickness(),
      items: this.items(),
      labelColor: this.labelColor(),
      labelFlex: this.labelFlex(),
      size: this.size(),
      style: this.style(),
      valueColor: this.valueColor(),
    })
  );
}
