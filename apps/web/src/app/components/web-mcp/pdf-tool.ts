import { SITE } from "@/constants/site";
import { BASE_NAMES, DEFAULT_BASE } from "@/lib/bases";
import type { BaseName } from "@/lib/content/types";

import { BLOCK_NAMES, getBlock } from "./blocks";
import type { WebMcpTool } from "./web-mcp";

export const BASE_SCHEMA = {
  description: `PDF rendering engine (default: ${DEFAULT_BASE})`,
  enum: [...BASE_NAMES],
  type: "string",
};

/** Renders a block's sample PDF in the browser and opens it in a new tab. */
export const openBlockPdf = async (name: string, base: BaseName) => {
  const block = getBlock(name);
  if (!block.bases.includes(base)) {
    throw new Error(`${name} has no ${base} version`);
  }
  const { renderPreviewPdf } = await import("../../lib/render-preview");
  const bytes = await renderPreviewPdf(base, name);
  const url = URL.createObjectURL(
    new Blob([bytes as BlobPart], { type: "application/pdf" })
  );
  window.open(url, "_blank");
  return url;
};

export const generatePdfTool: WebMcpTool<{ block: string; base?: BaseName }> = {
  description:
    "Generate and download a PDF document. Opens the PDF in a new browser tab for viewing or downloading. Uses the template's default sample data.",
  execute: async ({ block, base = DEFAULT_BASE }) => {
    const url = await openBlockPdf(block, base);
    return {
      base,
      block,
      message: `Opening ${block} PDF in a new tab using ${base} engine.`,
      ok: true,
      url,
    };
  },
  inputSchema: {
    properties: {
      base: BASE_SCHEMA,
      block: {
        description: "The document template to generate (e.g. invoice-classic)",
        enum: BLOCK_NAMES,
        type: "string",
      },
    },
    required: ["block"],
    type: "object",
  },
  name: `${SITE.NAME}_generate_pdf`,
};
