import { booleanAttribute, Directive, input } from "@angular/core";
import type { Edges, Style } from "@formepdf/shared";

import { PdfPrimitive } from "@/registry/lib/pdf-renderer";

export type { Style };

export type FormeStyleInput =
  | Style
  | false
  | null
  | undefined
  | readonly FormeStyleInput[];

export const StyleSheet = {
  create: <T extends Record<string, Style>>(styles: T): T => styles,
};

/** Flattens nested style arrays, later entries winning. */
export const mergeFormeStyles = (value: FormeStyleInput): Style => {
  if (!value) {
    return {};
  }
  if (!Array.isArray(value)) {
    return value as Style;
  }
  const merged: Style = {};
  for (const entry of value) {
    Object.assign(merged, mergeFormeStyles(entry));
  }
  return merged;
};

@Directive({ selector: "forme-document" })
export class FormeDocument extends PdfPrimitive {
  readonly title = input<string>();
}

export type FormePageSize = string | { width: number; height: number };

@Directive({ selector: "forme-page" })
export class FormePage extends PdfPrimitive {
  readonly size = input<FormePageSize>();
  readonly margin = input<number | Edges>();
  readonly style = input<FormeStyleInput>();
}

@Directive({ selector: "forme-view" })
export class FormeView extends PdfPrimitive {
  readonly style = input<FormeStyleInput>();
  readonly wrap = input<boolean>();
}

/**
 * Text node. With `ifString`, it only wraps plain text content and
 * passes element content through unchanged.
 */
@Directive({ selector: "forme-text" })
export class FormeText extends PdfPrimitive {
  readonly style = input<FormeStyleInput>();
  readonly ifString = input(false, { transform: booleanAttribute });
}

@Directive({ selector: "forme-fixed" })
export class FormeFixed extends PdfPrimitive {
  readonly position = input.required<"header" | "footer">();
  readonly style = input<FormeStyleInput>();
}

export type FormeImageSrc =
  | string
  | {
      uri: string;
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    };

@Directive({ selector: "forme-image" })
export class FormeImage extends PdfPrimitive {
  readonly src = input.required<FormeImageSrc>();
  readonly width = input<number>();
  readonly height = input<number>();
  readonly style = input<FormeStyleInput>();
}

/** SVG graphic. Its children are plain `<svg:…>` elements. */
@Directive({ selector: "forme-svg" })
export class FormeSvg extends PdfPrimitive {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly viewBox = input<string>();
  readonly style = input<FormeStyleInput>();
}

@Directive({ selector: "forme-watermark" })
export class FormeWatermark extends PdfPrimitive {
  readonly text = input.required<string>();
  readonly fontSize = input(60);
  readonly angle = input(-45);
  readonly color = input("rgba(0,0,0,0.1)");
  readonly style = input<FormeStyleInput>();
}

@Directive({ selector: "forme-page-break" })
export class FormePageBreak extends PdfPrimitive {}

export const FORME_PRIMITIVES = [
  FormeDocument,
  FormePage,
  FormeView,
  FormeText,
  FormeFixed,
  FormeImage,
  FormeSvg,
  FormeWatermark,
  FormePageBreak,
] as const;
