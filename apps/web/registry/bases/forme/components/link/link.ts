import { Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/forme/components/theme-provider";
import {
  FormeText,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/forme/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type LinkVariant = "default" | "muted" | "primary";
export type LinkUnderline = "always" | "none";

/**
 * Clickable hyperlink for PDF documents.
 * Props - `href` | `children` | `align` | `color` | `variant` | `underline` | `style`
 * @see {@link LinkProps}
 */
export interface LinkProps extends PDFComponentProps {
  href: string;
  /**
   * @default 'left'
   */
  align?: "left" | "center" | "right";
  color?: string;
  /**
   * @default 'default'
   */
  variant?: LinkVariant;
  /**
   * @default 'always'
   */
  underline?: LinkUnderline;
}

const createLinkStyles = (t: PdfcnTheme) => {
  const { fontWeights } = t.primitives;
  const base = {
    fontFamily: t.typography.body.fontFamily,
    fontSize: t.typography.body.fontSize,
    lineHeight: t.typography.body.lineHeight,
    marginBottom: t.spacing.paragraphGap,
  };
  return StyleSheet.create({
    default: {
      ...base,
      color: t.colors.accent,
      fontWeight: fontWeights.medium,
      textDecoration: "underline",
    },
    muted: {
      ...base,
      color: t.colors.mutedForeground,
      fontWeight: fontWeights.regular,
      textDecoration: "underline",
    },
    primary: {
      ...base,
      color: t.colors.primary,
      fontWeight: fontWeights.semibold,
      textDecoration: "underline",
    },
    underlineAlways: { textDecoration: "underline" },
    underlineNone: { textDecoration: "none" },
  });
};

const linkStyle = (
  theme: PdfcnTheme,
  {
    align,
    color,
    variant = "default",
    underline,
    style,
  }: Omit<LinkProps, "href">
) => {
  const styles = createLinkStyles(theme);
  const variantMap = {
    default: styles.default,
    muted: styles.muted,
    primary: styles.primary,
  };
  const underlineMap = {
    always: styles.underlineAlways,
    none: styles.underlineNone,
  };
  const styleArray: Style[] = [variantMap[variant]];
  if (underline && underline in underlineMap) {
    styleArray.push(underlineMap[underline]);
  }
  const semantic = {} as Style;
  if (align) {
    semantic.textAlign = align;
  }
  if (color) {
    semantic.color = resolveColor(color, theme.colors);
  }
  if (Object.keys(semantic).length > 0) {
    styleArray.push(semantic);
  }
  if (style) {
    styleArray.push(...[style].flat());
  }
  return styleArray;
};

// The Forme serializer flattens a link inside text to plain text, so `href` does not reach the document.
@Component({
  imports: [FormeText],
  selector: "pdf-link",
  template: `<forme-text [style]="linkStyle()"><ng-content /></forme-text>`,
})
export class PdfLink {
  readonly href = input.required<string>();
  readonly align = input<LinkProps["align"]>();
  readonly color = input<string>();
  readonly variant = input<LinkVariant>("default");
  readonly underline = input<LinkUnderline>();
  readonly style = input<LinkProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly linkStyle = computed(() =>
    linkStyle(this.theme(), {
      align: this.align(),
      color: this.color(),
      style: this.style(),
      underline: this.underline(),
      variant: this.variant(),
    })
  );
}
