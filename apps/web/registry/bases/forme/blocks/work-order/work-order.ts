import { Component, computed, input } from "@angular/core";

import { PdfBadge } from "@/registry/bases/forme/components/badge/badge";
import type { BadgeVariant } from "@/registry/bases/forme/components/badge/badge";
import { PdfKeyValue } from "@/registry/bases/forme/components/key-value/key-value";
import type { KeyValueEntry } from "@/registry/bases/forme/components/key-value/key-value";
import { PdfPageFooter } from "@/registry/bases/forme/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { PdfImage } from "@/registry/bases/forme/components/pdf-image/pdf-image";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
import { PdfSignatureBlock } from "@/registry/bases/forme/components/signature/signature";
import type { SignatureSigner } from "@/registry/bases/forme/components/signature/signature";
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

import type { WorkOrderData, WorkOrderPriority } from "./work-order.types";

// Sample data — replace with your own props or data source
const sampleData: WorkOrderData = {
  accentColor: "#ea580c",
  companyName: "FixIt Pro Services",
  customer: {
    accountNumber: "ACC-10234",
    address: "789 Elm St, Austin, TX 78701",
    name: "Riverside Apartments",
    phone: "(512) 555-0199",
  },
  customerNotes: "Please service before end of month lease inspection.",
  date: "September 10, 2026",
  equipment: {
    description: "Commercial Dishwasher",
    location: "Kitchen — Unit 4B",
    makeModel: "Bosch SHP878ZD5N",
    serialNumber: "BSH-2024-88712",
  },
  jobType: "Repair",
  labor: [
    {
      description: "Diagnosis and repair",
      hours: 2.5,
      rate: 95,
      technician: "Mike Torres",
    },
  ],
  parts: [
    {
      description: "Drain Pump Assembly",
      partNumber: "PUMP-001",
      qty: 1,
      unitPrice: 89.99,
    },
    {
      description: "Drain Hose Kit",
      partNumber: "HOSE-012",
      qty: 1,
      unitPrice: 24.5,
    },
  ],
  priority: "High",
  taxRate: 0.0825,
  technician: "Mike Torres",
  technicianNotes:
    "Found clogged drain pump. Replaced pump and hose. Unit tested OK.",
  warrantyInfo: "90-day warranty on parts and labor.",
  workOrderNumber: "WO-2026-0452",
};

const PRIORITY_BADGE_VARIANT: Record<WorkOrderPriority, BadgeVariant> = {
  High: "warning",
  Low: "default",
  Medium: "info",
  Urgent: "destructive",
};

