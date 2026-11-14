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

import type { InvoiceModernData } from "./invoice-modern.types";

// Sample data — replace with your own props or data source
const sampleData: InvoiceModernData = {
  billTo: {
    address: "789 Innovation Blvd, Floor 3",
    email: "billing@techstart.com",
    name: "TechStart Solutions",
    phone: "+1 (555) 987-6543",
  },
  companyAddress: "Nagpur, IN",
  companyEmail: "hello@pdfcn.app",
  companyName: "pdfcn",
  dueDate: "March 20, 2026",
  invoiceDate: "February 18, 2026",
  invoiceNumber: "INV-2026-002",
  items: [
    { description: "API Integration", quantity: 1, unitPrice: 15_000 },
    { description: "SEO", quantity: 2, unitPrice: 5500 },
    { description: "Security Audit", quantity: 1, unitPrice: 7200 },
  ],
  notes: "Payment terms: Net 30 days. Thank you for your business!",
  paymentTerms: {
    dueDate: "March 20, 2026",
    gst: "GSTIN 123456789",
    method: "Wire Transfer / Bank Account",
  },
  subtitle: "Innovative PDF Solutions",
  summary: {
    subtotal: 33_200,
    tax: 2324,
    total: 35_524,
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
  selector: "pdf-invoice-modern-content",
  template: `
    @let data = this.data();
    @let theme = this.theme();
    @let styles = this.styles();
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
        <forme-view [style]="styles.page">
          <pdf-page-header
            variant="branded"
            [title]="data.companyName"
            [subtitle]="
              data.subtitle +
              '  ·  ' +
              data.companyAddress +
              '  ·  ' +
              data.companyEmail
            "
          />
          <forme-view [style]="styles.metaRow">
            <forme-view [style]="styles.metaCol">
              <pdf-text [style]="styles.metaLabel" noMargin
                >Invoice Number</pdf-text
              >
              <pdf-text
                [style]="{
                  ...styles.metaValue,
                  fontSize: 11,
                  fontWeight: 'bold',
                }"
                noMargin
                >{{ data.invoiceNumber }}</pdf-text
              >
            </forme-view>
            <forme-view [style]="styles.metaCol">
              <pdf-text [style]="styles.metaLabel" noMargin
                >Invoice Date</pdf-text
              >
              <pdf-text [style]="styles.metaValue" noMargin>{{
                data.invoiceDate
              }}</pdf-text>
            </forme-view>
            <forme-view [style]="styles.metaCol">
              <pdf-text [style]="styles.metaLabel" noMargin>Due Date</pdf-text>
              <pdf-text [style]="styles.metaValue" noMargin>{{
                data.dueDate
              }}</pdf-text>
            </forme-view>
            <forme-view [style]="styles.dividerCol" />
            <forme-view [style]="{ flex: 2 }">
              <pdf-text [style]="styles.metaLabel" noMargin>Billed To</pdf-text>
              <pdf-text
                [style]="{ ...styles.metaValue, fontWeight: 'bold' }"
                noMargin
                >{{ data.billTo.name }}</pdf-text
              >
              <pdf-text
                [style]="{
                  ...styles.metaValue,
                  color: theme.colors.mutedForeground,
                }"
                noMargin
                >{{ data.billTo.address }}</pdf-text
              >
              <pdf-text
                [style]="{
                  ...styles.metaValue,
                  color: theme.colors.mutedForeground,
                }"
                noMargin
                >{{ data.billTo.email }}</pdf-text
              >
              <pdf-text
                [style]="{
                  ...styles.metaValue,
                  color: theme.colors.mutedForeground,
                }"
                noMargin
                >{{ data.billTo.phone }}</pdf-text
              >
            </forme-view>
          </forme-view>
          <pdf-table variant="primary-header">
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
                    "$" + (item.quantity * item.unitPrice).toFixed(2)
                  }}</pdf-table-cell>
                </pdf-table-row>
              }
            </pdf-table-body>
          </pdf-table>
          <pdf-section noWrap [style]="{ flexDirection: 'row', marginTop: 16 }">
            <forme-view [style]="{ flex: 1, paddingRight: 20 }">
              <pdf-text [style]="styles.metaLabel" noMargin
                >Payment Method</pdf-text
              >
              <pdf-text variant="xs" noMargin>{{
                data.paymentTerms.method
              }}</pdf-text>
              <pdf-text variant="xs" noMargin color="mutedForeground">{{
                data.paymentTerms.gst
              }}</pdf-text>
            </forme-view>
            <forme-view [style]="{ width: 220 }">
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
export class InvoiceModernContent {
  readonly data = input.required<InvoiceModernData>();

  protected readonly theme = injectPdfcnTheme();

  protected readonly styles = computed(() => {
    const theme = this.theme();
    const styles = StyleSheet.create({
      dividerCol: {
        backgroundColor: theme.colors.border,
        marginRight: 12,
        width: 1,
      },
      metaCol: {
        flex: 1,
        paddingRight: 12,
      },
      metaLabel: {
        color: theme.colors.mutedForeground,
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 0.5,
        marginBottom: 3,
        textTransform: "uppercase",
      },
      metaRow: {
        flexDirection: "row",
        marginBottom: theme.spacing.sectionGap,
      },
      metaValue: {
        color: theme.colors.foreground,
        fontSize: 9,
      },
      page: {
        backgroundColor: theme.colors.background,
      },
    });
    return styles;
  });

  protected readonly summaryItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    return [
      {
        key: "Subtotal",
        value: `$${data.summary.subtotal.toFixed(2)}`,
      },
      { key: "Tax (7%)", value: `$${data.summary.tax.toFixed(2)}` },
      {
        key: "Total Due",
        keyStyle: { fontSize: 12, fontWeight: "bold" },
        value: `$${data.summary.total.toFixed(2)}`,
        valueStyle: { fontSize: 12, fontWeight: "bold" },
      },
    ];
  });
}

@Component({
  imports: [InvoiceModernContent, PdfcnThemeProvider],
  selector: "pdf-invoice-modern",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-invoice-modern-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class InvoiceModernDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<InvoiceModernData>(sampleData);
}
