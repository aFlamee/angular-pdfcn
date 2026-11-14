import { Component, computed, input } from "@angular/core";

import { PdfKeyValue } from "@/registry/bases/takumi/components/key-value/key-value";
import type { KeyValueEntry } from "@/registry/bases/takumi/components/key-value/key-value";
import { PdfPageFooter } from "@/registry/bases/takumi/components/page-footer/page-footer";
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

import type { InvoiceConsultantData } from "./invoice-consultant.types";

const sampleData: InvoiceConsultantData = {
  client: {
    address: "500 Tech Park, Suite 200",
    company: "Acme Technologies",
    email: "sarah.johnson@acmetech.com",
    name: "Sarah Johnson",
  },
  companyAddress: "Nagpur, IN · hello@pdfcn.app",
  companyName: "pdfcn",
  consultant: {
    email: "john.smith@pdfcn.app",
    name: "John Smith",
    title: "Senior Technical Consultant",
  },
  dueDate: "March 28, 2026",
  invoiceDate: "February 26, 2026",
  invoiceNumber: "INV-2026-006",
  notes:
    "Services rendered for February 2026. All hours verified and approved by client.",
  paymentTerms: {
    dueDate: "March 28, 2026",
    method: "Bank Transfer / Check",
  },
  projectRef: "PROJ-2026-ACME-001",
  services: [
    { description: "Architecture Review & Planning", hours: 16, rate: 175 },
    { description: "Code Review & Optimization", hours: 24, rate: 150 },
    { description: "Technical Documentation", hours: 12, rate: 125 },
    { description: "Team Training & Knowledge Transfer", hours: 8, rate: 200 },
  ],
  subtitle: "Professional Consulting Services",
  summary: {
    subtotal: 9500,
    tax: 475,
    total: 9975,
    totalHours: 60,
  },
};

@Component({
  imports: [
    TakumiDocument,
    TakumiPage,
    TakumiView,
    PdfKeyValue,
    PdfPageFooter,
    PdfSection,
    PdfText,
    TABLE,
  ],
  selector: "pdf-invoice-consultant-content",
  template: `
    @let data = this.data();
    @let s = styles();
    <takumi-document [title]="'Invoice ' + data.invoiceNumber">
      <takumi-page size="A4" [style]="s.page">
        <takumi-view [style]="s.headerRow">
          <takumi-view [style]="s.companyInfo">
            <pdf-text variant="xl" weight="bold" noMargin>{{
              data.companyName
            }}</pdf-text>
            <pdf-text variant="sm" color="mutedForeground" noMargin>{{
              data.subtitle
            }}</pdf-text>
            <pdf-text variant="xs" color="mutedForeground" noMargin>{{
              data.companyAddress
            }}</pdf-text>
          </takumi-view>
          <takumi-view [style]="s.invoiceInfo">
            <pdf-text
              variant="xs"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >Invoice</pdf-text
            >
            <pdf-text variant="lg" weight="bold" noMargin>{{
              data.invoiceNumber
            }}</pdf-text>
            <pdf-text variant="xs" color="mutedForeground" noMargin>{{
              data.invoiceDate
            }}</pdf-text>
            <pdf-text variant="xs" color="mutedForeground" noMargin
              >Due: {{ data.dueDate }}</pdf-text
            >
          </takumi-view>
        </takumi-view>
        @if (data.projectRef) {
          <takumi-view [style]="s.projectRef">
            <pdf-text
              variant="xs"
              weight="semibold"
              color="mutedForeground"
              noMargin
              >Project Reference:</pdf-text
            >
            <pdf-text variant="xs" weight="bold" noMargin>{{
              data.projectRef
            }}</pdf-text>
          </takumi-view>
        }
        <takumi-view [style]="s.partiesRow">
          <takumi-view [style]="s.partyColumn">
            <pdf-text [style]="s.partyLabel" noMargin
              >From (Consultant)</pdf-text
            >
            <pdf-text variant="sm" weight="semibold" noMargin>{{
              data.consultant.name
            }}</pdf-text>
            <pdf-text variant="xs" noMargin color="mutedForeground">{{
              data.consultant.title
            }}</pdf-text>
            <pdf-text variant="xs" noMargin color="mutedForeground">{{
              data.consultant.email
            }}</pdf-text>
          </takumi-view>
          <takumi-view [style]="s.partyColumn">
            <pdf-text [style]="s.partyLabel" noMargin
              >Bill To (Client)</pdf-text
            >
            <pdf-text variant="sm" weight="semibold" noMargin>{{
              data.client.name
            }}</pdf-text>
            <pdf-text variant="xs" noMargin color="mutedForeground">{{
              data.client.company
            }}</pdf-text>
            <pdf-text variant="xs" noMargin color="mutedForeground">{{
              data.client.address
            }}</pdf-text>
            <pdf-text variant="xs" noMargin color="mutedForeground">{{
              data.client.email
            }}</pdf-text>
          </takumi-view>
        </takumi-view>
        <pdf-table variant="line">
          <pdf-table-header>
            <pdf-table-row header>
              <pdf-table-cell>Service Description</pdf-table-cell>
              <pdf-table-cell align="center">Hours</pdf-table-cell>
              <pdf-table-cell align="right">Rate ($/hr)</pdf-table-cell>
              <pdf-table-cell align="right">Amount</pdf-table-cell>
            </pdf-table-row>
          </pdf-table-header>
          <pdf-table-body>
            @for (service of data.services; track $index) {
              <pdf-table-row>
                <pdf-table-cell>{{ service.description }}</pdf-table-cell>
                <pdf-table-cell align="center">{{
                  service.hours
                }}</pdf-table-cell>
                <pdf-table-cell align="right">{{
                  "$" + service.rate
                }}</pdf-table-cell>
                <pdf-table-cell align="right">{{
                  "$" + (service.hours * service.rate).toLocaleString()
                }}</pdf-table-cell>
              </pdf-table-row>
            }
          </pdf-table-body>
        </pdf-table>
        <pdf-section noWrap [style]="s.summaryRow">
          <takumi-view [style]="s.hoursBox">
            <takumi-view [style]="s.hoursBadge">
              <pdf-text [style]="hoursTextStyle()" noMargin
                >Total Hours: {{ data.summary.totalHours }}</pdf-text
              >
            </takumi-view>
            <pdf-text
              variant="xs"
              color="mutedForeground"
              [style]="{ marginTop: 8 }"
              >Payment: {{ data.paymentTerms.method }}</pdf-text
            >
          </takumi-view>
          <takumi-view [style]="s.totalsBox">
            <pdf-key-value
              size="sm"
              [dividerThickness]="1"
              [items]="summaryItems()"
              divided
            />
          </takumi-view>
        </pdf-section>
        @if (data.notes) {
          <takumi-view [style]="s.calloutNote">
            <pdf-text variant="xs" color="mutedForeground">{{
              data.notes
            }}</pdf-text>
          </takumi-view>
        }
        <pdf-page-footer
          leftText="Professional services invoice – Please retain for records"
          rightText="Page 1 of 1"
          sticky
          [pagePadding]="25"
        />
      </takumi-page>
    </takumi-document>
  `,
})
export class InvoiceConsultantContent {
  readonly data = input.required<InvoiceConsultantData>();

