import { Component, computed, input } from "@angular/core";

import { PdfImage } from "@/registry/bases/takumi/components/pdf-image/pdf-image";
import { PdfSection } from "@/registry/bases/takumi/components/section/section";
import { PdfText } from "@/registry/bases/takumi/components/text/text";
import {
  PdfcnThemeProvider,
  injectPdfcnTheme,
} from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiView,
  StyleSheet,
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import type { GiftCertificateData } from "./gift-certificate.types";

// Sample data — replace with your own props or data source
const sampleData: GiftCertificateData = {
  accentColor: "#000000",
  amount: 50,
  certificateCode: "PDFCN-GC-2026-00891",
  companyLogo: "/favicon.png",
  companyName: "pdfcn",
  currency: "USD",
  expiryDate: "March 31, 2027",
  message: "Happy Birthday! Enjoy a coffee on us.",
  recipientName: "Sarah",
  redemptionInstructions: "Present this certificate at any pdfcn location.",
  senderName: "Mom & Dad",
  terms: "No cash value. Non-refundable. One use per visit.",
};

const giftCertificateLayout = (
  theme: PdfcnTheme,
  data: GiftCertificateData
) => {
  const accentColor = data.accentColor || "#000000";
  const currencySymbol = data.currency === "USD" ? "$" : data.currency || "$";

  const styles = StyleSheet.create({
    amount: {
      color: accentColor,
      fontSize: 36,
      fontWeight: "bold",
    },
    amountContainer: {
      alignItems: "center",
      backgroundColor: theme.colors.muted,
      borderColor: accentColor,
      borderRadius: theme.primitives.borderRadius.md,
      borderStyle: "solid",
      borderWidth: 2,
      marginBottom: 10,
      marginTop: 10,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    code: {
      color: theme.colors.foreground,
      fontFamily: "Courier",
      fontSize: 13,
      fontWeight: "bold",
      letterSpacing: 1.2,
    },
    codeBox: {
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderRadius: theme.primitives.borderRadius.sm,
      borderStyle: "solid",
      borderWidth: 1,
      marginBottom: 8,
      marginTop: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    decorativeBorder: {
      borderColor: accentColor,
      borderRadius: theme.primitives.borderRadius.lg,
      borderStyle: "solid",
      borderWidth: 3,
      padding: 16,
      position: "relative",
    },
    fieldLabel: {
      color: theme.colors.mutedForeground,
      fontSize: 9,
      fontWeight: "bold",
      letterSpacing: 1,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    fieldValue: {
      color: theme.colors.foreground,
      fontSize: 14,
      fontWeight: 500,
    },
    header: {
      alignItems: "center",
      marginBottom: 8,
    },
    innerBorder: {
      borderColor: accentColor,
      borderRadius: theme.primitives.borderRadius.md,
      borderStyle: "dashed",
      borderWidth: 1,
      padding: 18,
    },
    instructionsBox: {
      marginTop: 8,
    },
    logo: {
      height: 28,
      marginBottom: 6,
      width: 28,
    },
    messageBox: {
      backgroundColor: theme.colors.muted,
      borderRadius: theme.primitives.borderRadius.sm,
      marginBottom: 8,
      marginTop: 8,
      padding: 10,
    },
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      minHeight: 595,
      padding: 24,
      paddingBottom: 24,
      position: "relative",
    },
    termsText: {
      color: theme.colors.mutedForeground,
      fontSize: 8,
      lineHeight: 1.4,
      textAlign: "center",
    },
    title: {
      color: accentColor,
      fontSize: 22,
      fontWeight: "bold",
      letterSpacing: 2,
      textAlign: "center",
      textTransform: "uppercase",
    },
  });

  return { accentColor, currencySymbol, styles };
};

@Component({
  imports: [
    PdfImage,
    PdfSection,
    PdfText,
    TakumiDocument,
    TakumiPage,
    TakumiView,
  ],
  selector: "pdf-gift-certificate-content",
  template: `
    @let data = this.data();
    @let theme = this.theme();
    @let accentColor = layout().accentColor;
    @let styles = layout().styles;
    <takumi-document [title]="'Gift Certificate ' + data.certificateCode">
      <takumi-page [size]="{ height: 595, width: 841 }" [style]="styles.page">
        <takumi-view [style]="styles.decorativeBorder">
          <takumi-view [style]="styles.innerBorder">
            <pdf-section noWrap [style]="styles.header">
              @if (data.companyLogo) {
                <pdf-image
                  [src]="data.companyLogo ?? '/favicon.png'"
                  [style]="styles.logo"
                />
              }
              <pdf-text [style]="styles.title" noMargin
                >Gift Certificate</pdf-text
              >
              @if (data.companyName) {
                <pdf-text
                  [style]="{
                    color: theme.colors.foreground,
                    fontSize: 13,
                    fontWeight: 500,
                    marginTop: 4,
                    textAlign: 'center',
                  }"
                  noMargin
                  >{{ data.companyName }}</pdf-text
                >
              }
            </pdf-section>

            <pdf-section noWrap [style]="styles.amountContainer">
              <pdf-text [style]="styles.amount" noMargin
                >{{ layout().currencySymbol
                }}{{ data.amount.toFixed(2) }}</pdf-text
              >
            </pdf-section>

            <pdf-section
              noWrap
              [style]="{
                flexDirection: 'row',
                gap: 28,
                marginBottom: 8,
              }"
            >
              <takumi-view [style]="{ flex: 1 }">
                <pdf-text [style]="styles.fieldLabel" noMargin>To</pdf-text>
                <pdf-text [style]="styles.fieldValue" noMargin>{{
                  data.recipientName
                }}</pdf-text>
              </takumi-view>
              <takumi-view [style]="{ flex: 1 }">
                <pdf-text [style]="styles.fieldLabel" noMargin>From</pdf-text>
                <pdf-text [style]="styles.fieldValue" noMargin>{{
                  data.senderName
                }}</pdf-text>
              </takumi-view>
            </pdf-section>

            @if (data.message) {
              <pdf-section noWrap [style]="styles.messageBox">
                <pdf-text
                  [style]="{
                    color: theme.colors.foreground,
                    fontSize: 10,
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    textAlign: 'center',
                  }"
                  noMargin
                  >"{{ data.message }}"</pdf-text
                >
              </pdf-section>
            }

            <pdf-section noWrap [style]="styles.codeBox">
              <pdf-text [style]="styles.fieldLabel" noMargin
                >Certificate Code</pdf-text
              >
              <pdf-text [style]="styles.code" noMargin>{{
                data.certificateCode
              }}</pdf-text>
            </pdf-section>

            <pdf-section
              noWrap
              [style]="{
                alignItems: 'center',
                marginBottom: 8,
              }"
            >
              <pdf-text [style]="styles.fieldLabel" noMargin
                >Valid Until</pdf-text
              >
              <pdf-text
                [style]="{
                  color: accentColor,
                  fontSize: 12,
                  fontWeight: 'bold',
                }"
                noMargin
                >{{ data.expiryDate }}</pdf-text
              >
            </pdf-section>

            @if (data.redemptionInstructions) {
              <pdf-section noWrap [style]="styles.instructionsBox">
                <pdf-text
                  [style]="{
                    color: theme.colors.foreground,
                    fontSize: 9,
                    lineHeight: 1.3,
                    textAlign: 'center',
                  }"
                  noMargin
                  >{{ data.redemptionInstructions }}</pdf-text
                >
              </pdf-section>
            }

            @if (data.terms) {
              <pdf-section
                noWrap
                [style]="{
                  marginTop: 10,
                }"
              >
                <pdf-text [style]="styles.termsText" noMargin>{{
                  data.terms
                }}</pdf-text>
              </pdf-section>
            }
          </takumi-view>
        </takumi-view>
      </takumi-page>
    </takumi-document>
  `,
})
export class GiftCertificateContent {
  readonly data = input.required<GiftCertificateData>();

  protected readonly theme = injectPdfcnTheme();

  protected readonly layout = computed(() =>
    giftCertificateLayout(this.theme(), this.data())
  );
}

@Component({
  imports: [GiftCertificateContent, PdfcnThemeProvider],
  selector: "pdf-gift-certificate",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-gift-certificate-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class GiftCertificateDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<GiftCertificateData>(sampleData);
}
