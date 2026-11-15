import { booleanAttribute, Component, computed, input } from "@angular/core";

import {
  mergePdfStyles,
  injectPdfcnTheme,
} from "@/registry/bases/forme/components/theme-provider";
import {
  FormeSvg,
  FormeText,
  FormeView,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type AlertVariant = "info" | "success" | "warning" | "error";

/**
 * Alert box with severity variants for info, success, warning, and error states.
 * Props - `variant` | `title` | `children` | `showIcon` | `showBorder` | `style`
 * @see {@link PdfAlertProps}
 */
export interface PdfAlertProps extends Omit<PDFComponentProps, "children"> {
  /**
   * @default 'info'
   */
  variant?: AlertVariant;
  title?: string;
  /**
   * @default true
   */
  showIcon?: boolean;
  /**
   * @default true
   */
  showBorder?: boolean;
}

/** Stroke width for all alert SVG icons (SVG user units). */
const ICON_STROKE_WIDTH = 1.5;

const borderLeft = (color: string) => ({
  borderLeftColor: color,
  borderLeftWidth: 4,
});

const createAlertStyles = (theme: PdfcnTheme) => {
  const { typography, colors, primitives } = theme;

  const variantColors = {
    error: colors.destructive ?? "#EF4444",
    info: colors.info ?? "#3B82F6",
    success: colors.success ?? "#22C55E",
    warning: colors.warning ?? "#F59E0B",
  } satisfies Record<AlertVariant, string>;

  const sheet = StyleSheet.create({
    bg: {
      backgroundColor: colors.muted,
    },
    borderError: borderLeft(variantColors.error),
    borderInfo: borderLeft(variantColors.info),
    borderSuccess: borderLeft(variantColors.success),
    borderWarning: borderLeft(variantColors.warning),
    container: {
      borderRadius: 4,
      flexDirection: "row",
      marginBottom: theme.spacing.componentGap,
      padding: 12,
    },
    contentContainer: { flex: 1 },
    description: {
      color: colors.mutedForeground,
      fontFamily: typography.body.fontFamily,
      fontSize: primitives.typography.sm,
      lineHeight: typography.body.lineHeight,
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "flex-start",
      marginRight: 10,
      paddingTop: 2,
      width: 20,
    },
    title: {
      color: colors.foreground,
      fontFamily: typography.heading.fontFamily,
      fontSize: primitives.typography.sm,
      fontWeight: primitives.fontWeights.semibold,
      marginBottom: 4,
    },
  });

  return {
    ...sheet,
    borderMap: {
      error: sheet.borderError,
      info: sheet.borderInfo,
      success: sheet.borderSuccess,
      warning: sheet.borderWarning,
    } as Record<AlertVariant, Style>,
    /** Resolved hex colors for each variant — used to tint the SVG icons. */
    variantColors,
  };
};

/** Container style and icon color of the variant. */
const alertStyles = (
  theme: PdfcnTheme,
  { variant = "info", showBorder = true, style }: PdfAlertProps
) => {
  const styles = createAlertStyles(theme);

  const containerStyles: Style[] = [
    styles.container,
    styles.bg,
    ...(showBorder ? [styles.borderMap[variant]] : []),
    ...(style ? [style].flat() : []),
  ];

  return {
    container: mergePdfStyles(containerStyles),
    iconColor: styles.variantColors[variant],
    styles,
  };
};

/** Alert box with severity variants for info, success, warning, and error states. */
@Component({
  imports: [FormeSvg, FormeText, FormeView],
  selector: "pdf-alert",
  template: `
    @let s = layout().styles;
    @let color = layout().iconColor;
    <forme-view [wrap]="false" [style]="layout().container">
      @if (showIcon()) {
        <forme-view [style]="s.iconContainer">
          <!-- Attributes after the first bound one are bound too, to keep their serialized order. -->
          <forme-svg [width]="16" [height]="16" viewBox="0 0 16 16">
            @switch (variant()) {
              @case ("error") {
                <svg:circle
                  cx="8"
                  cy="8"
                  r="7"
                  fill="none"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                />
                <svg:line
                  x1="5.5"
                  y1="5.5"
                  x2="10.5"
                  y2="10.5"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                  [attr.stroke-linecap]="'round'"
                />
                <svg:line
                  x1="10.5"
                  y1="5.5"
                  x2="5.5"
                  y2="10.5"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                  [attr.stroke-linecap]="'round'"
                />
              }
              @case ("success") {
                <svg:circle
                  cx="8"
                  cy="8"
                  r="7"
                  fill="none"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                />
                <svg:path
                  d="M5 8 L7 10 L11 6"
                  fill="none"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                  [attr.stroke-linecap]="'round'"
                  [attr.stroke-linejoin]="'round'"
                />
              }
              @case ("warning") {
                <svg:path
                  d="M8 1.5 L15 14.5 L1 14.5 Z"
                  fill="none"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                  [attr.stroke-linejoin]="'round'"
                />
                <svg:line
                  x1="8"
                  y1="6"
                  x2="8"
                  y2="10"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                  [attr.stroke-linecap]="'round'"
                />
                <svg:circle cx="8" cy="12.5" r="0.75" [attr.fill]="color" />
              }
              @default {
                <svg:circle
                  cx="8"
                  cy="8"
                  r="7"
                  fill="none"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                />
                <svg:circle cx="8" cy="4.5" r="1" [attr.fill]="color" />
                <svg:line
                  x1="8"
                  y1="7"
                  x2="8"
                  y2="11.5"
                  [attr.stroke]="color"
                  [attr.stroke-width]="strokeWidth"
                  [attr.stroke-linecap]="'round'"
                />
              }
            }
          </forme-svg>
        </forme-view>
      }
      <forme-view [style]="s.contentContainer">
        @if (title()) {
          <forme-text [style]="s.title">{{ title() }}</forme-text>
        }
        <forme-text ifString [style]="s.description"><ng-content /></forme-text>
      </forme-view>
    </forme-view>
  `,
})
export class PdfAlert {
  readonly variant = input<AlertVariant>("info");
  readonly title = input<string>();
  readonly showIcon = input(true, { transform: booleanAttribute });
  readonly showBorder = input(true, { transform: booleanAttribute });
  readonly style = input<PdfAlertProps["style"]>();

  protected readonly strokeWidth = ICON_STROKE_WIDTH;
  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    alertStyles(this.theme(), {
      showBorder: this.showBorder(),
      style: this.style(),
      variant: this.variant(),
    })
  );
}
