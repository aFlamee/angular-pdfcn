import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input } from "@angular/core";

import { PdfImage } from "@/registry/bases/takumi/components/pdf-image/pdf-image";
import { PdfQRCode } from "@/registry/bases/takumi/components/qrcode/qrcode";
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
import { resolveColor } from "@/registry/bases/takumi/lib/resolve-color";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import type {
  ShippingLabelAddress,
  ShippingLabelData,
} from "./shipping-label.types";

// Sample data — replace with your own props or data source
const sampleData: ShippingLabelData = {
  carrier: "UPS",
  dimensions: '12" x 8" x 6"',
  from: {
    address: "456 Industrial Blvd",
    city: "Los Angeles",
    country: "USA",
    name: "ACME Corporation",
    state: "CA",
    zip: "90001",
  },
  handlingLabels: ["FRAGILE", "THIS SIDE UP"],
  packageCount: 1,
  postage: "$18.40",
  serviceLevel: "Ground",
  to: {
    address: "123 Main Street, Apt 4B",
    city: "New York",
    country: "USA",
    name: "John Doe",
    phone: "(503) 555-0142",
    state: "NY",
    zip: "10001",
  },
  trackingNumber: "TRACK123456789US",
  weight: "2.5 kg",
};

// Standard 4" x 6" shipping label, expressed in PDF points (72 dpi)
const LABEL_SIZE = { height: 432, width: 288 };

const formatCityLine = (party: ShippingLabelAddress) => {
  const cityStateZip = `${party.city}, ${party.state} ${party.zip}`;
  return party.country ? `${cityStateZip}, ${party.country}` : cityStateZip;
};

const formatStreetLine = (party: ShippingLabelAddress) => party.address;