const workOrderLayout = (theme: PdfcnTheme, data: WorkOrderData) => {
  const styles = StyleSheet.create({
    checkbox: {
      borderColor: theme.colors.foreground,
      borderStyle: "solid",
      borderWidth: 1,
      height: 10,
      width: 10,
    },
    checkboxRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 6,
      marginTop: theme.spacing.componentGap,
    },
    col: {
      flex: 1,
      paddingRight: 15,
    },
    label: {
      fontSize: 9,
      fontWeight: "bold",
      marginBottom: 2,
    },
    page: {
      backgroundColor: theme.colors.background,
    },
    row: {
      flexDirection: "row",
    },
    section: {
      marginBottom: theme.spacing.componentGap,
    },
    sectionSpaced: {
      marginBottom: theme.spacing.componentGap,
      marginTop: theme.spacing.componentGap,
    },
    signature: {
      marginBottom: 0,
      marginTop: 0,
    },
  });

  const partsTotal = data.parts.reduce(
    (sum, part) => sum + part.qty * part.unitPrice,
    0
  );
  const laborTotal = data.labor.reduce(
    (sum, item) => sum + item.hours * item.rate,
    0
  );
  const taxRate = data.taxRate ?? 0;
  const tax = (partsTotal + laborTotal) * taxRate;
  const grandTotal = partsTotal + laborTotal + tax;

  const totals: KeyValueEntry[] = [
    { key: "Parts Total", value: `$${partsTotal.toFixed(2)}` },
    { key: "Labor Total", value: `$${laborTotal.toFixed(2)}` },
    {
      key: `Tax (${(taxRate * 100).toFixed(2)}%)`,
      value: `$${tax.toFixed(2)}`,
    },
    {
      key: "Grand Total",
      keyStyle: { fontSize: 12, fontWeight: "bold" },
      value: `$${grandTotal.toFixed(2)}`,
      valueStyle: { fontSize: 12, fontWeight: "bold" },
    },
  ];

  const signers: [SignatureSigner, SignatureSigner] = [
    { date: data.date, label: "Customer Signature" },
    {
      date: data.date,
      label: "Technician Signature",
      name: data.technician,
    },
  ];

  return {
    pageMargin: {
      bottom: theme.spacing.page.marginBottom,
      left: theme.spacing.page.marginLeft,
      right: theme.spacing.page.marginRight,
      top: theme.spacing.page.marginTop,
    },
    priorityRow: {
      ...styles.row,
      ...styles.section,
      alignItems: "center",
      justifyContent: "space-between",
    },
    rowSection: { ...styles.row, ...styles.section },
    signers,
    styles,
    totals,
  };
};

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    PdfBadge,
    PdfImage,
    PdfKeyValue,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfSignatureBlock,
    PdfText,
    TABLE,
  ],
  selector: "pdf-work-order-content",
  template: `
    @let data = this.data();
    @let l = layout();
    @let styles = l.styles;
    <forme-document [title]="'Work Order ' + data.workOrderNumber">
      <forme-page [margin]="l.pageMargin" size="A4">
        <pdf-page-footer
          [leftText]="data.warrantyInfo"
          rightText="Page 1 of 1"
          sticky
          [pagePadding]="25"
        />
        <forme-view [style]="styles.page">
          <ng-template #logo>
            <pdf-image [src]="data.companyLogo!" [style]="{ margin: 0 }" />
          </ng-template>
          <pdf-page-header
            variant="logo-left"
            [logo]="data.companyLogo ? logo : undefined"
            [title]="data.companyName"
            subtitle="Work Order"
            [rightText]="'WO #' + data.workOrderNumber"
            [rightSubText]="'Date: ' + data.date"
            [style]="styles.section"
          />

          <pdf-section noWrap spacing="none" [style]="l.priorityRow">
            <forme-view
              [style]="{ alignItems: 'center', flexDirection: 'row', gap: 8 }"
            >
              <pdf-text
                [style]="{ fontSize: 9, fontWeight: 'bold' }"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Priority</pdf-text
              >
              <pdf-badge
                [label]="data.priority"
                [variant]="PRIORITY_BADGE_VARIANT[data.priority]"
                size="sm"
              />
            </forme-view>
            <pdf-badge [label]="data.jobType" variant="outline" size="sm" />
          </pdf-section>

          <pdf-section noWrap spacing="none" [style]="l.rowSection">
            <forme-view [style]="styles.col">
              <pdf-text
                [style]="styles.label"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Customer</pdf-text
              >
              <pdf-text noMargin variant="xs">{{
                data.customer.name
              }}</pdf-text>
              <pdf-text noMargin variant="xs">{{
                data.customer.address
              }}</pdf-text>
              <pdf-text noMargin variant="xs">{{
                data.customer.phone
              }}</pdf-text>
              @if (data.customer.email) {
                <pdf-text noMargin variant="xs">{{
                  data.customer.email
                }}</pdf-text>
              }
              @if (data.customer.accountNumber) {
                <pdf-text noMargin variant="xs">{{
                  "Acct #: " + data.customer.accountNumber
                }}</pdf-text>
              }
            </forme-view>
            <forme-view [style]="styles.col">
              <pdf-text
                [style]="styles.label"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Job Info</pdf-text
              >
              <pdf-text noMargin variant="xs">{{
                "Technician: " + data.technician
              }}</pdf-text>
              <pdf-text noMargin variant="xs">{{
                "Job Type: " + data.jobType
              }}</pdf-text>
            </forme-view>
            <forme-view [style]="styles.col">
              <pdf-text
                [style]="styles.label"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Equipment</pdf-text
              >
              <pdf-text noMargin variant="xs">{{
                data.equipment.description
              }}</pdf-text>
              @if (data.equipment.makeModel) {
                <pdf-text noMargin variant="xs">{{
                  data.equipment.makeModel
                }}</pdf-text>
              }
              @if (data.equipment.serialNumber) {
                <pdf-text noMargin variant="xs">{{
                  "S/N: " + data.equipment.serialNumber
                }}</pdf-text>
              }
              @if (data.equipment.location) {
                <pdf-text noMargin variant="xs">{{
                  "Location: " + data.equipment.location
                }}</pdf-text>
              }
            </forme-view>
          </pdf-section>

          <pdf-section spacing="none">
            <pdf-text
              [style]="styles.label"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >Parts Used</pdf-text
            >
            <pdf-table variant="grid" zebraStripe>
              <pdf-table-header>
                <pdf-table-row header>
                  <pdf-table-cell>Part #</pdf-table-cell>
                  <pdf-table-cell>Description</pdf-table-cell>
                  <pdf-table-cell align="center">Qty</pdf-table-cell>
                  <pdf-table-cell align="right">Unit Price</pdf-table-cell>
                  <pdf-table-cell align="right">Total</pdf-table-cell>
                </pdf-table-row>
              </pdf-table-header>
              <pdf-table-body>
                @for (part of data.parts; track $index) {
                  <pdf-table-row>
                    <pdf-table-cell>{{ part.partNumber }}</pdf-table-cell>
                    <pdf-table-cell>{{ part.description }}</pdf-table-cell>
                    <pdf-table-cell align="center">{{
                      part.qty
                    }}</pdf-table-cell>
                    <pdf-table-cell align="right">{{
                      "$" + part.unitPrice.toFixed(2)
                    }}</pdf-table-cell>
                    <pdf-table-cell align="right">{{
                      "$" + (part.qty * part.unitPrice).toFixed(2)
                    }}</pdf-table-cell>
                  </pdf-table-row>
                }
              </pdf-table-body>
            </pdf-table>
          </pdf-section>

          <pdf-section spacing="none">
            <pdf-text
              [style]="styles.label"
              color="mutedForeground"
              transform="uppercase"
              noMargin
              >Labor</pdf-text
            >
            <pdf-table variant="grid" zebraStripe>
              <pdf-table-header>
                <pdf-table-row header>
                  <pdf-table-cell>Description</pdf-table-cell>
                  <pdf-table-cell>Technician</pdf-table-cell>
                  <pdf-table-cell align="center">Hours</pdf-table-cell>
                  <pdf-table-cell align="right">Rate</pdf-table-cell>
                  <pdf-table-cell align="right">Total</pdf-table-cell>
                </pdf-table-row>
              </pdf-table-header>
              <pdf-table-body>
                @for (item of data.labor; track $index) {
                  <pdf-table-row>
                    <pdf-table-cell>{{ item.description }}</pdf-table-cell>
                    <pdf-table-cell>{{ item.technician }}</pdf-table-cell>
                    <pdf-table-cell align="center">{{
                      item.hours
                    }}</pdf-table-cell>
                    <pdf-table-cell align="right">{{
                      "$" + item.rate.toFixed(2)
                    }}</pdf-table-cell>
                    <pdf-table-cell align="right">{{
                      "$" + (item.hours * item.rate).toFixed(2)
                    }}</pdf-table-cell>
                  </pdf-table-row>
                }
              </pdf-table-body>
            </pdf-table>
          </pdf-section>

          <pdf-section noWrap spacing="none" [style]="l.rowSection">
            <forme-view [style]="{ flex: 1, paddingRight: 15 }">
              @if (data.technicianNotes) {
                <forme-view>
                  <pdf-text
                    [style]="styles.label"
                    color="mutedForeground"
                    transform="uppercase"
                    noMargin
                    >Technician Notes</pdf-text
                  >
                  <pdf-text noMargin variant="xs">{{
                    data.technicianNotes
                  }}</pdf-text>
                </forme-view>
              }
            </forme-view>
            <forme-view [style]="{ marginLeft: 'auto', width: 200 }">
              <pdf-key-value
                size="sm"
                [dividerThickness]="1"
                [items]="l.totals"
                divided
              />
            </forme-view>
          </pdf-section>

          @if (data.customerNotes) {
            <pdf-section spacing="none" [style]="styles.sectionSpaced">
              <pdf-text
                [style]="styles.label"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Customer Notes</pdf-text
              >
              <pdf-text noMargin variant="xs">{{
                data.customerNotes
              }}</pdf-text>
            </pdf-section>
          }

          <pdf-section spacing="none">
            <pdf-signature-block
              variant="double"
              [signers]="l.signers"
              [style]="styles.signature"
            />
            <forme-view [style]="styles.checkboxRow">
              <forme-view [style]="styles.checkbox" />
              <pdf-text noMargin variant="xs"
                >Customer approves work performed and charges above</pdf-text
              >
            </forme-view>
          </pdf-section>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class WorkOrderContent {
  readonly data = input.required<WorkOrderData>();

  private readonly theme = injectPdfcnTheme();

  protected readonly PRIORITY_BADGE_VARIANT = PRIORITY_BADGE_VARIANT;

  protected readonly layout = computed(() =>
    workOrderLayout(this.theme(), this.data())
  );
}

@Component({
  imports: [PdfcnThemeProvider, WorkOrderContent],
  selector: "pdf-work-order",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-work-order-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class WorkOrderDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<WorkOrderData>(sampleData);
}
