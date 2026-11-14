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

import type { InvoiceMinimalData } from "./invoice-minimal.types";

// Sample data — replace with your own props or data source
const sampleData: InvoiceMinimalData = {
  billTo: {
    address: "500 Enterprise Way, Building A",
    email: "finance@enterprisecorp.io",
    name: "Enterprise Corp",
    phone: "+1 (555) 246-8135",
  },
  companyAddress: "Nagpur, IN",
  companyEmail: "hello@pdfcn.app",
  companyName: "pdfcn",
  dueDate: "March 22, 2026",
  invoiceDate: "February 20, 2026",
  invoiceNumber: "INV-2026-003",
  items: [
    { description: "Annual License Plan", quantity: 1, unitPrice: 25_000 },
    { description: "Support & Maintenance", quantity: 12, unitPrice: 1500 },
    { description: "Custom Integration", quantity: 1, unitPrice: 12_000 },
  ],
  notes:
    "Invoice for annual enterprise subscription. Please retain for your records.",
  paymentTerms: {
    dueDate: "March 22, 2026",
    gst: "GSTIN 123456789",
    method: "ACH Transfer / Check",
  },
  subtitle: "Innovative PDF Solutions",
  summary: {
    subtotal: 55_000,
    tax: 3850,
    total: 58_850,
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
  selector: "pdf-invoice-minimal-content",
  template: `
    @let data = this.data();
    @let theme = this.theme();
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
        <forme-view [style]="styles().page">
          <pdf-section
            noWrap
            [style]="{
              alignItems: 'flex-start',
              flexDirection: 'row',
              marginBottom: theme.spacing.sectionGap,
            }"
          >
            <forme-view [style]="{ flex: 1 }">
              <pdf-page-header
                variant="minimal"
                [title]="data.companyName"
                [subtitle]="data.companyAddress + '  ·  ' + data.companyEmail"
                [marginBottom]="0"
              />
            </forme-view>
            <forme-view [style]="styles().invoiceStamp">
              <pdf-text
                [style]="{
                  color: theme.colors.primary,
                  fontSize: 7,
                  fontWeight: 'bold',
                  textAlign: 'right',
                }"
                noMargin
                transform="uppercase"
                >Invoice</pdf-text
              >
              <pdf-text
                [style]="{
                  color: theme.colors.foreground,
                  fontSize: 14,
                  fontWeight: 'bold',
                  textAlign: 'right',
                }"
                noMargin
                >{{ data.invoiceNumber }}</pdf-text
              >
              <pdf-text
                [style]="{
                  color: theme.colors.mutedForeground,
                  fontSize: 8,
                  textAlign: 'right',
                }"
                noMargin
                >{{ data.invoiceDate }}</pdf-text
              >
            </forme-view>
          </pdf-section>
          <forme-view [style]="styles().infoRow">
            <forme-view [style]="{ paddingRight: 20, width: 251 }">
              <pdf-text [style]="styles().infoLabel" noMargin>Bill To</pdf-text>
              <pdf-text variant="sm" noMargin>{{ data.billTo.name }}</pdf-text>
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
            <forme-view [style]="{ width: 232 }">
              <pdf-text [style]="styles().infoLabel" noMargin
                >Invoice Details</pdf-text
              >
              <pdf-key-value size="sm" [items]="detailItems()" />
            </forme-view>
          </forme-view>
          <pdf-table variant="compact">
            <pdf-table-header>
              <pdf-table-row header>
                <pdf-table-cell>Description</pdf-table-cell>
                <pdf-table-cell align="center">Qty</pdf-table-cell>
                <pdf-table-cell align="right">Rate</pdf-table-cell>
                <pdf-table-cell align="right">Total</pdf-table-cell>
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
                    "$" + (item.quantity * item.unitPrice).toFixed(2)
                  }}</pdf-table-cell>
                </pdf-table-row>
              }
            </pdf-table-body>
          </pdf-table>
          <pdf-section noWrap [style]="{ flexDirection: 'row', marginTop: 20 }">
            <forme-view [style]="{ flex: 1 }" />
            <forme-view [style]="{ width: 240 }">
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
export class InvoiceMinimalContent {
  readonly data = input.required<InvoiceMinimalData>();

  protected readonly theme = injectPdfcnTheme();

  protected readonly styles = computed(() => {
    const theme = this.theme();
    const styles = StyleSheet.create({
      infoLabel: {
        color: theme.colors.primary,
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 0.8,
        marginBottom: 4,
        textTransform: "uppercase",
      },
      infoRow: {
        flexDirection: "row",
        marginBottom: 28,
      },
      invoiceStamp: {
        alignSelf: "flex-start",
        borderColor: theme.colors.primary,
        borderRadius: theme.primitives.borderRadius.sm,
        borderStyle: "solid",
        borderWidth: 2,
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
      page: {
        backgroundColor: theme.colors.background,
      },
    });
    return styles;
  });

  protected readonly detailItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    return [
      { key: "Due Date", value: data.dueDate },
      { key: "Payment", value: data.paymentTerms.method },
      { key: "GST", value: data.paymentTerms.gst },
    ];
  });

  protected readonly summaryItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    const theme = this.theme();
    return [
      {
        key: "Subtotal",
        value: `$${data.summary.subtotal.toFixed(2)}`,
      },
      { key: "Tax (7%)", value: `$${data.summary.tax.toFixed(2)}` },
      {
        key: "Balance Due",
        keyStyle: { fontSize: 12, fontWeight: "bold" },
        value: `$${data.summary.total.toFixed(2)}`,
        valueStyle: {
          color: theme.colors.primary,
          fontSize: 13,
          fontWeight: "bold",
        },
      },
    ];
  });
}

@Component({
  imports: [InvoiceMinimalContent, PdfcnThemeProvider],
  selector: "pdf-invoice-minimal",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-invoice-minimal-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class InvoiceMinimalDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<InvoiceMinimalData>(sampleData);
}
