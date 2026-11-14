import { Directive, booleanAttribute, input } from "@angular/core";

import { PdfPrimitive } from "@/registry/lib/pdf-renderer";

/** CSS-like style object. Known CSS properties allow dot access. */
export type Style = Partial<Record<keyof CSSStyleDeclaration, unknown>> &
  Record<string, unknown>;

export const StyleSheet = {
  create<T extends Record<string, Style>>(styles: T): T {
    return styles;
  },
};

export type StyleInput = Style | Style[] | false | null | undefined;

/**
 * pdfcn's shared component tokens follow the PDF convention of using points.
 * Takumi follows browser CSS instead, where numeric lengths are pixels at
 * 96 DPI. Converting at the primitive boundary keeps the public component API
 * and the generated document's physical measurements aligned with Forme.
 */
export const PDF_POINT_TO_CSS_PIXEL = 96 / 72;

export const pointToCssPixel = (value: number): number =>
  value * PDF_POINT_TO_CSS_PIXEL;

const POINT_LENGTH_PROPERTIES = new Set([
  "blockSize",
  "borderBlockEndWidth",
  "borderBlockStartWidth",
  "borderBlockWidth",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderBottomWidth",
  "borderEndEndRadius",
  "borderEndStartRadius",
  "borderInlineEndWidth",
  "borderInlineStartWidth",
  "borderInlineWidth",
  "borderLeftWidth",
  "borderRadius",
  "borderRightWidth",
  "borderStartEndRadius",
  "borderStartStartRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderTopWidth",
  "borderWidth",
  "bottom",
  "columnGap",
  "flexBasis",
  "fontSize",
  "gap",
  "height",
  "inlineSize",
  "inset",
  "insetBlock",
  "insetBlockEnd",
  "insetBlockStart",
  "insetInline",
  "insetInlineEnd",
  "insetInlineStart",
  "left",
  "letterSpacing",
  "margin",
  "marginBlock",
  "marginBlockEnd",
  "marginBlockStart",
  "marginBottom",
  "marginInline",
  "marginInlineEnd",
  "marginInlineStart",
  "marginLeft",
  "marginRight",
  "marginTop",
  "maxBlockSize",
  "maxHeight",
  "maxInlineSize",
  "maxWidth",
  "minBlockSize",
  "minHeight",
  "minInlineSize",
  "minWidth",
  "outlineOffset",
  "outlineWidth",
  "padding",
  "paddingBlock",
  "paddingBlockEnd",
  "paddingBlockStart",
  "paddingBottom",
  "paddingInline",
  "paddingInlineEnd",
  "paddingInlineStart",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "right",
  "rowGap",
  "textDecorationThickness",
  "textIndent",
  "top",
  "width",
]);

export const normalizeTakumiStyle = (style: Style): Style => {
  const {
    marginHorizontal,
    marginVertical,
    paddingHorizontal,
    paddingVertical,
    ...normalized
  } = style;

  if (marginHorizontal !== undefined) {
    normalized.marginLeft ??= marginHorizontal;
    normalized.marginRight ??= marginHorizontal;
  }
  if (marginVertical !== undefined) {
    normalized.marginBottom ??= marginVertical;
    normalized.marginTop ??= marginVertical;
  }
  if (paddingHorizontal !== undefined) {
    normalized.paddingLeft ??= paddingHorizontal;
    normalized.paddingRight ??= paddingHorizontal;
  }
  if (paddingVertical !== undefined) {
    normalized.paddingBottom ??= paddingVertical;
    normalized.paddingTop ??= paddingVertical;
  }

  const borderSides = ["Top", "Right", "Bottom", "Left"] as const;
  if (normalized.borderWidth !== undefined) {
    normalized.borderStyle ??= "solid";
  }
  for (const side of borderSides) {
    if (normalized[`border${side}Width`] !== undefined) {
      normalized[`border${side}Style`] ??= "solid";
    }
  }

  return Object.fromEntries(
    Object.entries(normalized).map(([property, value]) => [
      property,
      typeof value === "number" && POINT_LENGTH_PROPERTIES.has(property)
        ? pointToCssPixel(value)
        : value,
    ])
  );
};

export const flatten = (
  style?: StyleInput
): Record<string, unknown> | undefined => {
  if (!style) {
    return undefined;
  }
  if (Array.isArray(style)) {
    return normalizeTakumiStyle(Object.assign({}, ...style.filter(Boolean)));
  }
  return normalizeTakumiStyle(style);
};

/** The element a primitive stands for, as Takumi's JSX reader would see it. */
export interface TakumiHost {
  tag: string;
  props: {
    className?: string;
    height?: unknown;
    src?: unknown;
    style?: unknown;
    width?: unknown;
  } & Record<string, unknown>;
}

export abstract class TakumiPrimitive extends PdfPrimitive {
  abstract host(): TakumiHost;
}

