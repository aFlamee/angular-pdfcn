import { Component, computed, input } from "@angular/core";

import { PdfKeyValue } from "@/registry/bases/forme/components/key-value/key-value";
import type { KeyValueEntry } from "@/registry/bases/forme/components/key-value/key-value";
import { PdfPageFooter } from "@/registry/bases/forme/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { PdfImage } from "@/registry/bases/forme/components/pdf-image/pdf-image";
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

import type { PackingSlipProps, PackingSlipSender } from "./packing-slip.types";

// Sample data — replace with your own props or data source
const sampleData: PackingSlipProps = {
  accentColor: "#059669",
  companyName: "Acme Store",
  customerService: "support@acme-store.com",
  items: [
    {
      name: "Widget Pro",
      qtyOrdered: 2,
      qtyPacked: 2,
      sku: "WP-001",
      unitPrice: 49.99,
    },
    {
      name: "Gadget Lite",
      qtyOrdered: 1,
      qtyPacked: 1,
      sku: "GL-010",
      unitPrice: 29.99,
    },
    {
      name: "Cable Kit",
      qtyOrdered: 3,
      qtyPacked: 2,
      sku: "CK-204",
      unitPrice: 9.5,
    },
  ],
  orderDate: "Sep 10, 2026",
  orderNumber: "ORD-2026-0891",
  poNumber: "PO-4471",
  returnsPolicy: "Returns accepted within 30 days with original packaging.",
  shipFrom: {
    address: "100 Industrial Blvd",
    city: "Seattle",
    name: "Acme Warehouse",
    state: "WA",
    zip: "98101",
  },
  shipTo: {
    address: "456 Oak Ave",
    city: "Portland",
    name: "Jane Doe",
    phone: "(503) 555-0142",
    state: "OR",
    zip: "97201",
  },
  shipping: {
    carrier: "UPS",
    estimatedDelivery: "Sep 15, 2026",
    method: "Ground",
    trackingNumber: "1Z999AA10123456784",
  },
  thankYouMessage: "Thank you for your order!",
  totalPackages: 1,
  totalWeight: "3.2 kg",
};

