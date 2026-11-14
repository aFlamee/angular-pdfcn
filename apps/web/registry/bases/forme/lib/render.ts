import type { Type } from "@angular/core";
import { expandEdges, mapStyle, parseColor } from "@formepdf/shared";
import type {
  FormeDocument as FormeDocumentJson,
  FormeNode,
} from "@formepdf/shared";

import {
  FormeDocument,
  FormeFixed,
  FormeImage,
  FormePage,
  FormePageBreak,
  FormeSvg,
  FormeText,
  FormeView,
  FormeWatermark,
  mergeFormeStyles,
} from "@/registry/bases/forme/lib/pdf-primitives";
import {
  PdfElement,
  PdfTextNode,
  contentOf,
  renderTree,
  textOf,
} from "@/registry/lib/pdf-renderer";
import type { PdfNode, RenderOptions } from "@/registry/lib/pdf-renderer";

const DEFAULT_MARGIN = { bottom: 54, left: 54, right: 54, top: 54 };

const node = (
  kind: FormeNode["kind"],
  style: FormeNode["style"] = {},
  children: FormeNode[] = []
): FormeNode => ({ children, kind, style });

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const svgMarkup = (child: PdfNode): string => {
  if (child instanceof PdfTextNode) {
    return escapeXml(child.value);
  }
  if (!(child instanceof PdfElement)) {
    return "";
  }
  const attributes = Object.entries(child.attributes)
    .map(
      ([name, value]) =>
        ` ${name}="${escapeXml(value).replaceAll('"', "&quot;")}"`
    )
    .join("");
  const inner = child.children.map(svgMarkup).join("");
  return inner
    ? `<${child.name}${attributes}>${inner}</${child.name}>`
    : `<${child.name}${attributes}/>`;
};

const serializeChildren = (element: PdfElement): FormeNode[] =>
  contentOf(element).flatMap((child) =>
    child instanceof PdfTextNode
      ? [node({ content: child.value, type: "Text" })]
      : // oxlint-disable-next-line no-use-before-define -- mutual recursion
        serializeElement(child)
  );

const serializePage = (element: PdfElement, page: FormePage): FormeNode => {
  const size = page.size() ?? "A4";
  const margin = page.margin();
  return node(
    {
      config: {
        margin: margin === undefined ? DEFAULT_MARGIN : expandEdges(margin),
        size:
          typeof size === "string"
            ? size
            : { Custom: { height: size.height, width: size.width } },
        wrap: true,
      },
      type: "Page",
    } as FormeNode["kind"],
    mapStyle(mergeFormeStyles(page.style())),
    serializeChildren(element)
  );
};

const serializeElement = (element: PdfElement): FormeNode[] => {
  const { primitive } = element;

  if (primitive instanceof FormeView) {
    const style = mapStyle(mergeFormeStyles(primitive.style()));
    const wrap = primitive.wrap();
    if (wrap !== undefined) {
      style.wrap = wrap;
    }
    return [node({ type: "View" }, style, serializeChildren(element))];
  }
  if (primitive instanceof FormeText) {
    const content = contentOf(element);
    if (
      primitive.ifString() &&
      (content.length === 0 ||
        content.some((child) => child instanceof PdfElement))
    ) {
      return serializeChildren(element);
    }
    return [
      node(
        { content: textOf(element), type: "Text" },
        mapStyle(mergeFormeStyles(primitive.style()))
      ),
    ];
  }
  if (primitive instanceof FormeFixed) {
    return [
      node(
        {
          position: primitive.position() === "header" ? "Header" : "Footer",
          type: "Fixed",
        },
        mapStyle(mergeFormeStyles(primitive.style())),
        serializeChildren(element)
      ),
    ];
  }
  if (primitive instanceof FormeImage) {
    return [
      node(
        { src: primitive.src() as string, type: "Image" },
        mapStyle(mergeFormeStyles(primitive.style()))
      ),
    ];
  }
  if (primitive instanceof FormeSvg) {
    const viewBox = primitive.viewBox();
    return [
      node(
        {
          content: element.children.map(svgMarkup).join(""),
          height: primitive.height(),
          type: "Svg",
          width: primitive.width(),
          ...(viewBox ? { view_box: viewBox } : {}),
        },
        mapStyle(mergeFormeStyles(primitive.style()))
      ),
    ];
  }
  if (primitive instanceof FormeWatermark) {
    const color = parseColor(primitive.color());
    const style = mapStyle(mergeFormeStyles(primitive.style()));
    style.color = { a: 1, b: color.b, g: color.g, r: color.r };
    style.opacity = color.a * (style.opacity ?? 1);
    style.fontSize = primitive.fontSize();
    return [
      node(
        {
          angle: primitive.angle(),
          font_size: primitive.fontSize(),
          text: primitive.text(),
          type: "Watermark",
        },
        style
      ),
    ];
  }
  if (primitive instanceof FormePageBreak) {
    return [node({ type: "PageBreak" })];
  }
  if (primitive instanceof FormePage) {
    return [serializePage(element, primitive)];
  }
  return [];
};

const serializeDocument = (root: PdfElement): FormeDocumentJson => {
  const [element] = contentOf(root);
  if (
    !(element instanceof PdfElement) ||
    !(element.primitive instanceof FormeDocument)
  ) {
    throw new Error("The component must render <forme-document> at its root.");
  }

  const pages: FormeNode[] = [];
  const loose: FormeNode[] = [];
  for (const child of contentOf(element)) {
    if (child instanceof PdfElement && child.primitive instanceof FormePage) {
      pages.push(serializePage(child, child.primitive));
    } else {
      loose.push(
        ...(child instanceof PdfTextNode
          ? [node({ content: child.value, type: "Text" })]
          : serializeElement(child))
      );
    }
  }
  pages.at(-1)?.children.push(...loose);

  const title = element.primitive.title();
  return {
    children: pages.length > 0 ? pages : loose,
    defaultPage: { margin: DEFAULT_MARGIN, size: "A4", wrap: true },
    metadata: title === undefined ? {} : { title },
  } as FormeDocumentJson;
};

/** Renders an Angular component that uses `<forme-document>` to a Forme document. */
export const renderFormeDocument = <T>(
  component: Type<T>,
  options: RenderOptions<T> = {}
): FormeDocumentJson => renderTree(component, options, serializeDocument);