  private readonly theme = injectPdfcnTheme();

  protected readonly styles = computed(() => {
    const theme = this.theme();
    return StyleSheet.create({
      calloutNote: {
        backgroundColor: theme.colors.muted,
        borderLeftColor: theme.colors.info,
        borderLeftStyle: "solid",
        borderLeftWidth: 3,
        marginTop: 16,
        paddingLeft: 12,
        paddingVertical: 8,
      },
      companyInfo: {
        flex: 1,
      },
      headerRow: {
        alignItems: "flex-start",
        borderBottomColor: theme.colors.primary,
        borderBottomStyle: "solid",
        borderBottomWidth: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: theme.spacing.sectionGap,
        paddingBottom: theme.spacing.componentGap,
      },
      hoursBadge: {
        alignSelf: "flex-start",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.primitives.borderRadius.sm,
        color: theme.colors.primaryForeground,
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
      hoursBox: {
        flex: 1,
        paddingRight: 24,
      },
      invoiceInfo: {
        alignItems: "flex-end",
      },
      page: {
        backgroundColor: theme.colors.background,
        boxSizing: "border-box",
        minHeight: 841,
        padding: theme.spacing.page.marginTop,
        paddingBottom: theme.spacing.page.marginBottom,
        position: "relative",
      },
      partiesRow: {
        flexDirection: "row",
        gap: 40,
        marginBottom: theme.spacing.sectionGap,
      },
      partyColumn: {
        flex: 1,
      },
      partyLabel: {
        borderBottomColor: theme.colors.border,
        borderBottomStyle: "solid",
        borderBottomWidth: 1,
        color: theme.colors.primary,
        fontSize: 9,
        fontWeight: "bold",
        letterSpacing: 0.6,
        marginBottom: 6,
        paddingBottom: 4,
        textTransform: "uppercase",
      },
      projectRef: {
        alignItems: "center",
        backgroundColor: theme.colors.muted,
        borderRadius: theme.primitives.borderRadius.sm,
        flexDirection: "row",
        gap: 8,
        marginBottom: theme.spacing.sectionGap,
        paddingHorizontal: 10,
        paddingVertical: 6,
      },
      summaryRow: {
        flexDirection: "row",
        marginTop: 20,
      },
      totalsBox: {
        width: 250,
      },
    });
  });

  protected readonly hoursTextStyle = computed(() => ({
    color: this.theme().colors.primaryForeground,
    fontSize: 9,
    fontWeight: "bold",
  }));

  protected readonly summaryItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    const theme = this.theme();
    return [
      {
        key: "Subtotal",
        value: `$${data.summary.subtotal.toLocaleString()}`,
      },
      { key: "Tax (5%)", value: `$${data.summary.tax.toFixed(2)}` },
      {
        key: "Amount Due",
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
  imports: [InvoiceConsultantContent, PdfcnThemeProvider],
  selector: "pdf-invoice-consultant",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-invoice-consultant-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class InvoiceConsultantDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<InvoiceConsultantData>(sampleData);
}