const formatAddress = (a: PackingSlipSender & { country?: string }) =>
  `${a.address}, ${a.city}, ${a.state} ${a.zip}${a.country ? `, ${a.country}` : ""}`;

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    PdfImage,
    PdfKeyValue,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfText,
    TABLE,
  ],
  selector: "pdf-packing-slip-content",
  template: `
    @let data = this.data();
    @let styles = this.styles();
    <forme-document [title]="'Packing Slip ' + data.orderNumber">
      <forme-page
        size="A4"
        [margin]="{ bottom: 25, left: 56, right: 56, top: 56 }"
      >
        <pdf-page-footer
          [leftText]="data.customerService ?? data.companyName"
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
            title="PACKING SLIP"
            [subtitle]="data.companyName"
            [rightText]="data.orderNumber"
            [rightSubText]="'Order Date: ' + data.orderDate"
            [style]="{ marginBottom: 0 }"
          />
          <pdf-section noWrap [style]="{ flexDirection: 'row' }">
            <forme-view [style]="{ flex: 1, paddingRight: 15 }">
              <pdf-text
                [style]="styles.columnHeading"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Ship To</pdf-text
              >
              <pdf-text noMargin variant="xs">{{ data.shipTo.name }}</pdf-text>
              <pdf-text noMargin variant="xs">{{
                formatAddress(data.shipTo)
              }}</pdf-text>
              @if (data.shipTo.phone) {
                <pdf-text noMargin variant="xs">{{
                  data.shipTo.phone
                }}</pdf-text>
              }
            </forme-view>
            <forme-view [style]="{ flex: 1, paddingRight: 15 }">
              <pdf-text
                [style]="styles.columnHeading"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >From</pdf-text
              >
              <pdf-text noMargin variant="xs">{{
                data.shipFrom.name
              }}</pdf-text>
              <pdf-text noMargin variant="xs">{{
                formatAddress(data.shipFrom)
              }}</pdf-text>
            </forme-view>
            <forme-view [style]="{ flex: 1, paddingRight: 15 }">
              <pdf-text
                [style]="styles.columnHeading"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Order</pdf-text
              >
              <pdf-text noMargin variant="xs">{{ data.orderNumber }}</pdf-text>
              @if (data.poNumber) {
                <pdf-text noMargin variant="xs">{{
                  "PO: " + data.poNumber
                }}</pdf-text>
              }
            </forme-view>
          </pdf-section>
          <pdf-table variant="grid" zebraStripe>
            <pdf-table-header>
              <pdf-table-row header>
                <pdf-table-cell>Item</pdf-table-cell>
                <pdf-table-cell align="center">SKU</pdf-table-cell>
                <pdf-table-cell align="center">Packed</pdf-table-cell>
                <pdf-table-cell align="center">Ordered</pdf-table-cell>
                <pdf-table-cell align="right">Unit Price</pdf-table-cell>
                <pdf-table-cell align="right">Total</pdf-table-cell>
              </pdf-table-row>
            </pdf-table-header>
            <pdf-table-body>
              @for (item of data.items; track item.sku) {
                <pdf-table-row>
                  <pdf-table-cell>{{ item.name }}</pdf-table-cell>
                  <pdf-table-cell align="center">{{ item.sku }}</pdf-table-cell>
                  <pdf-table-cell align="center">{{
                    item.qtyPacked
                  }}</pdf-table-cell>
                  <pdf-table-cell align="center">{{
                    item.qtyOrdered
                  }}</pdf-table-cell>
                  <pdf-table-cell align="right">{{
                    "$" + item.unitPrice.toFixed(2)
                  }}</pdf-table-cell>
                  <pdf-table-cell align="right">{{
                    "$" + (item.qtyPacked * item.unitPrice).toFixed(2)
                  }}</pdf-table-cell>
                </pdf-table-row>
              }
            </pdf-table-body>
          </pdf-table>
          <pdf-section noWrap [style]="{ flexDirection: 'row', marginTop: 16 }">
            <forme-view [style]="{ flex: 1, paddingRight: 15 }">
              <pdf-text
                [style]="styles.columnHeading"
                color="mutedForeground"
                transform="uppercase"
                noMargin
                >Shipping</pdf-text
              >
              <pdf-text noMargin variant="xs">{{
                data.shipping.carrier + " — " + data.shipping.method
              }}</pdf-text>
              <pdf-text noMargin variant="xs">{{
                "Tracking: " + data.shipping.trackingNumber
              }}</pdf-text>
              @if (data.shipping.estimatedDelivery) {
                <pdf-text noMargin variant="xs">{{
                  "Est. Delivery: " + data.shipping.estimatedDelivery
                }}</pdf-text>
              }
            </forme-view>
            <forme-view [style]="{ marginLeft: 'auto', width: 220 }">
              <pdf-key-value
                size="sm"
                [dividerThickness]="1"
                [items]="summaryItems()"
                divided
              />
            </forme-view>
          </pdf-section>
          @if (data.thankYouMessage || data.returnsPolicy) {
            <pdf-section
              spacing="sm"
              variant="highlight"
              [accentColor]="data.accentColor"
            >
              @if (data.thankYouMessage) {
                <pdf-text variant="sm" weight="medium" noMargin>{{
                  data.thankYouMessage
                }}</pdf-text>
              }
              @if (data.returnsPolicy) {
                <pdf-text variant="xs" color="mutedForeground" noMargin>{{
                  data.returnsPolicy
                }}</pdf-text>
              }
            </pdf-section>
          }
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class PackingSlipContent {
  readonly data = input.required<PackingSlipProps>();

  private readonly theme = injectPdfcnTheme();

  protected readonly formatAddress = formatAddress;

  protected readonly styles = computed(() => {
    const theme = this.theme();
    const styles = StyleSheet.create({
      columnHeading: {
        fontSize: 9,
        fontWeight: "bold",
        marginBottom: 2,
      },
      page: {
        backgroundColor: theme.colors.background,
      },
    });
    return styles;
  });

  protected readonly summaryItems = computed((): KeyValueEntry[] => {
    const data = this.data();
    const totalPacked = data.items.reduce(
      (sum, item) => sum + item.qtyPacked,
      0
    );
    const totalOrdered = data.items.reduce(
      (sum, item) => sum + item.qtyOrdered,
      0
    );

    const summaryItems = [
      { key: "Items Packed", value: `${totalPacked} of ${totalOrdered}` },
      ...(data.totalPackages === undefined
        ? []
        : [{ key: "Packages", value: `${data.totalPackages}` }]),
      ...(data.totalWeight
        ? [{ key: "Total Weight", value: data.totalWeight }]
        : []),
    ];
    return summaryItems;
  });
}

@Component({
  imports: [PackingSlipContent, PdfcnThemeProvider],
  selector: "pdf-packing-slip",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-packing-slip-content [data]="merged()" />
    </pdf-theme-provider>
  `,
})
export class PackingSlipDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<Partial<PackingSlipProps>>();

  protected readonly merged = computed(
    (): PackingSlipProps => ({ ...sampleData, ...this.data() })
  );
}