@Directive({ selector: "takumi-view" })
export class TakumiView extends TakumiPrimitive {
  readonly style = input<StyleInput>();
  readonly className = input<string>();
  readonly wrap = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) =>
      value === undefined ? undefined : booleanAttribute(value),
  });
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly break = input(false, { transform: booleanAttribute });

  host(): TakumiHost {
    const merged = {
      display: "flex",
      flexDirection: "column",
      ...flatten(this.style()),
    };
    if (this.break()) {
      Object.assign(merged, { breakBefore: "page" });
    }
    if (this.wrap() === false) {
      Object.assign(merged, { breakInside: "avoid" });
    }
    if (this.fixed()) {
      Object.assign(merged, { position: "fixed" });
    }
    return {
      props: { className: this.className(), style: merged },
      tag: "div",
    };
  }
}

@Directive({ selector: "takumi-text" })
export class TakumiText extends TakumiPrimitive {
  readonly style = input<StyleInput>();
  readonly className = input<string>();
  readonly href = input<string>();
  readonly src = input<string>();

  host(): TakumiHost {
    const merged = flatten(this.style());
    const link = this.href() ?? this.src();
    if (link) {
      return {
        props: { className: this.className(), href: link, style: merged },
        tag: "a",
      };
    }
    return {
      props: { className: this.className(), style: merged },
      tag: "span",
    };
  }
}

@Directive({ selector: "takumi-image" })
export class TakumiImage extends TakumiPrimitive {
  readonly src = input.required<string | { uri: string }>();
  readonly style = input<StyleInput>();

  host(): TakumiHost {
    const src = this.src();
    const resolved = typeof src === "string" ? src : src.uri;
    return {
      props: { alt: "", src: resolved, style: flatten(this.style()) },
      tag: "img",
    };
  }
}

@Directive({ selector: "takumi-link" })
export class TakumiLink extends TakumiPrimitive {
  readonly src = input.required<string>();
  readonly style = input<StyleInput>();

  host(): TakumiHost {
    return {
      props: { href: this.src(), style: flatten(this.style()) },
      tag: "a",
    };
  }
}

@Directive({ selector: "takumi-document" })
export class TakumiDocument extends TakumiPrimitive {
  readonly title = input<string>();
  readonly style = input<StyleInput>();

  host(): TakumiHost {
    return {
      props: {
        "data-pdf-document": this.title(),
        style: {
          display: "flex",
          flexDirection: "column",
          ...flatten(this.style()),
        },
      },
      tag: "div",
    };
  }
}

@Directive({ selector: "takumi-page" })
export class TakumiPage extends TakumiPrimitive {
  readonly size = input<string | { width: number; height: number }>();
  readonly style = input<StyleInput>();

  host(): TakumiHost {
    return {
      props: {
        "data-pdf-page": true,
        style: {
          display: "flex",
          flexDirection: "column",
          ...flatten(this.style()),
        },
      },
      tag: "div",
    };
  }
}

/** Takumi's page counters, which the engine fills in per page. */
@Directive({ selector: "takumi-counter" })
export class TakumiCounter extends TakumiPrimitive {
  readonly counter = input.required<"pageNumber" | "totalPages">();
  readonly format = input<string>();
  readonly className = input<string>();
  readonly style = input<Style>();

  host(): TakumiHost {
    return {
      props: {
        className: [this.counter(), this.format(), this.className()]
          .filter(Boolean)
          .join(" "),
        style: this.style(),
      },
      tag: "span",
    };
  }
}

/**
 * SVG graphic. Its children are plain `<svg:…>` elements; their attributes
 * are written into the markup in template order.
 */
@Directive({ selector: "takumi-svg" })
export class TakumiSvg extends TakumiPrimitive {
  readonly width = input<number | string>();
  readonly height = input<number | string>();
  readonly viewBox = input<string>();
  readonly style = input<Style>();

  host(): TakumiHost {
    const style = this.style();
    const height = this.height();
    const width = this.width();
    const numericHeight = typeof height === "number" ? height : undefined;
    const numericWidth = typeof width === "number" ? width : undefined;
    return {
      props: {
        height:
          numericHeight === undefined ? height : pointToCssPixel(numericHeight),
        style: style ? normalizeTakumiStyle(style) : undefined,
        viewBox:
          this.viewBox() ??
          (numericWidth !== undefined && numericHeight !== undefined
            ? `0 0 ${numericWidth} ${numericHeight}`
            : undefined),
        width:
          numericWidth === undefined ? width : pointToCssPixel(numericWidth),
      },
      tag: "svg",
    };
  }
}

export const TAKUMI_PRIMITIVES = [
  TakumiDocument,
  TakumiPage,
  TakumiView,
  TakumiText,
  TakumiImage,
  TakumiLink,
  TakumiCounter,
  TakumiSvg,
] as const;
