import { Component, computed, input } from "@angular/core";

import { PdfKeyValue } from "@/registry/bases/forme/components/key-value/key-value";
import type { KeyValueEntry } from "@/registry/bases/forme/components/key-value/key-value";
import { PdfPageFooter } from "@/registry/bases/forme/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
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

import type { InvoiceCreativeData } from "./invoice-creative.types";

const sampleData: InvoiceCreativeData = {
  billTo: {
    address: "250 Design District, Loft 5",
    email: "studio@creativeagency.co",
    name: "Creative Agency Co.",
    phone: "+1 (555) 321-7654",
  },
  companyAddress: "Nagpur, IN · hello@pdfcn.app",
  companyName: "pdfcn",
  dueDate: "March 26, 2026",
  invoiceDate: "February 24, 2026",
  invoiceNumber: "INV-2026-005",
  items: [
    { description: "Brand Identity Design", quantity: 1, unitPrice: 8500 },
    {
      description: "Marketing Collateral Package",
      quantity: 1,
      unitPrice: 4200,
    },
    {
      description: "Social Media Assets (per set)",
      quantity: 4,
      unitPrice: 750,
    },
    { description: "Motion Graphics (30s)", quantity: 2, unitPrice: 3500 },
  ],
  notes:
    "Creative work is protected under copyright. Full usage rights transfer upon payment.",
  paymentTerms: {
    dueDate: "March 26, 2026",
    gst: "GSTIN 456789123",
    method: "Credit Card / PayPal / Stripe",
  },
  subtitle: "Innovative PDF Solutions",
  summary: {
    subtotal: 22_700,
    tax: 1475.5,
    total: 24_175.5,
  },
};

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    PdfKeyValue,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfText,
    TABLE,
  ],
  selector: "pdf-invoice-creative-content",
  template: `
    @let data = this.data();
    @let s = styles();
    <forme-document [title]="'Invoice ' + data.invoiceNumber">
      <forme-page
        size="A4"
        [margin]="{ bottom: 25, left: 56, right: 56, top: 56 }"
      >
        <pdf-page-footer
          variant="centered"
          centerText="Thank you for choosing us for your creative needs!"
          sticky
          [pagePadding]="25"
        />
        <forme-view [style]="s.page">
          <forme-view [style]="s.heroSection">
            <forme-view [style]="{ flex: 1 }">
              <pdf-page-header
                variant="centered"
                [title]="data.companyName"
                [subtitle]="data.subtitle + '  ·  ' + data.companyAddress"
                [marginBottom]="0"
              />
            </forme-view>
            <forme-view [style]="s.invoiceBadge">
              <pdf-text [style]="s.badgeLabel" noMargin>Invoice</pdf-text>
              <pdf-text [style]="s.badgeNumber" noMargin>{{
                data.invoiceNumber
              }}</pdf-text>
            </forme-view>
          </forme-view>
          <forme-view [style]="s.accentBlock">
            <forme-view [style]="s.infoGrid">
              <forme-view [style]="s.infoColumn">
                <pdf-text [style]="s.sectionLabel" noMargin>Billed To</pdf-text>
                <pdf-text variant="sm" weight="semibold" noMargin>{{
                  data.billTo.name
                }}</pdf-text>
                <pdf-text variant="xs" noMargin color="mutedForeground">{{
                  data.billTo.address
                }}</pdf-text>
                <pdf-text variant="xs" noMargin color="mutedForeground"
                  >{{ data.billTo.email }} · {{ data.billTo.phone }}</pdf-text
                >
              </forme-view>
              <forme-view [style]="s.infoColumn">
                <pdf-text [style]="s.sectionLabel" noMargin
                  >Invoice Info</pdf-text
                >
                <pdf-key-value size="sm" [items]="infoItems()" />
              </forme-view>
            </forme-view>
          </forme-view>
          <pdf-table variant="striped" zebraStripe>
            <pdf-table-header>
              <pdf-table-row header>
                <pdf-table-cell>Deliverable</pdf-table-cell>
                <pdf-table-cell align="center">Qty</pdf-table-cell>
                <pdf-table-cell align="right">Rate</pdf-table-cell>
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
          <pdf-section noWrap [style]="s.summarySection">
            <forme-view [style]="s.summaryLeft">
              <pdf-text [style]="s.sectionLabel" noMargin
                >Notes &amp; Terms</pdf-text
              >
              <pdf-text variant="xs" color="mutedForeground">{{
                data.notes
              }}</pdf-text>
              <pdf-text
                variant="xs"
                color="mutedForeground"
                [style]="{ marginTop: 4 }"
                >GST: {{ data.paymentTerms.gst }}</pdf-text
              >
            </forme-view>
            <forme-view [style]="s.summaryRight">
              <pdf-key-value
                size="sm"
                [dividerThickness]="1"
                [items]="summaryItems()"
                divided
              />
            </forme-view>
          </pdf-section>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class InvoiceCreativeContent {
  readonly data = input.required<InvoiceCreativeData>();

  private readonly theme = injectPdfcnTheme();

  protected readonly styles = computed(() => {
    const theme = this.theme();
    return StyleSheet.create({
      accentBlock: {
        backgroundColor: theme.colors.muted,
        borderLeftColor: theme.colors.accent,
        borderLeftStyle: "solid",
        borderLeftWidth: 4,
        marginBottom: theme.spacing.sectionGap,
        paddingLeft: 14,
        paddingVertical: 10,
      },
      badgeLabel: {
        color: theme.colors.primaryForeground,
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 1.2,
        marginBottom: 2,
        textTransform: "uppercase",
      },
      badgeNumber: {
        color: theme.colors.primaryForeground,
        fontSize: 16,
        fontWeight: "bold",
      },
      heroSection: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: theme.spacing.sectionGap,
      },
      infoColumn: {
        flex: 1,
      },
      infoGrid: {
        flexDirection: "row",
        gap: 32,
      },
      invoiceBadge: {
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.primitives.borderRadius.md,
        paddingHorizontal: 20,
        paddingVertical: 14,
      },
      page: {
        backgroundColor: theme.colors.background,
      },
      sectionLabel: {
        color: theme.colors.accent,
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 0.8,
        marginBottom: 6,
        textTransform: "uppercase",
      },
      summaryLeft: {
        flex: 1,
        paddingRight: 20,
      },
      summaryRight: {
        backgroundColor: theme.colors.muted,
        borderRadius: theme.primitives.borderRadius.sm,
        padding: 14,
        width: 240,
      },
      summarySection: {
        flexDirection: "row",
        marginTop: 24,
      },
    });
  });

  protected readonly infoItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    return [
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
        key: "Tax (6.5%)",
        value: `$${data.summary.tax.toFixed(2)}`,
      },
      {
        key: "Total",
        keyStyle: { fontSize: 13, fontWeight: "bold" },
        value: `$${data.summary.total.toFixed(2)}`,
        valueStyle: {
          color: theme.colors.accent,
          fontSize: 14,
          fontWeight: "bold",
        },
      },
    ];
  });
}

@Component({
  imports: [InvoiceCreativeContent, PdfcnThemeProvider],
  selector: "pdf-invoice-creative",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-invoice-creative-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class InvoiceCreativeDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<InvoiceCreativeData>(sampleData);
}