const shippingLabelLayout = (theme: PdfcnTheme, data: ShippingLabelData) => {
  const accent = resolveColor(
    data.accentColor ?? theme.colors.primary,
    theme.colors
  );

  const detailRows = [
    ...(data.weight ? [{ key: "Weight", value: data.weight }] : []),
    ...(data.dimensions ? [{ key: "Dimensions", value: data.dimensions }] : []),
    ...(typeof data.packageCount === "number"
      ? [{ key: "Packages", value: `${data.packageCount}` }]
      : []),
    { key: "Postage", value: data.postage ?? "PAID" },
  ];

  const styles = StyleSheet.create({
    addresses: { flex: 1, flexDirection: "row" },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
    },
    barcodeArea: { alignItems: "center", marginTop: 10 },
    carrierName: { fontSize: 16, fontWeight: "bold" },
    fromColumn: { flex: 1, paddingLeft: 12 },
    handlingTag: {
      alignItems: "center",
      backgroundColor: theme.colors.foreground,
      justifyContent: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    handlingTagText: {
      color: theme.colors.background,
      fontSize: 8,
      fontWeight: "bold",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    headerRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    label: {
      borderColor: theme.colors.foreground,
      borderStyle: "solid",
      borderWidth: 2,
      flex: 1,
      padding: 10,
    },
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      flexDirection: "column",
      height: LABEL_SIZE.height,
      overflow: "hidden",
      padding: 8,
      width: LABEL_SIZE.width,
    },
    rule: {
      backgroundColor: theme.colors.foreground,
      height: 2,
      marginVertical: 6,
    },
    sectionLabel: {
      color: accent,
      fontSize: 8,
      fontWeight: "bold",
      letterSpacing: 1,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    serviceRight: { alignItems: "flex-end" },
    shipToColumn: {
      borderRightColor: theme.colors.foreground,
      borderRightStyle: "solid",
      borderRightWidth: 2,
      flex: 1.4,
      paddingRight: 12,
    },
    table: {
      borderColor: theme.colors.foreground,
      borderStyle: "solid",
      borderWidth: 2,
    },
    tableKey: {
      color: theme.colors.mutedForeground,
      fontSize: 8,
      fontWeight: "bold",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      width: 84,
    },
    tableRow: {
      alignItems: "center",
      borderBottomColor: theme.colors.border,
      borderBottomStyle: "solid",
      borderBottomWidth: 1,
      flexDirection: "row",
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tableRowLast: {
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tableValue: { flex: 1 },
    trackingText: {
      fontWeight: "bold",
      letterSpacing: 2,
      marginTop: 6,
      textTransform: "uppercase",
    },
  });

  return { detailRows, styles };
};

@Component({
  imports: [
    NgTemplateOutlet,
    PdfImage,
    PdfQRCode,
    PdfText,
    TakumiDocument,
    TakumiPage,
    TakumiView,
  ],
  selector: "pdf-shipping-label-content",
  template: `
    @let data = this.data();
    @let styles = this.layout().styles;
    @let detailRows = this.layout().detailRows;
    <!-- Shared address block — same treatment for both parties (10pt, bold name) -->
    <ng-template #addressLines let-party>
      <pdf-text noMargin variant="xs" weight="bold">{{ party.name }}</pdf-text>
      <pdf-text noMargin variant="xs">{{ formatStreetLine(party) }}</pdf-text>
      <pdf-text noMargin variant="xs">{{ formatCityLine(party) }}</pdf-text>
      @if (party.phone) {
        <pdf-text noMargin variant="xs" color="mutedForeground">{{
          party.phone
        }}</pdf-text>
      }
    </ng-template>
    <takumi-document [title]="'Shipping Label ' + data.trackingNumber">
      <takumi-page [size]="LABEL_SIZE" [style]="styles.page">
        <takumi-view [style]="styles.label">
          <takumi-view [style]="styles.headerRow">
            <pdf-text noMargin [style]="styles.carrierName">{{
              data.carrier
            }}</pdf-text>
            <takumi-view [style]="styles.serviceRight">
              <pdf-text noMargin [style]="styles.sectionLabel">{{
                data.serviceLevel
              }}</pdf-text>
            </takumi-view>
          </takumi-view>

          <takumi-view [style]="styles.rule" />

          <takumi-view [style]="styles.addresses">
            <takumi-view [style]="styles.shipToColumn">
              <pdf-text noMargin [style]="styles.sectionLabel"
                >Ship To</pdf-text
              >
              <ng-container
                *ngTemplateOutlet="
                  addressLines;
                  context: { $implicit: data.to }
                "
              />
            </takumi-view>
            <takumi-view [style]="styles.fromColumn">
              <pdf-text noMargin [style]="styles.sectionLabel">From</pdf-text>
              <ng-container
                *ngTemplateOutlet="
                  addressLines;
                  context: { $implicit: data.from }
                "
              />
            </takumi-view>
          </takumi-view>

          <takumi-view [style]="styles.rule" />

          <takumi-view [style]="styles.table">
            @for (row of detailRows; track row.key; let index = $index) {
              <takumi-view
                [style]="
                  index === detailRows.length - 1
                    ? styles.tableRowLast
                    : styles.tableRow
                "
              >
                <pdf-text noMargin [style]="styles.tableKey">{{
                  row.key
                }}</pdf-text>
                <pdf-text noMargin [style]="styles.tableValue" variant="xs">{{
                  row.value
                }}</pdf-text>
              </takumi-view>
            }
          </takumi-view>

          @if (data.handlingLabels && data.handlingLabels.length > 0) {
            <takumi-view [style]="styles.badgesRow">
              @for (label of data.handlingLabels; track $index) {
                <takumi-view [style]="styles.handlingTag">
                  <pdf-text noMargin [style]="styles.handlingTagText">{{
                    label
                  }}</pdf-text>
                </takumi-view>
              }
            </takumi-view>
          }

          <takumi-view [style]="styles.barcodeArea">
            @if (data.barcodeUrl) {
              <pdf-image
                fit="contain"
                [height]="72"
                [src]="data.barcodeUrl"
                width="100%"
              />
            } @else {
              <pdf-qrcode
                backgroundColor="#ffffff"
                color="#000000"
                [size]="80"
                [value]="data.trackingNumber"
              />
            }
            <pdf-text
              noMargin
              [style]="styles.trackingText"
              variant="xs"
              weight="bold"
              >{{ data.trackingNumber }}</pdf-text
            >
          </takumi-view>
        </takumi-view>
      </takumi-page>
    </takumi-document>
  `,
})
export class ShippingLabelContent {
  readonly data = input.required<ShippingLabelData>();

  private readonly theme = injectPdfcnTheme();

  protected readonly LABEL_SIZE = LABEL_SIZE;
  protected readonly formatStreetLine = formatStreetLine;
  protected readonly formatCityLine = formatCityLine;

  protected readonly layout = computed(() =>
    shippingLabelLayout(this.theme(), this.data())
  );
}

@Component({
  imports: [PdfcnThemeProvider, ShippingLabelContent],
  selector: "pdf-shipping-label",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-shipping-label-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class ShippingLabelDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<ShippingLabelData>(sampleData);
}
