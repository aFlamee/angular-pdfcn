import { booleanAttribute, Component, computed, input } from "@angular/core";

import {
  injectPdfcnTheme,
  mergePdfStyles,
} from "@/registry/bases/forme/components/theme-provider";
import {
  FormeText,
  FormeView,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import type { PDFComponentProps } from "@/registry/types/pdf-components";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type PageNumberAlign = "left" | "center" | "right";
export type PageNumberSize = "xs" | "sm" | "md";

/**
 * Auto page number rendered with a configurable format string at a or inline position.
 * Props - `format` | `align` | `size` | `fixed` | `muted` | `style`
 * @see {@link PageNumberProps}
 */
export interface PageNumberProps extends Omit<PDFComponentProps, "children"> {
  /**
   * Format string — use `{page}` for current page and `{total}` for total page count.
   * @default 'Page {page} of {total}'
   */
  format?: string;
  /**
   * @default 'center'
   */
  align?: PageNumberAlign;
  /**
   * @default 'sm'
   */
  size?: PageNumberSize;
  /**
   * @default false
   */
  fixed?: boolean;
  /**
   * @default true
   */
  muted?: boolean;
  children?: never;
}

const createPageNumberStyles = (t: PdfcnTheme) => {
  const { typography, colors, primitives } = t;
  return StyleSheet.create({
    alignCenter: { textAlign: "center" },
    alignLeft: { textAlign: "left" },
    alignRight: { textAlign: "right" },
    colorForeground: { color: colors.foreground },
    colorMuted: { color: colors.mutedForeground },
    container: { width: "100%" },
    sizeMd: { fontSize: primitives.typography.base },
    sizeSm: { fontSize: primitives.typography.sm },
    sizeXs: { fontSize: primitives.typography.xs },
    text: { fontFamily: typography.body.fontFamily },
  });
};

const pageNumberLayout = (
  theme: PdfcnTheme,
  {
    format = "Page {page} of {total}",
    align = "center",
    size = "sm",
    muted = true,
    style,
  }: PageNumberProps
) => {
  const styles = createPageNumberStyles(theme);
  const alignMap = {
    center: styles.alignCenter,
    left: styles.alignLeft,
    right: styles.alignRight,
  } as Record<PageNumberAlign, Style>;
  const sizeMap = {
    md: styles.sizeMd,
    sm: styles.sizeSm,
    xs: styles.sizeXs,
  } as Record<PageNumberSize, Style>;
  const textStyles: Style[] = [
    styles.text,
    alignMap[align],
    sizeMap[size],
    muted ? styles.colorMuted : styles.colorForeground,
  ];
  if (style) {
    textStyles.push(...[style].flat());
  }
  return {
    container: styles.container,
    content: format
      .replace("{page}", "{{pageNumber}}")
      .replace("{total}", "{{totalPages}}"),
    text: mergePdfStyles(textStyles),
  };
};

@Component({
  imports: [FormeText, FormeView],
  selector: "pdf-page-number",
  template: `
    @let l = layout();
    <forme-view [style]="l.container"
      ><forme-text [style]="l.text">{{ l.content }}</forme-text></forme-view
    >
  `,
})
export class PdfPageNumber {
  readonly format = input("Page {page} of {total}");
  readonly align = input<PageNumberAlign>("center");
  readonly size = input<PageNumberSize>("sm");
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly muted = input(true, { transform: booleanAttribute });
  readonly style = input<PageNumberProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly layout = computed(() =>
    pageNumberLayout(this.theme(), {
      align: this.align(),
      format: this.format(),
      muted: this.muted(),
      size: this.size(),
      style: this.style(),
    })
  );
}
