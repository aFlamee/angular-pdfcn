import { Component, computed, input } from "@angular/core";

import { PdfKeyValue } from "@/registry/bases/forme/components/key-value/key-value";
import type { KeyValueEntry } from "@/registry/bases/forme/components/key-value/key-value";
import { PdfPageFooter } from "@/registry/bases/forme/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { PdfImage } from "@/registry/bases/forme/components/pdf-image/pdf-image";
import { TABLE } from "@/registry/bases/forme/components/table/table";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  PdfcnThemeProvider,
  injectPdfcnTheme,
} from "@/registry/bases/forme/components/theme-provider";
import {
  FormeDocument,
  FormePage,
  FormeView,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import type { InvoiceCorporateData } from "./invoice-corporate.types";

const sampleData: InvoiceCorporateData = {
  billTo: {
    address: "100 Corporate Plaza, Tower B",
    email: "accounts@globalindustries.com",
    name: "Global Industries Ltd.",
    phone: "+1 (555) 888-9999",
  },
  companyAddress: "Nagpur, IN",
  companyEmail: "hello@pdfcn.app",
  companyName: "pdfcn",
  dueDate: "March 24, 2026",
  invoiceDate: "February 22, 2026",
  invoiceNumber: "INV-2026-004",
  items: [
    {
      description: "Enterprise Software License",
      quantity: 5,
      unitPrice: 4500,
    },
    { description: "Implementation Services", quantity: 1, unitPrice: 18_000 },
    {
      description: "Training Workshop (per session)",
      quantity: 3,
      unitPrice: 2500,
    },
    { description: "Annual Support Package", quantity: 1, unitPrice: 8500 },
  ],
  logo: "/favicon.png",
  notes:
    "Corporate billing – Net 30 terms apply. For inquiries, contact accounts@pdfcn.app",
  paymentTerms: {
    dueDate: "March 24, 2026",
    gst: "GSTIN 987654321",
    method: "Wire Transfer / Corporate Account",
  },
  subtitle: "Innovative PDF Solutions",
  summary: {
    subtotal: 56_500,
    tax: 4520,
    total: 61_020,
  },
};

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    PdfImage,
    PdfKeyValue,
    PdfPageFooter,
    PdfPageHeader,
    PdfText,
    TABLE,
  ],
  selector: "pdf-invoice-corporate-content",
  template: `
    @let data = this.data();
    @let s = styles();
    <forme-document [title]="'Invoice ' + data.invoiceNumber">
      <forme-page
        size="A4"
        [margin]="{ bottom: 25, left: 56, right: 56, top: 56 }"
      >
        <pdf-page-footer
          [leftText]="data.notes"
          rightText="Page 1 of 1"
          sticky
          [pagePadding]="25"
        />
        <forme-view [style]="s.page">
          <ng-template #logo>
            <pdf-image
              [src]="data.logo ?? '/favicon.png'"
              [width]="56"
              [height]="56"
              [style]="{ margin: 0 }"
            />
          </ng-template>
          <pdf-page-header
            variant="logo-right"
            [logo]="logo"
            [title]="data.companyName"
            [subtitle]="data.subtitle + '  ·  ' + data.companyAddress"
            [style]="{ marginBottom: theme().spacing.sectionGap }"
          />
          <forme-view [style]="s.infoGrid">
            <forme-view [style]="s.infoColumn">
              <pdf-text [style]="s.infoLabel" noMargin
                >Invoice Details</pdf-text
              >
              <pdf-key-value size="sm" [items]="detailItems()" />
            </forme-view>
            <forme-view [style]="s.infoColumn">
              <pdf-text [style]="s.infoLabel" noMargin>Bill To</pdf-text>
              <pdf-text variant="sm" weight="semibold" noMargin>{{
                data.billTo.name
              }}</pdf-text>
              <pdf-text variant="xs" noMargin color="mutedForeground">{{
                data.billTo.address
              }}</pdf-text>
              <pdf-text variant="xs" noMargin color="mutedForeground">{{
                data.billTo.email
              }}</pdf-text>
              <pdf-text variant="xs" noMargin color="mutedForeground">{{
                data.billTo.phone
              }}</pdf-text>
            </forme-view>
          </forme-view>
          <pdf-table variant="bordered">
            <pdf-table-header>
              <pdf-table-row header>
                <pdf-table-cell>Description</pdf-table-cell>
                <pdf-table-cell align="center">Qty</pdf-table-cell>
                <pdf-table-cell align="right">Unit Price</pdf-table-cell>
                <pdf-table-cell align="right">Amount</pdf-table-cell>
              </pdf-table-row>
            </pdf-table-header>
            <pdf-table-body>
              @for (item of data.items; track $index) {
                <pdf-table-row>
                  <pdf-table-cell>{{ item.description }}</pdf-table-cell>
                  <pdf-table-cell align="center">{{
                    item.quantity
                  }}</pdf-table-cell>
                  <pdf-table-cell align="right">{{
                    "$" + item.unitPrice.toLocaleString()
                  }}</pdf-table-cell>
                  <pdf-table-cell align="right">{{
                    "$" + (item.quantity * item.unitPrice).toLocaleString()
                  }}</pdf-table-cell>
                </pdf-table-row>
              }
            </pdf-table-body>
          </pdf-table>
          <forme-view [style]="s.summaryCard">
            <forme-view [style]="s.summaryRow">
              <forme-view [style]="{ width: 260 }">
                <pdf-key-value
                  size="md"
                  [dividerThickness]="1"
                  dividerColor="border"
                  [items]="summaryItems()"
                  divided
                />
              </forme-view>
            </forme-view>
          </forme-view>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class InvoiceCorporateContent {
  readonly data = input.required<InvoiceCorporateData>();

  protected readonly theme = injectPdfcnTheme();

  protected readonly styles = computed(() => {
    const theme = this.theme();
    return StyleSheet.create({
      infoColumn: {
        flex: 1,
      },
      infoGrid: {
        flexDirection: "row",
        gap: 24,
        marginBottom: theme.spacing.sectionGap,
      },
      infoLabel: {
        color: theme.colors.mutedForeground,
        fontSize: 9,
        fontWeight: "bold",
        letterSpacing: 0.6,
        marginBottom: 6,
        textTransform: "uppercase",
      },
      page: {
        backgroundColor: theme.colors.background,
      },
      summaryCard: {
        backgroundColor: theme.colors.muted,
        borderRadius: theme.primitives.borderRadius.md,
        marginTop: 20,
        padding: 16,
      },
      summaryRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
      },
    });
  });

  protected readonly detailItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    return [
      { key: "Invoice #", value: data.invoiceNumber },
      { key: "Issue Date", value: data.invoiceDate },
      { key: "Due Date", value: data.dueDate },
      { key: "Payment", value: data.paymentTerms.method },
    ];
  });

  protected readonly summaryItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    const theme = this.theme();
    return [
      {
        key: "Subtotal",
        value: `$${data.summary.subtotal.toLocaleString()}`,
      },
      {
        key: "Tax (8%)",
        value: `$${data.summary.tax.toFixed(2)}`,
      },
      {
        key: "Total Due",
        keyStyle: { fontSize: 13, fontWeight: "bold" },
        value: `$${data.summary.total.toFixed(2)}`,
        valueStyle: {
          color: theme.colors.primary,
          fontSize: 14,
          fontWeight: "bold",
        },
      },
    ];
  });
}

@Component({
  imports: [InvoiceCorporateContent, PdfcnThemeProvider],
  selector: "pdf-invoice-corporate",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-invoice-corporate-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class InvoiceCorporateDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<InvoiceCorporateData>(sampleData);
}
