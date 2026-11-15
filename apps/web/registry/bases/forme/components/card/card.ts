import { booleanAttribute, Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/forme/components/theme-provider";
import {
  FormeText,
  FormeView,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type CardVariant = "default" | "bordered" | "muted";

/**
 * Bordered content card with optional title and padding presets.
 * Props - `title` | `children` | `variant` | `padding` | `wrap` | `style`
 * @see {@link PdfCardProps}
 */
export interface PdfCardProps extends Omit<PDFComponentProps, "children"> {
  title?: string;
  /**
   * @default 'default'
   */
  variant?: CardVariant;
  /**
   * @default 'md'
   */
  padding?: "sm" | "md" | "lg";
  /**
   * When false, the card will not split across PDF pages.
   * @default false
   */
  wrap?: boolean;
}

const createCardStyles = (t: PdfcnTheme) => {
  const { spacing, borderRadius, fontWeights } = t.primitives;
  return StyleSheet.create({
    body: {
      color: t.colors.foreground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: t.typography.body.fontSize,
      lineHeight: t.typography.body.lineHeight,
    },
    card: {
      backgroundColor: t.colors.background,
      borderColor: t.colors.border,
      borderRadius: borderRadius.sm,
      borderStyle: "solid",
      borderWidth: 1,
      marginBottom: t.spacing.componentGap,
    },
    cardBordered: { borderWidth: 2 },
    cardMuted: { backgroundColor: t.colors.muted },
    paddingLg: { padding: spacing[4] },
    paddingMd: { padding: spacing[3] },
    paddingSm: { padding: spacing[2] },
    title: {
      borderBottomColor: t.colors.border,
      borderBottomStyle: "solid",
      borderBottomWidth: 1,
      color: t.colors.foreground,
      fontFamily: t.typography.heading.fontFamily,
      fontSize: t.primitives.typography.base,
      fontWeight: fontWeights.semibold,
      lineHeight: t.typography.heading.lineHeight,
      marginBottom: spacing[2],
      paddingBottom: spacing[1] + 2,
    },
  });
};

/** Card styles of the variant and padding preset. */
const cardStyle = (
  theme: PdfcnTheme,
  { variant = "default", padding = "md", style }: Omit<PdfCardProps, "title">
) => {
  const styles = createCardStyles(theme);
  const paddingMap = {
    lg: styles.paddingLg,
    md: styles.paddingMd,
    sm: styles.paddingSm,
  };
  const cardStyles: Style[] = [styles.card];
  if (variant === "bordered") {
    cardStyles.push(styles.cardBordered);
  }
  if (variant === "muted") {
    cardStyles.push(styles.cardMuted);
  }
  cardStyles.push(paddingMap[padding]);
  if (style) {
    cardStyles.push(style);
  }
  return { card: cardStyles, styles };
};

/** Bordered content card with optional title and padding presets. */
@Component({
  imports: [FormeText, FormeView],
  selector: "pdf-card",
  template: `
    <forme-view [wrap]="wrap()" [style]="layout().card">
      @if (title()) {
        <forme-text [style]="layout().styles.title">{{ title() }}</forme-text>
      }
      <forme-text ifString [style]="layout().styles.body"
        ><ng-content
      /></forme-text>
    </forme-view>
  `,
})
export class PdfCard {
  readonly title = input<string>();
  readonly variant = input<CardVariant>("default");
  readonly padding = input<NonNullable<PdfCardProps["padding"]>>("md");
  readonly wrap = input(false, { transform: booleanAttribute });
  readonly style = input<PdfCardProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    cardStyle(this.theme(), {
      padding: this.padding(),
      style: this.style(),
      variant: this.variant(),
    })
  );
}
