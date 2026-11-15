import type { Type } from "@angular/core";
import { container, image, text } from "@takumi-rs/helpers";
import type { Node } from "@takumi-rs/helpers";

import {
  TakumiPrimitive,
  TakumiText,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { TakumiHost } from "@/registry/bases/takumi/lib/pdf-primitives";
import {
  PdfElement,
  PdfTextNode,
  contentOf,
  renderTree,
} from "@/registry/lib/pdf-renderer";
import type { PdfNode, RenderOptions } from "@/registry/lib/pdf-renderer";

/** Takumi's default style for each tag this registry emits. */
const PRESETS: Record<string, Record<string, unknown>> = {
  div: { display: "block" },
};

const RESERVED = new Set([
  "children",
  "className",
  "class",
  "id",
  "style",
  "tw",
]);

const SVG_KEBAB = new Set([
  "clipPath",
  "clipRule",
  "fillOpacity",
  "fillRule",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "stopColor",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
  "textAnchor",
]);

const kebab = (name: string) =>
  name.replaceAll(/([A-Z])/g, "-$1").toLowerCase();

const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/** Primitive props become string attributes, as Takumi's element reader does. */
const attributesOf = (props: Record<string, unknown>) => {
  let attributes: Record<string, string> | undefined;
  for (const [name, value] of Object.entries(props)) {
    if (
      RESERVED.has(name) ||
      value === null ||
      value === undefined ||
      value === false ||
      typeof value === "object" ||
      typeof value === "function"
    ) {
      continue;
    }
    attributes ??= {};
    attributes[name] = value === true ? "" : String(value);
  }
  return attributes;
};

const describe = ({ tag, props }: TakumiHost) => {
  const style =
    props.style &&
    typeof props.style === "object" &&
    Object.keys(props.style).length > 0
      ? (props.style as Record<string, unknown>)
      : undefined;
  return {
    attributes: attributesOf(props),
    className: props.className as string | undefined,
    preset: PRESETS[tag],
    style,
    tagName: tag,
  };
};

const svgAttribute = (name: string, value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }
  if (name === "style" && typeof value === "object") {
    const css = Object.entries(value)
      .map(([key, entry]) => `${kebab(key)}:${String(entry).trim()}`)
      .join(";");
    return css ? ` style="${escape(css)}"` : "";
  }
  let attribute = SVG_KEBAB.has(name) ? kebab(name) : name;
  if (name === "className") {
    attribute = "class";
  }
  return ` ${attribute}="${escape(String(value))}"`;
};

const svgChild = (node: PdfNode): string => {
  if (node instanceof PdfTextNode) {
    return node.value;
  }
  if (!(node instanceof PdfElement)) {
    return "";
  }
  const attributes = Object.entries(node.attributes)
    .map(([name, value]) => svgAttribute(name, value))
    .join("");
  return `<${node.name}${attributes}>${node.children.map(svgChild).join("")}</${node.name}>`;
};

const svgMarkup = (props: Record<string, unknown>, element: PdfElement) => {
  const attributes = Object.entries(props)
    .map(([name, value]) => svgAttribute(name, value))
    .join("");
  const xmlns = "xmlns" in props ? "" : ` xmlns="http://www.w3.org/2000/svg"`;
  return `<svg${attributes}${xmlns}>${element.children.map(svgChild).join("")}</svg>`;
};

const toNumber = (value: unknown) =>
  value === undefined ? undefined : Number(value);

const serializeChildren = (element: PdfElement): Node[] =>
  contentOf(element).flatMap((child) =>
    child instanceof PdfTextNode
      ? [text({ text: child.value })]
      : // oxlint-disable-next-line no-use-before-define -- mutual recursion
        serializeElement(child)
  );

const serializeElement = (element: PdfElement): Node[] => {
  const { primitive } = element;
  if (!(primitive instanceof TakumiPrimitive)) {
    return [];
  }
  const content = contentOf(element);
  const textOnly =
    content.length > 0 &&
    content.every((child) => child instanceof PdfTextNode);
  if (primitive instanceof TakumiText && primitive.ifString() && !textOnly) {
    return serializeChildren(element);
  }
  const host = primitive.host();
  const description = describe(host);

  if (host.tag === "img") {
    return [
      image({
        height: toNumber(host.props.height),
        src: host.props.src as string,
        width: toNumber(host.props.width),
        ...description,
      }),
    ];
  }
  if (host.tag === "svg") {
    return [
      image({
        height: toNumber(host.props.height),
        src: svgMarkup(host.props, element),
        width: toNumber(host.props.width),
        ...description,
      }),
    ];
  }

  if (textOnly) {
    return [
      text({
        text: content.map((child) => child.value).join(""),
        ...description,
      }),
    ];
  }
  return [container({ children: serializeChildren(element), ...description })];
};

const serializeRoot = (root: PdfElement) => {
  const nodes = serializeChildren(root);
  if (nodes.length !== 1) {
    throw new Error("The component must render exactly one root element.");
  }
  return { node: nodes[0], stylesheets: [] as string[] };
};

/** Renders an Angular component built from Takumi primitives to a Takumi node. */
export const renderTakumiDocument = <T>(
  component: Type<T>,
  options: RenderOptions<T> = {}
) => renderTree(component, options, serializeRoot);
