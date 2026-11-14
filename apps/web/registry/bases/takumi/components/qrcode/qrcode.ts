import { Component, computed, input } from "@angular/core";
import QRCode from "qrcode";

import { injectPdfcnTheme } from "@/registry/bases/takumi/components/theme-provider";
import {
  StyleSheet,
  TakumiSvg,
  TakumiText,
  TakumiView,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { Style } from "@/registry/bases/takumi/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/takumi/lib/resolve-color";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type QRCodeErrorLevel = "L" | "M" | "Q" | "H";

/**
 * QR code rendered as an SVG grid for use in PDF documents.
 * Props - `value` | `size` | `color` | `backgroundColor` | `errorLevel` | `margin` | `caption` | `style`
 * @see {@link PdfQRCodeProps}
 */
export interface PdfQRCodeProps extends Omit<PDFComponentProps, "children"> {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  errorLevel?: QRCodeErrorLevel;
  margin?: number;
  caption?: string;
  children?: never;
}

const createQRCodeStyles = (t: PdfcnTheme) => {
  const { spacing } = t.primitives;
  return StyleSheet.create({
    caption: {
      color: t.colors.mutedForeground,
      fontFamily: t.typography.body.fontFamily,
      fontSize: t.primitives.typography.xs,
      marginTop: spacing[1],
      textAlign: "center",
    },
    container: { alignItems: "center" },
  });
};

const generateQRMatrix = (
  value: string,
  errorLevel: QRCodeErrorLevel,
  margin: number
): boolean[][] => {
  const qr = QRCode.create(value, { errorCorrectionLevel: errorLevel });
  const { size, data } = qr.modules;
  const totalSize = size + margin * 2;
  const matrix: boolean[][] = [];
  for (let row = 0; row < totalSize; row += 1) {
    const rowData: boolean[] = [];
    for (let col = 0; col < totalSize; col += 1) {
      const isInMargin =
        row < margin ||
        row >= size + margin ||
        col < margin ||
        col >= size + margin;
      if (isInMargin) {
        rowData.push(false);
      } else {
        rowData.push(data[(row - margin) * size + (col - margin)] === 1);
      }
    }
    matrix.push(rowData);
  }
  return matrix;
};

const qrCodeLayout = (
  theme: PdfcnTheme,
  {
    value,
    size = 100,
    color = "#000000",
    backgroundColor = "#ffffff",
    errorLevel = "M",
    margin = 2,
    style,
  }: Omit<PdfQRCodeProps, "caption">
) => {
  const styles = createQRCodeStyles(theme);
  const matrix = generateQRMatrix(value, errorLevel, margin);
  const moduleSize = size / matrix.length;
  const resolvedColor = resolveColor(color, theme.colors);
  const resolvedBgColor =
    backgroundColor === "transparent"
      ? undefined
      : resolveColor(backgroundColor, theme.colors);
  const containerStyles: Style[] = [styles.container];
  if (style) {
    containerStyles.push(...[style].flat());
  }

  return {
    caption: styles.caption,
    container: containerStyles,
    moduleSize,
    modules: matrix
      .flatMap((row, y) =>
        row
          .map((isDark, x) => (isDark ? { x, y } : null))
          .filter((pos): pos is { x: number; y: number } => pos !== null)
      )
      .map((pos) => ({ x: pos.x * moduleSize, y: pos.y * moduleSize })),
    resolvedBgColor,
    resolvedColor,
    viewBox: `0 0 ${size} ${size}`,
  };
};

@Component({
  imports: [TakumiSvg, TakumiText, TakumiView],
  selector: "pdf-qrcode",
  template: `
    @let l = layout();
    <takumi-view [style]="l.container">
      <takumi-svg [width]="size()" [height]="size()" [viewBox]="l.viewBox">
        @if (l.resolvedBgColor !== undefined) {
          <svg:rect
            x="0"
            y="0"
            [attr.width]="size()"
            [attr.height]="size()"
            [attr.fill]="l.resolvedBgColor"
          />
        }
        @for (pos of l.modules; track $index) {
          <svg:rect
            [attr.x]="pos.x"
            [attr.y]="pos.y"
            [attr.width]="l.moduleSize"
            [attr.height]="l.moduleSize"
            [attr.fill]="l.resolvedColor"
          />
        }
      </takumi-svg>
      @if (caption()) {
        <takumi-text [style]="l.caption">{{ caption() }}</takumi-text>
      }
    </takumi-view>
  `,
})
export class PdfQRCode {
  readonly value = input.required<string>();
  readonly size = input(100);
  readonly color = input("#000000");
  readonly backgroundColor = input("#ffffff");
  readonly errorLevel = input<QRCodeErrorLevel>("M");
  readonly margin = input(2);
  readonly caption = input<string>();
  readonly style = input<PdfQRCodeProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    qrCodeLayout(this.theme(), {
      backgroundColor: this.backgroundColor(),
      color: this.color(),
      errorLevel: this.errorLevel(),
      margin: this.margin(),
      size: this.size(),
      style: this.style(),
      value: this.value(),
    })
  );
}
