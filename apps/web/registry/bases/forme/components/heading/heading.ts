import { booleanAttribute, Component, computed, input } from "@angular/core";

import {
  injectPdfcnTheme,
  mergePdfStyles,
} from "@/registry/bases/forme/components/theme-provider";
import {
  FormeText,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/forme/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type HeadingWeight = "normal" | "medium" | "semibold" | "bold";
export type HeadingTracking = "tighter" | "tight" | "normal" | "wide" | "wider";

/**
 * PDF heading mapped to h1–h6 font sizes from the theme.
 * Props - `level` | `align` | `color` | `transform` | `weight` | `tracking` | `noMargin` | `keepWithNext` | `children` | `style`
 * @see {@link HeadingProps}
 */
export interface HeadingProps extends PDFComponentProps {
  /**
   * @default 1
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * @default 'left'
   */
  align?: "left" | "center" | "right";
  color?: string;
  transform?: "uppercase" | "lowercase" | "capitalize";
  /**
   * @default 'bold'
   */
  weight?: HeadingWeight;
  /**
   * @default 'normal'
   */
  tracking?: HeadingTracking;
  /**
   * @default false
   */
  noMargin?: boolean;
  keepWithNext?: boolean;
}

const createHeadingStyles = (t: PdfcnTheme) => {
  const { heading } = t.typography;
  const { spacing, fontWeights, letterSpacing } = t.primitives;
  const { sectionGap, componentGap, paragraphGap } = t.spacing;
  const base = {
    color: t.colors.foreground,
    fontFamily: heading.fontFamily,
    fontWeight: fontWeights.bold,
    lineHeight: heading.lineHeight,
  };
  return StyleSheet.create({
    capitalize: { textTransform: "capitalize" },
    h1: {
      ...base,
      fontSize: heading.fontSize.h1,
      marginBottom: paragraphGap,
      marginTop: spacing[0],
    },
    h2: {
      ...base,
      fontSize: heading.fontSize.h2,
      marginBottom: paragraphGap,
      marginTop: sectionGap,
    },
    h3: {
      ...base,
      fontSize: heading.fontSize.h3,
      marginBottom: paragraphGap,
      marginTop: componentGap,
    },
    h4: {
      ...base,
      fontSize: heading.fontSize.h4,
      marginBottom: paragraphGap,
      marginTop: paragraphGap,
    },
    h5: {
      ...base,
      fontSize: heading.fontSize.h5,
      marginBottom: spacing[1],
      marginTop: paragraphGap,
    },
    h6: {
      ...base,
      fontSize: heading.fontSize.h6,
      marginBottom: spacing[1],
      marginTop: paragraphGap,
    },
    lowercase: { textTransform: "lowercase" },
    noMargin: { marginBottom: 0, marginTop: 0 },
    trackingNormal: { letterSpacing: letterSpacing.normal },
    trackingTight: { letterSpacing: letterSpacing.tight * 10 },
    trackingTighter: { letterSpacing: letterSpacing.tight * 15 },
    trackingWide: { letterSpacing: letterSpacing.wide * 10 },
    trackingWider: { letterSpacing: letterSpacing.wider * 10 },
    uppercase: {
      letterSpacing: letterSpacing.wider * 10,
      textTransform: "uppercase",
    },
    weightBold: { fontWeight: fontWeights.bold },
    weightMedium: { fontWeight: fontWeights.medium },
    weightNormal: { fontWeight: fontWeights.regular },
    weightSemibold: { fontWeight: fontWeights.semibold },
  });
};

const headingStyle = (
  theme: PdfcnTheme,
  {
    level = 1,
    align,
    color,
    transform,
    weight,
    tracking,
    noMargin,
    style,
  }: HeadingProps
) => {
  const styles = createHeadingStyles(theme);
  const safeLevel = Math.min(Math.max(Math.round(level), 1), 6) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6;
  const weightMap = {
    bold: styles.weightBold,
    medium: styles.weightMedium,
    normal: styles.weightNormal,
    semibold: styles.weightSemibold,
  };
  const trackingMap = {
    normal: styles.trackingNormal,
    tight: styles.trackingTight,
    tighter: styles.trackingTighter,
    wide: styles.trackingWide,
    wider: styles.trackingWider,
  };
  const transformMap = {
    capitalize: styles.capitalize,
    lowercase: styles.lowercase,
    uppercase: styles.uppercase,
  };
  const styleArray: Style[] = [
    styles[`h${safeLevel}` as keyof typeof styles] as Style,
  ];
  if (weight && weight in weightMap) {
    styleArray.push(weightMap[weight]);
  }
  if (tracking && tracking in trackingMap) {
    styleArray.push(trackingMap[tracking]);
  }
  if (transform && transform in transformMap) {
    styleArray.push(transformMap[transform as keyof typeof transformMap]);
  }
  if (noMargin) {
    styleArray.push(styles.noMargin);
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
  return mergePdfStyles(styleArray);
};

@Component({
  imports: [FormeText],
  selector: "pdf-heading",
  template: `<forme-text [style]="headingStyle()"><ng-content /></forme-text>`,
})
export class PdfHeading {
  readonly level = input<HeadingProps["level"]>(1);
  readonly align = input<HeadingProps["align"]>();
  readonly color = input<string>();
  readonly transform = input<HeadingProps["transform"]>();
  readonly weight = input<HeadingWeight>();
  readonly tracking = input<HeadingTracking>();
  readonly noMargin = input(false, { transform: booleanAttribute });
  /** Part of the props API but unused, as in the original. */
  readonly keepWithNext = input(false, { transform: booleanAttribute });
  readonly style = input<HeadingProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly headingStyle = computed(() =>
    headingStyle(this.theme(), {
      align: this.align(),
      color: this.color(),
      level: this.level(),
      noMargin: this.noMargin(),
      style: this.style(),
      tracking: this.tracking(),
      transform: this.transform(),
      weight: this.weight(),
    })
  );
}
