import { SITE } from "@/constants/site";
import { DEFAULT_BASE } from "@/lib/bases";
import type { BaseName } from "@/lib/content/types";

import { BLOCKS, getBlock } from "./blocks";
import { BASE_SCHEMA, openBlockPdf } from "./pdf-tool";
import type { WebMcpTool } from "./web-mcp";

const BLOCK_SCHEMAS: Record<string, object> = {
  "invoice-classic": {
    properties: {
      billTo: {
        properties: {
          address: { type: "string" },
          email: { type: "string" },
          name: { type: "string" },
          phone: { type: "string" },
        },
        required: ["name", "address", "email", "phone"],
        type: "object",
      },
      companyAddress: { description: "Sender address", type: "string" },
      companyEmail: { description: "Sender email", type: "string" },
      companyName: { description: "Sender company name", type: "string" },
      dueDate: { description: "Payment due date", type: "string" },
      invoiceDate: { description: "Issue date", type: "string" },
      invoiceNumber: {
        description: "Invoice identifier (e.g. INV-001)",
        type: "string",
      },
      items: {
        items: {
          properties: {
            description: { type: "string" },
            quantity: { type: "number" },
            unitPrice: { type: "number" },
          },
          required: ["description", "quantity", "unitPrice"],
          type: "object",
        },
        type: "array",
      },
      notes: { description: "Optional notes", type: "string" },
      paymentTerms: {
        properties: {
          dueDate: { type: "string" },
          gst: { type: "string" },
          method: { type: "string" },
        },
        type: "object",
      },
      subtitle: { description: "Tagline or subtitle", type: "string" },
      summary: {
        properties: {
          subtotal: { type: "number" },
          tax: { type: "number" },
          total: { type: "number" },
        },
        type: "object",
      },
    },
    required: [
      "invoiceNumber",
      "invoiceDate",
      "dueDate",
      "companyName",
      "billTo",
      "items",
    ],
    type: "object",
  },
  "report-marketing": {
    properties: {
      author: { type: "string" },
      generatedAt: { type: "string" },
      highlights: { items: { type: "string" }, type: "array" },
      period: {
        description: "Reporting period (e.g. Q1 2026)",
        type: "string",
      },
      rows: {
        items: {
          properties: {
            label: { type: "string" },
            owner: { type: "string" },
            progress: { type: "number" },
            status: { type: "string" },
          },
          type: "object",
        },
        type: "array",
      },
      series: {
        items: {
          properties: {
            label: { type: "string" },
            value: { type: "number" },
          },
          type: "object",
        },
        type: "array",
      },
      subtitle: { type: "string" },
      summary: {
        items: {
          properties: {
            label: { type: "string" },
            tone: {
              enum: ["success", "warning", "destructive", "info"],
              type: "string",
            },
            trend: { type: "string" },
            value: { type: "string" },
          },
          type: "object",
        },
        type: "array",
      },
      title: { description: "Report title", type: "string" },
    },
    required: ["title", "subtitle", "generatedAt", "period", "author"],
    type: "object",
  },
};

export const listBlocksTool: WebMcpTool<{ type?: string }> = {
  description:
    "List all available PDF document templates (invoices and reports). Use this to find the right template before generating a PDF.",
  execute: ({ type = "all" }) =>
    type === "all" ? BLOCKS : BLOCKS.filter((b) => b.type === type),
  inputSchema: {
    properties: {
      type: {
        description: "Filter by template type (default: all)",
        enum: ["invoice", "report", "all"],
        type: "string",
      },
    },
    type: "object",
  },
  name: `${SITE.NAME}_list_blocks`,
};

export const getBlockTool: WebMcpTool<{ name: string }> = {
  description:
    "Get the data schema and installation command for a specific PDF template. Use this to understand what data fields are needed to populate the template.",
  execute: ({ name }) => ({
    ...getBlock(name),
    dataSchema: BLOCK_SCHEMAS[name] ?? null,
  }),
  inputSchema: {
    properties: {
      name: {
        description: "Template name (e.g. invoice-classic, report-marketing)",
        type: "string",
      },
    },
    required: ["name"],
    type: "object",
  },
  name: `${SITE.NAME}_get_block`,
};

export const previewBlockTool: WebMcpTool<{ name: string; base?: BaseName }> = {
  description:
    "Open a PDF preview for a template in a new browser tab. The preview uses sample data and the current theme.",
  execute: async ({ name, base = DEFAULT_BASE }) => {
    const url = await openBlockPdf(name, base);
    return { base, block: name, ok: true, url };
  },
  inputSchema: {
    properties: {
      base: BASE_SCHEMA,
      name: {
        description: "Template name (e.g. invoice-classic)",
        type: "string",
      },
    },
    required: ["name"],
    type: "object",
  },
  name: `${SITE.NAME}_preview_block`,
};
