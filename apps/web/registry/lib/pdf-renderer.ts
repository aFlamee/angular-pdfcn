import {
  DOCUMENT,
  ElementRef,
  RendererFactory2,
  createComponent,
  createEnvironmentInjector,
  inject,
  platformCore,
} from "@angular/core";
import type {
  EnvironmentInjector,
  Provider,
  Renderer2,
  Type,
} from "@angular/core";

/** An element in the tree an Angular component renders into. */
export class PdfElement {
  readonly name: string;
  readonly namespace: string | null;
  parent: PdfElement | null = null;
  readonly children: PdfNode[] = [];
  readonly attributes: Record<string, string> = {};
  /** The primitive directive on this element. Elements without one are transparent. */
  primitive: PdfPrimitive | null = null;

  constructor(name: string, namespace: string | null) {
    this.name = name;
    this.namespace = namespace;
  }
}

export class PdfTextNode {
  parent: PdfElement | null = null;

  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

/** Angular's anchor for control flow and projection. Serializers skip it. */
export class PdfComment {
  parent: PdfElement | null = null;
}

export type PdfNode = PdfElement | PdfTextNode | PdfComment;

/** Base class for the directives that map to engine nodes. */
export abstract class PdfPrimitive {
  readonly element: PdfElement =
    inject<ElementRef<PdfElement>>(ElementRef).nativeElement;

  constructor() {
    this.element.primitive = this;
  }
}

const detach = (node: PdfNode) => {
  if (node.parent) {
    node.parent.children.splice(node.parent.children.indexOf(node), 1);
    node.parent = null;
  }
};

// oxlint-disable-next-line no-empty-function -- Renderer2 hooks the PDF tree ignores
const noop = () => {};

const renderer: Renderer2 = {
  addClass: noop,
  appendChild(parent: PdfElement, child: PdfNode) {
    detach(child);
    child.parent = parent;
    parent.children.push(child);
  },
  createComment: () => new PdfComment(),
  createElement: (name: string, namespace?: string | null) =>
    new PdfElement(name, namespace ?? null),
  createText: (value: string) => new PdfTextNode(value),
  data: {},
  destroy: noop,
  destroyNode: null,
  insertBefore(parent: PdfElement, child: PdfNode, ref: PdfNode | null) {
    detach(child);
    child.parent = parent;
    const index = ref ? parent.children.indexOf(ref) : -1;
    parent.children.splice(
      index === -1 ? parent.children.length : index,
      0,
      child
    );
  },
  listen: () => noop,
  nextSibling(node: PdfNode) {
    const siblings = node.parent?.children;
    return siblings?.[siblings.indexOf(node) + 1] ?? null;
  },
  parentNode: (node: PdfNode) => node.parent,
  removeAttribute(element: PdfElement, name: string) {
    Reflect.deleteProperty(element.attributes, name);
  },
  removeChild(_parent: PdfElement | null, child: PdfNode) {
    detach(child);
  },
  removeClass: noop,
  removeStyle: noop,
  selectRootElement: (node: PdfElement) => node,
  setAttribute(element: PdfElement, name: string, value: string) {
    element.attributes[name] = value;
  },
  setProperty: noop,
  setStyle: noop,
  setValue(node: PdfTextNode, value: string) {
    node.value = value;
  },
};

const rendererFactory: RendererFactory2 = {
  createRenderer: () => renderer,
};

export interface RenderOptions<T> {
  /** Values for the component's inputs. */
  inputs?: Partial<Record<keyof T & string, unknown>>;
  providers?: Provider[];
}

/** Renders a component once and reads its element tree before tearing it down. */
export const renderTree = <T, R>(
  component: Type<T>,
  { inputs = {}, providers = [] }: RenderOptions<T>,
  read: (root: PdfElement) => R
): R => {
  const environmentInjector = createEnvironmentInjector(
    [
      { provide: RendererFactory2, useValue: rendererFactory },
      // Angular looks up a style host on creation. PDF components have no styles.
      { provide: DOCUMENT, useValue: { head: null } },
      ...providers,
    ],
    platformCore().injector as EnvironmentInjector
  );
  const ref = createComponent(component, { environmentInjector });
  try {
    for (const [name, value] of Object.entries(inputs)) {
      ref.setInput(name, value);
    }
    ref.changeDetectorRef.detectChanges();
    return read(ref.location.nativeElement as PdfElement);
  } finally {
    ref.destroy();
    environmentInjector.destroy();
  }
};

/** Elements without a primitive pass their children through, like component hosts. */
export const contentOf = (element: PdfElement): (PdfElement | PdfTextNode)[] =>
  element.children.flatMap((child) => {
    if (child instanceof PdfComment) {
      return [];
    }
    if (child instanceof PdfElement && !child.primitive && !child.namespace) {
      return contentOf(child);
    }
    return [child];
  });

/** All text under a node, in document order. */
export const textOf = (node: PdfNode): string => {
  if (node instanceof PdfTextNode) {
    return node.value;
  }
  if (node instanceof PdfElement) {
    return node.children.map(textOf).join("");
  }
  return "";
};
