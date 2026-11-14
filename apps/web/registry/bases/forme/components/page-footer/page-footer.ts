import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  Component,
  computed,
  input,
  TemplateRef,
} from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/forme/components/theme-provider";
import {
  FormeFixed,
  FormeText,
  FormeView,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/forme/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type PageFooterVariant =
  | "simple"
  | "centered"
  | "branded"
  | "minimal"
  | "three-column"
  | "detailed";

/**
 * Footer row with layout variants, optional sticky or fixed positioning, and contact info support.
 * Props - `leftText` | `rightText` | `centerText` | `variant` | `background` | `textColor` | `marginTop` | `address` | `phone` | `email` | `website` | `fixed` | `sticky` | `pagePadding` | `noWrap` | `style`
 * @see {@link PageFooterProps}
 */
/** Plain text, or a template for richer content such as a page number. */
export type FooterSlot = string | TemplateRef<unknown>;

export interface PageFooterProps extends PDFComponentProps {
  leftText?: FooterSlot;
  rightText?: FooterSlot;
  centerText?: FooterSlot;
  /**
   * @default 'simple'
   */
  variant?: PageFooterVariant;
  background?: string;
  textColor?: string;
  marginTop?: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  /**
   * @default false
   */
  fixed?: boolean;
  /**
   * @default false
   */
  sticky?: boolean;
  /**
   * @default 0
   */
  pagePadding?: number;
  /**
   * @default true
   */
  noWrap?: boolean;
}

const createPageFooterStyles = (t: PdfcnTheme) => {
  const { spacing, fontWeights } = t.primitives;
  const c = t.colors;
  const { body } = t.typography;

  const textBase = {
    color: c.mutedForeground,
    fontFamily: body.fontFamily,
    fontSize: t.primitives.typography.xs,
    lineHeight: body.lineHeight,
  };

  return StyleSheet.create({
    brandedContainer: {
      alignItems: "center",
      backgroundColor: c.primary,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },

    centeredContainer: {
      alignItems: "center",
      borderTopColor: c.border,
      borderTopStyle: "solid",
      borderTopWidth: spacing[0.5],
      display: "flex",
      flexDirection: "column",
      paddingTop: spacing[3],
    },

    companyBold: {
      ...textBase,
      color: c.foreground,
      fontWeight: fontWeights.bold,
    },

    companyName: {
      ...textBase,
      color: c.foreground,
      fontWeight: fontWeights.medium,
    },

    contactInfoCenter: {
      ...textBase,
      fontSize: t.primitives.typography.xs - 1,
      marginTop: spacing[0.5],
      textAlign: "center",
    },
    detailedContainer: {
      borderTopColor: c.border,
      borderTopStyle: "solid",
      borderTopWidth: spacing[1],
      display: "flex",
      flexDirection: "column",
      paddingTop: spacing[3],
    },
    detailedLeft: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    detailedPageNumber: {
      ...textBase,
      borderTopColor: c.border,
      borderTopStyle: "solid",
      borderTopWidth: spacing[0.5],
      paddingTop: spacing[2],
      textAlign: "center",
    },
    detailedRight: {
      alignItems: "flex-end",
      display: "flex",
      flexDirection: "column",
    },
    detailedTopRow: {
      alignItems: "flex-start",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing[2],
    },

    minimalContainer: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: spacing[1],
      paddingTop: spacing[1],
    },
    simpleContainer: {
      alignItems: "center",
      borderTopColor: c.border,
      borderTopStyle: "solid",
      borderTopWidth: spacing[0.5],
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: spacing[3],
    },
    simpleTextCenter: {
      ...textBase,
      textAlign: "center",
    },
    simpleTextLeft: {
      ...textBase,
    },
    simpleTextRight: {
      ...textBase,
      textAlign: "right",
    },
    textBranded: {
      ...textBase,
      color: c.primaryForeground,
      fontWeight: fontWeights.medium,
    },
    textBrandedRight: {
      ...textBase,
      color: c.primaryForeground,
      textAlign: "right",
    },
    textCenter: {
      ...textBase,
      flex: 1,
      textAlign: "center",
    },
    textCenteredVariant: {
      ...textBase,
      marginBottom: spacing[1],
      textAlign: "center",
    },

    textLeft: {
      ...textBase,
      flex: 1,
    },
    textRight: {
      ...textBase,
      textAlign: "right",
    },
    threeColumnCenter: {
      alignItems: "center",
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    threeColumnContainer: {
      alignItems: "flex-start",
      borderTopColor: c.border,
      borderTopStyle: "solid",
      borderTopWidth: spacing[0.5],
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: spacing[3],
    },
    threeColumnLeft: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    threeColumnRight: {
      alignItems: "flex-end",
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
  });
};

const applyTextColor = (
  styles: Style[],
  color: string | undefined
): Style[] => {
  if (!color) {
    return styles;
  }
  return [...styles, { color }];
};

/** Container and slot styles of each variant. */
const pageFooterStyles = (
  theme: PdfcnTheme,
  {
    centerText,
    variant = "simple",
    background,
    textColor,
    marginTop,
    sticky = false,
    pagePadding = 0,
    style,
  }: PageFooterProps
) => {
  const styles = createPageFooterStyles(theme);
  const mt = sticky ? 0 : (marginTop ?? theme.spacing.sectionGap);
  const resolvedTextColor = textColor
    ? resolveColor(textColor, theme.colors)
    : undefined;
  const stickyStyle: Style = {};

  const applyOverrides = (base: Style[]): Style[] => {
    if (background) {
      base.push({ backgroundColor: resolveColor(background, theme.colors) });
    }
    if (style) {
      base.push(style);
    }
    if (sticky) {
      base.push(stickyStyle);
    }
    return base;
  };

  const variantRenderers: Record<PageFooterVariant, () => Style[][]> = {
    branded: () => [
      applyOverrides([styles.brandedContainer, { marginTop: mt }]),
      applyTextColor([styles.textBranded], resolvedTextColor),
      applyTextColor([styles.textBrandedRight], resolvedTextColor),
    ],
    centered: () => [
      applyOverrides([styles.centeredContainer, { marginTop: mt }]),
      applyTextColor([styles.textCenteredVariant], resolvedTextColor),
    ],
    detailed: () => [
      applyOverrides([styles.detailedContainer, { marginTop: mt }]),
      applyTextColor([styles.companyBold], resolvedTextColor),
      applyTextColor([styles.textLeft], resolvedTextColor),
      applyTextColor([styles.textRight], resolvedTextColor),
      applyTextColor([styles.detailedPageNumber], resolvedTextColor),
    ],
    minimal: () => [
      applyOverrides([styles.minimalContainer, { marginTop: mt }]),
      applyTextColor([styles.textLeft], resolvedTextColor),
      applyTextColor([styles.textRight], resolvedTextColor),
    ],
    simple: () => [
      applyOverrides([styles.simpleContainer, { marginTop: mt }]),
      applyTextColor(
        [styles.simpleTextLeft, { width: centerText ? 160 : 360 }],
        resolvedTextColor
      ),
      applyTextColor(
        [styles.simpleTextCenter, { width: 160 }],
        resolvedTextColor
      ),
      applyTextColor(
        [styles.simpleTextRight, { width: centerText ? 160 : 120 }],
        resolvedTextColor
      ),
    ],
    "three-column": () => [
      applyOverrides([styles.threeColumnContainer, { marginTop: mt }]),
      applyTextColor([styles.companyName], resolvedTextColor),
      applyTextColor([styles.contactInfoCenter], resolvedTextColor),
      applyTextColor([styles.textRight], resolvedTextColor),
    ],
  };

  const [container, ...slots] = variantRenderers[variant]();
  const footerOffset = sticky
    ? Math.max(theme.spacing.page.marginBottom - pagePadding, 0)
    : 0;
  return {
    container,
    fixedStyle: [
      container,
      footerOffset ? { marginBottom: -footerOffset } : undefined,
    ],
    slots,
    styles,
  };
};

/** Footer row with layout variants, optional sticky or fixed positioning, and contact info support. */
@Component({
  imports: [FormeFixed, FormeText, FormeView, NgTemplateOutlet],
  selector: "pdf-page-footer",
  template: `
    @let l = layout();
    @let s = l.styles;
    @if (fixed() || sticky()) {
      <forme-fixed position="footer" [style]="l.fixedStyle"
        ><ng-container *ngTemplateOutlet="content"
      /></forme-fixed>
    } @else {
      <forme-view [wrap]="!noWrap()" [style]="l.container"
        ><ng-container *ngTemplateOutlet="content"
      /></forme-view>
    }
    <ng-template #content>
      @switch (variant()) {
        @case ("three-column") {
          <forme-view [style]="s.threeColumnLeft">
            <ng-container
              *ngTemplateOutlet="
                slot;
                context: { $implicit: leftText(), style: l.slots[0] }
              "
            />
            @if (address()) {
              <forme-text [style]="s.textLeft">{{ address() }}</forme-text>
            }
          </forme-view>
          <forme-view [style]="s.threeColumnCenter">
            @if (phone()) {
              <forme-text [style]="l.slots[1]">{{ phone() }}</forme-text>
            }
            @if (email()) {
              <forme-text [style]="l.slots[1]">{{ email() }}</forme-text>
            }
            @if (website()) {
              <forme-text [style]="l.slots[1]">{{ website() }}</forme-text>
            }
          </forme-view>
          <forme-view [style]="s.threeColumnRight">
            <ng-container
              *ngTemplateOutlet="
                slot;
                context: { $implicit: rightText(), style: l.slots[2] }
              "
            />
          </forme-view>
        }
        @case ("detailed") {
          <forme-view [style]="s.detailedTopRow">
            <forme-view [style]="s.detailedLeft">
              <ng-container
                *ngTemplateOutlet="
                  slot;
                  context: { $implicit: leftText(), style: l.slots[0] }
                "
              />
              @if (address()) {
                <forme-text [style]="l.slots[1]">{{ address() }}</forme-text>
              }
            </forme-view>
            <forme-view [style]="s.detailedRight">
              @if (phone()) {
                <forme-text [style]="l.slots[2]">{{
                  "Phone: " + phone()
                }}</forme-text>
              }
              @if (email()) {
                <forme-text [style]="l.slots[2]">{{
                  "Email: " + email()
                }}</forme-text>
              }
              @if (website()) {
                <forme-text [style]="l.slots[2]">{{
                  "Web: " + website()
                }}</forme-text>
              }
            </forme-view>
          </forme-view>
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: rightText(), style: l.slots[3] }
            "
          />
        }
        @case ("simple") {
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: leftText(), style: l.slots[0] }
            "
          />
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: centerText(), style: l.slots[1] }
            "
          />
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: rightText(), style: l.slots[2] }
            "
          />
        }
        @case ("centered") {
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: leftText(), style: l.slots[0] }
            "
          />
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: rightText(), style: l.slots[0] }
            "
          />
        }
        @default {
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: leftText(), style: l.slots[0] }
            "
          />
          <ng-container
            *ngTemplateOutlet="
              slot;
              context: { $implicit: rightText(), style: l.slots[1] }
            "
          />
        }
      }
    </ng-template>
    <ng-template #slot let-value let-style="style">
      @if (isTemplate(value)) {
        <ng-container *ngTemplateOutlet="value" />
      } @else if (value) {
        <forme-text [style]="style">{{ value }}</forme-text>
      }
    </ng-template>
  `,
})
export class PdfPageFooter {
  readonly leftText = input<FooterSlot>();
  readonly rightText = input<FooterSlot>();
  readonly centerText = input<FooterSlot>();
  readonly variant = input<PageFooterVariant>("simple");
  readonly background = input<string>();
  readonly textColor = input<string>();
  readonly marginTop = input<number>();
  readonly address = input<string>();
  readonly phone = input<string>();
  readonly email = input<string>();
  readonly website = input<string>();
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly sticky = input(false, { transform: booleanAttribute });
  readonly pagePadding = input(0);
  readonly noWrap = input(true, { transform: booleanAttribute });
  readonly style = input<PageFooterProps["style"]>();

  protected readonly isTemplate = (value: unknown) =>
    value instanceof TemplateRef;

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    pageFooterStyles(this.theme(), {
      background: this.background(),
      centerText: this.centerText(),
      marginTop: this.marginTop(),
      pagePadding: this.pagePadding(),
      sticky: this.sticky(),
      style: this.style(),
      textColor: this.textColor(),
      variant: this.variant(),
    })
  );
}
