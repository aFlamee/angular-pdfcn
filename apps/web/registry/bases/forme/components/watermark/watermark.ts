import { booleanAttribute, Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/forme/components/theme-provider";
import {
  FormeWatermark,
  mergeFormeStyles,
} from "@/registry/bases/forme/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/forme/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type WatermarkPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Diagonal watermark overlaid across the full page using absolute positioning.
 * Props - `text` | `opacity` | `fontSize` | `color` | `angle` | `position` | `fixed` | `style`
 * @see {@link PdfWatermarkProps}
 */
export interface PdfWatermarkProps extends Omit<PDFComponentProps, "children"> {
  text: string;
  opacity?: number;
  fontSize?: number;
  color?: string;
  angle?: number;
  position?: WatermarkPosition;
  /**
   * @default true
   */
  fixed?: boolean;
  children?: never;
}

const withOpacity = (color: string, opacity: number): string => {
  const match = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) {
    return color;
  }

  const [, red, green, blue] = match;
  return `rgba(${Number.parseInt(red, 16)}, ${Number.parseInt(green, 16)}, ${Number.parseInt(blue, 16)}, ${opacity})`;
};

const watermarkLayout = (
  theme: PdfcnTheme,
  {
    opacity = 0.15,
    color = "mutedForeground",
    style,
  }: Pick<PdfWatermarkProps, "opacity" | "color" | "style">
) => {
  const resolvedColor = resolveColor(color, theme.colors);

  return {
    color: withOpacity(resolvedColor, opacity),
    style: mergeFormeStyles(style),
  };
};

/** Diagonal watermark overlaid across the full page using absolute positioning. */
@Component({
  imports: [FormeWatermark],
  selector: "pdf-watermark",
  template: `
    <forme-watermark
      [text]="text()"
      [angle]="angle()"
      [color]="layout().color"
      [fontSize]="fontSize()"
      [style]="layout().style"
    />
  `,
})
export class PdfWatermark {
  readonly text = input.required<string>();
  readonly opacity = input(0.15);
  readonly fontSize = input(60);
  readonly color = input("mutedForeground");
  readonly angle = input(-45);
  /** Part of the props API but unused, as in the original. */
  readonly position = input<PdfWatermarkProps["position"]>();
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly style = input<PdfWatermarkProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    watermarkLayout(this.theme(), {
      color: this.color(),
      opacity: this.opacity(),
      style: this.style(),
    })
  );
}
