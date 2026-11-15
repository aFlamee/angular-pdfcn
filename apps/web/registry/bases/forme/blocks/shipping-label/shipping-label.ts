import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input } from "@angular/core";

import { PdfQRCode } from "@/registry/bases/forme/components/qrcode/qrcode";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import {
  PdfcnThemeProvider,
  injectPdfcnTheme,
} from "@/registry/bases/forme/components/theme-provider";
import {
  FormeDocument,
  FormeImage,
  FormePage,
  FormeView,
  StyleSheet,
} from "@/registry/bases/forme/lib/pdf-primitives";
import { resolveColor } from "@/registry/bases/forme/lib/resolve-color";
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

// Quiet zone kept clear of the printed label frame, plus the frame itself
const LABEL_MARGIN = 8;
const LABEL_BORDER = 2;
const LABEL_PADDING = 10;

// Forme scales an image with the Image element's own width/height (style
// dimensions only size the box), so the barcode is measured in points from
// the label's content box instead of a percentage width.
const BARCODE_WIDTH =
  LABEL_SIZE.width - 2 * (LABEL_MARGIN + LABEL_BORDER + LABEL_PADDING);
const BARCODE_HEIGHT = 72;

const formatCityLine = (party: ShippingLabelAddress) => {
  const cityStateZip = `${party.city}, ${party.state} ${party.zip}`;
  return party.country ? `${cityStateZip}, ${party.country}` : cityStateZip;
};

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
      borderWidth: LABEL_BORDER,
      flex: 1,
      padding: LABEL_PADDING,
    },
    page: {
      backgroundColor: theme.colors.background,
      flex: 1,
      flexDirection: "column",
      height: LABEL_SIZE.height - LABEL_MARGIN * 2,
      overflow: "hidden",
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
      borderRightWidth: 2,
      flex: 1.4,
      paddingRight: 12,
    },
    table: {
      borderColor: theme.colors.foreground,
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
    FormeDocument,
    FormeImage,
    FormePage,
    FormeView,
    NgTemplateOutlet,
    PdfQRCode,
    PdfText,
  ],
  selector: "pdf-shipping-label-content",
  template: `
    @let data = this.data();
    @let styles = this.layout().styles;
    @let detailRows = this.layout().detailRows;
    <!-- Shared address block — same treatment for both parties (10pt, bold name) -->
    <ng-template #addressLines let-party>
      <forme-view>
        <pdf-text noMargin variant="xs" weight="bold">{{
          party.name
        }}</pdf-text>
        <pdf-text noMargin variant="xs">{{ party.address }}</pdf-text>
        <pdf-text noMargin variant="xs">{{ formatCityLine(party) }}</pdf-text>
        @if (party.phone) {
          <pdf-text noMargin variant="xs" color="mutedForeground">{{
            party.phone
          }}</pdf-text>
        }
      </forme-view>
    </ng-template>
    <forme-document [title]="'Shipping Label ' + data.trackingNumber">
      <forme-page [size]="LABEL_SIZE" [margin]="LABEL_MARGIN">
        <forme-view [style]="styles.page">
          <forme-view [style]="styles.label">
            <forme-view [style]="styles.headerRow">
              <pdf-text noMargin [style]="styles.carrierName">{{
                data.carrier
              }}</pdf-text>
              <forme-view [style]="styles.serviceRight">
                <pdf-text noMargin [style]="styles.sectionLabel">{{
                  data.serviceLevel
                }}</pdf-text>
              </forme-view>
            </forme-view>

            <forme-view [style]="styles.rule" />

            <forme-view [style]="styles.addresses">
              <forme-view [style]="styles.shipToColumn">
                <pdf-text noMargin [style]="styles.sectionLabel"
                  >Ship To</pdf-text
                >
                <ng-container
                  *ngTemplateOutlet="
                    addressLines;
                    context: { $implicit: data.to }
                  "
                />
              </forme-view>
              <forme-view [style]="styles.fromColumn">
                <pdf-text noMargin [style]="styles.sectionLabel">From</pdf-text>
                <ng-container
                  *ngTemplateOutlet="
                    addressLines;
                    context: { $implicit: data.from }
                  "
                />
              </forme-view>
            </forme-view>

            <forme-view [style]="styles.rule" />

            <forme-view [style]="styles.table">
              @for (row of detailRows; track row.key; let index = $index) {
                <forme-view
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
                </forme-view>
              }
            </forme-view>

            @if (data.handlingLabels && data.handlingLabels.length > 0) {
              <forme-view [style]="styles.badgesRow">
                @for (label of data.handlingLabels; track $index) {
                  <forme-view [style]="styles.handlingTag">
                    <pdf-text noMargin [style]="styles.handlingTagText">{{
                      label
                    }}</pdf-text>
                  </forme-view>
                }
              </forme-view>
            }

            <forme-view [style]="styles.barcodeArea">
              @if (data.barcodeUrl) {
                <forme-image
                  [height]="BARCODE_HEIGHT"
                  [src]="data.barcodeUrl"
                  [width]="BARCODE_WIDTH"
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
            </forme-view>
          </forme-view>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class ShippingLabelContent {
  readonly data = input.required<ShippingLabelData>();

  private readonly theme = injectPdfcnTheme();

  protected readonly LABEL_SIZE = LABEL_SIZE;
  protected readonly LABEL_MARGIN = LABEL_MARGIN;
  protected readonly BARCODE_WIDTH = BARCODE_WIDTH;
  protected readonly BARCODE_HEIGHT = BARCODE_HEIGHT;
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
