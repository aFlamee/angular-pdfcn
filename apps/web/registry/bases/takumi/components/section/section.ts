import { booleanAttribute, Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import {
  StyleSheet,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/takumi/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type SectionSpacing = "none" | "sm" | "md" | "lg" | "xl";
export type SectionPadding = "none" | "sm" | "md" | "lg";
export type SectionVariant = "default" | "callout" | "highlight" | "card";

/**
 * Layout container with spacing, padding, and visual style variants.
 * Props - `spacing` | `padding` | `background` | `border` | `variant` | `accentColor` | `noWrap` | `children` | `style`
 * @see {@link SectionProps}
 */
export interface SectionProps extends PDFComponentProps {
  /**
   * @default 'md'
   */
  spacing?: SectionSpacing;
  padding?: SectionPadding;
  background?: string;
  /**
   * @default false
   */
  border?: boolean;
  /**
   * @default 'default'
   */
  variant?: SectionVariant;
  accentColor?: string;
  /**
   * @default false
   */
  noWrap?: boolean;
}

const createSectionStyles = (t: PdfcnTheme) => {
  const { spacing, borderRadius } = t.primitives;
  return StyleSheet.create({
    base: { flexDirection: "column" },
    border: {
      borderColor: t.colors.border,
      borderRadius: borderRadius.md,
      borderStyle: "solid",
      borderWidth: spacing[0.5],
    },
    callout: {
      borderLeftColor: t.colors.primary,
      borderLeftStyle: "solid",
      borderLeftWidth: spacing[1],
      paddingLeft: spacing[4],
      paddingVertical: spacing[2],
    },
    card: {
      borderColor: t.colors.border,
      borderRadius: borderRadius.md,
      borderStyle: "solid",
      borderWidth: spacing[0.5],
      padding: spacing[4],
    },
    highlight: {
      backgroundColor: t.colors.muted,
      borderLeftColor: t.colors.primary,
      borderLeftStyle: "solid",
      borderLeftWidth: spacing[1],
      padding: spacing[4],
    },
    paddingLg: { padding: spacing[6] },
    paddingMd: { padding: spacing[4] },
    paddingNone: { padding: spacing[0] },
    paddingSm: { padding: spacing[3] },
    spacingLg: { marginVertical: spacing[8] },
    spacingMd: { marginVertical: t.spacing.sectionGap },
    spacingNone: { marginVertical: spacing[0] },
    spacingSm: { marginVertical: spacing[4] },
    spacingXl: { marginVertical: spacing[12] },
  });
};

const sectionStyle = (
  theme: PdfcnTheme,
  {
    spacing = "md",
    padding,
    background,
    border,
    variant = "default",
    accentColor,
    style,
  }: SectionProps
) => {
  const styles = createSectionStyles(theme);
  const spacingMap = {
    lg: styles.spacingLg,
    md: styles.spacingMd,
    none: styles.spacingNone,
    sm: styles.spacingSm,
    xl: styles.spacingXl,
  };
  const paddingMap = {
    lg: styles.paddingLg,
    md: styles.paddingMd,
    none: styles.paddingNone,
    sm: styles.paddingSm,
  };
  const variantMap: Record<SectionVariant, Style | null> = {
    callout: styles.callout,
    card: styles.card,
    default: null,
    highlight: styles.highlight,
  };
  const styleArray: Style[] = [styles.base, spacingMap[spacing]];
  const variantStyle = variantMap[variant];
  if (variantStyle) {
    styleArray.push(variantStyle);
  }
  if (accentColor && (variant === "callout" || variant === "highlight")) {
    styleArray.push({
      borderLeftColor: resolveColor(accentColor, theme.colors),
    });
  }
  if (padding && padding in paddingMap) {
    styleArray.push(paddingMap[padding]);
  }
  if (border && variant === "default") {
    styleArray.push(styles.border);
  }
  if (background) {
    styleArray.push({
      backgroundColor: resolveColor(background, theme.colors),
    });
  }
  if (style) {
    styleArray.push(...[style].flat());
  }
  return styleArray;
};

@Component({
  imports: [TakumiView],
  selector: "pdf-section",
  template: `<takumi-view [style]="sectionStyle()"
    ><ng-content
  /></takumi-view>`,
})
export class PdfSection {
  readonly spacing = input<SectionSpacing>("md");
  readonly padding = input<SectionPadding>();
  readonly background = input<string>();
  readonly border = input(false, { transform: booleanAttribute });
  readonly variant = input<SectionVariant>("default");
  readonly accentColor = input<string>();
  readonly style = input<SectionProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly sectionStyle = computed(() =>
    sectionStyle(this.theme(), {
      accentColor: this.accentColor(),
      background: this.background(),
      border: this.border(),
      padding: this.padding(),
      spacing: this.spacing(),
      style: this.style(),
      variant: this.variant(),
    })
  );
}
