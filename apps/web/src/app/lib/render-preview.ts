// The browser preview pipeline: example component, then the base's serializer, then the wasm engine.
import type { Type } from "@angular/core";
import takumiWasmUrl from "takumi-pdf/wasm-url";

import type { BaseName } from "@/lib/content/types";
import { replacePreviewImageSources } from "@/lib/preview/preview-assets";
import { getTakumiPreviewOptions } from "@/lib/preview/preview-config";
import {
  getPreviewFontUrls,
  getPreviewFonts,
} from "@/lib/theme-builder/preview-fonts";
import { PdfElement } from "@/registry/lib/pdf-renderer";
import type { PdfcnTheme } from "@/registry/themes";

// With client hydration on, Angular reads `ngh` from every created host element.
// Remove once `PdfElement` in the registry implements `getAttribute`.
Object.assign(PdfElement.prototype, {
  getAttribute(this: PdfElement, name: string) {
    return this.attributes[name] ?? null;
  },
});

const PREVIEW_LOGO_PATH = "/favicon.png";

let takumiWasmReady: Promise<unknown> | undefined;

const startTakumi = async (
  initialize: (input: { module_or_path: URL }) => Promise<unknown>
) => {
  try {
    return await initialize({ module_or_path: takumiWasmUrl });
  } catch (error) {
    takumiWasmReady = undefined;
    throw error;
  }
};

const initializeTakumi = (
  initialize: (input: { module_or_path: URL }) => Promise<unknown>
) => {
  takumiWasmReady ??= startTakumi(initialize);
  return takumiWasmReady;
};

/** A theme previews Invoice Classic, like the reference. Otherwise the named demo. */
const loadComponent = async (
  base: BaseName,
  name: string,
  theme?: PdfcnTheme
): Promise<Type<unknown>> => {
  if (theme) {
    const module =
      base === "takumi"
        ? await import("@/registry/bases/takumi/blocks/invoice-classic/invoice-classic")
        : await import("@/registry/bases/forme/blocks/invoice-classic/invoice-classic");
    return module.InvoiceClassicDocument;
  }
  const { demos } = await import("@/examples/__index__");
  const demo = demos[base][name];
  if (!demo) {
    throw new Error(
      `Unknown ${base === "takumi" ? "Takumi" : "Forme"} demo: ${name}`
    );
  }
  return demo;
};

const loadPreviewLogo = async () => {
  const response = await fetch(PREVIEW_LOGO_PATH);
  if (!response.ok) {
    throw new Error(`Unable to load preview logo (${response.status})`);
  }
  return {
    sources: [{ data: await response.arrayBuffer(), src: PREVIEW_LOGO_PATH }],
  };
};

const assertPdfHasPages = (pdfBytes: Uint8Array) => {
  const source = new TextDecoder("latin1").decode(pdfBytes);
  const pageCounts = [...source.matchAll(/\/Count\s+(\d+)/g)].map((match) =>
    Number(match[1])
  );
  if (pageCounts.length > 0 && Math.max(...pageCounts) === 0) {
    throw new Error("PDF renderer returned a document with no pages");
  }
};

export const renderPreviewPdf = async (
  base: BaseName,
  name: string,
  theme?: PdfcnTheme
) => {
  const component = await loadComponent(base, name, theme);
  const inputs = theme ? { theme } : {};
  const families = theme
    ? [theme.typography.body.fontFamily, theme.typography.heading.fontFamily]
    : [];
  let pdfBytes: Uint8Array;

  if (base === "takumi") {
    const [{ default: initialize, render }, { renderTakumiDocument }, images] =
      await Promise.all([
        import("takumi-pdf/no-init"),
        import("@/registry/bases/takumi/lib/render"),
        loadPreviewLogo(),
      ]);
    await initializeTakumi(initialize);
    const { node } = renderTakumiDocument(component, { inputs });
    pdfBytes = await render(node, {
      ...getTakumiPreviewOptions(name),
      fonts: theme ? getPreviewFontUrls(families) : undefined,
      images,
    });
  } else {
    const [{ renderSerializedDoc }, { renderFormeDocument }] =
      await Promise.all([
        import("@formepdf/core/browser"),
        import("@/registry/bases/forme/lib/render"),
      ]);
    const document = replacePreviewImageSources(
      renderFormeDocument(component, { inputs })
    );
    const previewFonts = getPreviewFonts(families);
    if (previewFonts.length > 0) {
      document.fonts = [...(document.fonts ?? []), ...previewFonts];
    }
    // `renderSerializedDoc` loads font files, then calls the engine's `renderPdf`.
    pdfBytes = await renderSerializedDoc(
      document as unknown as Record<string, unknown>
    );
  }

  assertPdfHasPages(pdfBytes);
  return pdfBytes;
};
