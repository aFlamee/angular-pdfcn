import type { BaseName } from "@/lib/content/types";

/** The components the home page showcase names, keyed by registry name. */
export const homePdfComponentCatalog = {
  alert: {
    description:
      "A callout block for warnings, notes, and important information.",
    label: "Alert",
  },
  badge: {
    description:
      "A styled label for status indicators, tags, and inline annotations.",
    label: "Badge",
  },
  card: {
    description:
      "A contained layout for grouping related content with border and padding.",
    label: "Card",
  },
  "data-table": {
    description:
      "A full-featured data table with sorting, pagination, and cell formatting.",
    label: "Data table",
  },
  divider: {
    description:
      "A visual separator with configurable color, thickness, and margin.",
    label: "Divider",
  },
  graph: {
    description:
      "A data visualization component for charts and statistical graphics.",
    label: "Graph",
  },
  "key-value": {
    description:
      "A flexible key-value layout for metadata, summaries, and label pairs.",
    label: "Key-value",
  },
  list: {
    description:
      "An ordered or unordered list with custom markers and nested items.",
    label: "List",
  },
  "page-footer": {
    description:
      "A compact document footer with page numbers, legal text, and brand marks.",
    label: "Page footer",
  },
  "page-header": {
    description:
      "A branded document header with logo, company details, and document title.",
    label: "Page header",
  },
  "pdf-image": {
    description:
      "An image component optimized for PDF rendering with aspect ratio and sizing.",
    label: "Image",
  },
  section: {
    description:
      "A grouped content section with optional title, padding, and background.",
    label: "Section",
  },
  signature: {
    description:
      "A signature block for authorized signatories and approval lines.",
    label: "Signature",
  },
  table: {
    description:
      "A structured data table with headers, rows, and responsive column widths.",
    label: "Table",
  },
  text: {
    description:
      "A versatile text component for headings, paragraphs, and inline content.",
    label: "Text",
  },
} as const;

export type ComponentPartId = keyof typeof homePdfComponentCatalog;

export const homePdfBases: { id: BaseName; label: string }[] = [
  { id: "takumi", label: "Takumi" },
  { id: "forme", label: "Forme" },
];

export interface PdfRecipe {
  componentIds: readonly ComponentPartId[];
  defaultComponentId: ComponentPartId;
  /** The example in `examples/{base}/` that renders this document. */
  demo: string;
  filename: string;
  id: string;
  name: string;
}

export const homePdfPreviews: readonly PdfRecipe[] = [
  {
    componentIds: [
      "page-header",
      "key-value",
      "table",
      "section",
      "text",
      "page-footer",
    ],
    defaultComponentId: "table",
    demo: "invoice-corporate",
    filename: "corporate-invoice.ts",
    id: "corporate-invoice",
    name: "Corporate invoice",
  },
  {
    componentIds: ["page-header", "text", "graph", "data-table", "page-footer"],
    defaultComponentId: "graph",
    demo: "report-financial",
    filename: "financial-report.ts",
    id: "financial-report",
    name: "Financial report",
  },
  {
    componentIds: [
      "page-header",
      "text",
      "divider",
      "key-value",
      "page-footer",
    ],
    defaultComponentId: "text",
    demo: "invoice-minimal",
    filename: "minimal-invoice.ts",
    id: "minimal-invoice",
    name: "Minimal invoice",
  },
];
