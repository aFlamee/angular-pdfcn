import { Component, computed, input } from "@angular/core";

import { PdfKeyValue } from "@/registry/bases/takumi/components/key-value/key-value";
import type { KeyValueEntry } from "@/registry/bases/takumi/components/key-value/key-value";
import { PdfPageFooter } from "@/registry/bases/takumi/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/takumi/components/page-header/page-header";
import { PdfImage } from "@/registry/bases/takumi/components/pdf-image/pdf-image";
import { PdfSection } from "@/registry/bases/takumi/components/section/section";
import { TABLE } from "@/registry/bases/takumi/components/table/table";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import {
  PdfcnThemeProvider,
  injectPdfcnTheme,
} from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
  TakumiView,
  StyleSheet,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import type { InvoiceClassicData } from "./invoice-classic.types";

// Sample data — replace with your own props or data source
const sampleData: InvoiceClassicData = {
  billTo: {
    address: "456 Client Ave, Suite 2",
    email: "contact@clientcorp.com",
    name: "Client Corp.",
    phone: "+1 (555) 123-4567",
  },
  companyAddress: "Nagpur, IN",
  companyEmail: "hello@pdfcn.app",
  companyName: "pdfcn",
  dueDate: "March 17, 2026",
  invoiceDate: "February 17, 2026",
  invoiceNumber: "INV-2026-001",
  items: [
    { description: "Web Development", quantity: 1, unitPrice: 12_500 },
    { description: "UI/UX Design", quantity: 1, unitPrice: 8750 },
    { description: "Consulting", quantity: 10, unitPrice: 1500 },
  ],
  logo: "/favicon.png",
  notes: "Thank you for your business!",
  paymentTerms: {
    dueDate: "March 17, 2026",
    gst: "GSTIN 123456789",
    method: "UPI / Card / Bank Transfer",
  },
  subtitle: "Innovative PDF Solutions",
  summary: {
    subtotal: 36_250,
    tax: 2537.5,
    total: 38_787.5,
  },
};

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    TakumiView,
    PdfImage,
    PdfKeyValue,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfText,
    TABLE,
  ],
  selector: "pdf-invoice-classic-content",
  template: `
    @let data = this.data();
    <takumi-document [title]="'Invoice ' + data.invoiceNumber">
      <takumi-page size="A4" [style]="styles().page">
        <ng-template #logo>
          <pdf-image
            [src]="data.logo ?? '/favicon.png'"
            [style]="{ margin: 0 }"
          />
        </ng-template>
        <pdf-page-header
          variant="logo-left"
          [logo]="logo"
          [title]="data.companyName"
          [subtitle]="data.subtitle"
          [rightText]="data.invoiceNumber"
          [rightSubText]="'Due: ' + data.dueDate"
          [style]="{ marginBottom: 0 }"
        />
        <pdf-section noWrap [style]="{ flexDirection: 'row' }">
          <takumi-view [style]="{ flex: 1, paddingRight: 15 }">
            <pdf-text
              [style]="labelStyle"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >From</pdf-text
            >
            <pdf-text noMargin variant="xs">{{ data.companyName }}</pdf-text>
            <pdf-text noMargin variant="xs">{{ data.companyAddress }}</pdf-text>
            <pdf-text noMargin variant="xs">{{ data.companyEmail }}</pdf-text>
          </takumi-view>
          <takumi-view [style]="{ flex: 1, paddingRight: 15 }">
            <pdf-text
              [style]="labelStyle"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >Bill To</pdf-text
            >
            <pdf-text noMargin variant="xs">{{ data.billTo.name }}</pdf-text>
            <pdf-text noMargin variant="xs">{{ data.billTo.address }}</pdf-text>
            <pdf-text noMargin variant="xs">{{ data.billTo.email }}</pdf-text>
          </takumi-view>
          <takumi-view [style]="{ flex: 1, paddingRight: 15 }">
            <pdf-text
              [style]="labelStyle"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >Payment Terms</pdf-text
            >
            <pdf-text noMargin variant="xs">{{
              data.paymentTerms.method
            }}</pdf-text>
            <pdf-text noMargin variant="xs">{{
              data.paymentTerms.gst
            }}</pdf-text>
            <pdf-text noMargin variant="xs">{{
              data.paymentTerms.dueDate
            }}</pdf-text>
          </takumi-view>
        </pdf-section>
        <pdf-table variant="grid" zebraStripe>
          <pdf-table-header>
            <pdf-table-row header>
              <pdf-table-cell>Description</pdf-table-cell>
              <pdf-table-cell align="center">QTY</pdf-table-cell>
              <pdf-table-cell align="center">Rate</pdf-table-cell>
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
                <pdf-table-cell align="center">{{
                  "$" + item.unitPrice
                }}</pdf-table-cell>
                <pdf-table-cell align="right">{{
                  "$" + (item.quantity * item.unitPrice).toFixed(2)
                }}</pdf-table-cell>
              </pdf-table-row>
            }
          </pdf-table-body>
        </pdf-table>
        <pdf-section noWrap [style]="{ flexDirection: 'row', marginTop: 16 }">
          <takumi-view [style]="{ marginLeft: 'auto', width: 220 }">
            <pdf-key-value
              size="sm"
              [dividerThickness]="1"
              [items]="summaryItems()"
              divided
            />
          </takumi-view>
        </pdf-section>
        <pdf-page-footer
          [leftText]="data.notes"
          rightText="Page 1 of 1"
          sticky
          [pagePadding]="25"
        />
      </takumi-page>
    </takumi-document>
  `,
})
export class InvoiceClassicContent {
  readonly data = input.required<InvoiceClassicData>();

  private readonly theme = injectPdfcnTheme();

  protected readonly styles = computed(() => {
    const theme = this.theme();
    const styles = StyleSheet.create({
      page: {
        backgroundColor: theme.colors.background,
        boxSizing: "border-box",
        minHeight: 841,
        padding: theme.spacing.page.marginTop,
        paddingBottom: theme.spacing.page.marginBottom,
        position: "relative",
      },
    });
    return styles;
  });

  protected readonly labelStyle = {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  };

  protected readonly summaryItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    return [
      {
        key: "Subtotal",
        value: `$${data.summary.subtotal.toFixed(2)}`,
      },
      { key: "Tax", value: `$${data.summary.tax.toFixed(2)}` },
      {
        key: "Total",
        keyStyle: { fontSize: 12, fontWeight: "bold" },
        value: `$${data.summary.total.toFixed(2)}`,
        valueStyle: { fontSize: 12, fontWeight: "bold" },
      },
    ];
  });
}

@Component({
  imports: [InvoiceClassicContent, PdfcnThemeProvider],
  selector: "pdf-invoice-classic",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-invoice-classic-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class InvoiceClassicDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<InvoiceClassicData>(sampleData);
}
