import { Component, computed, input } from "@angular/core";

import { PdfImage } from "@/registry/bases/forme/components/pdf-image/pdf-image";
import { PdfQRCode } from "@/registry/bases/forme/components/qrcode/qrcode";
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
import { resolveColor } from "@/registry/bases/forme/lib/resolve-color";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import type { EventTicketData } from "./event-ticket.types";

// Sample data — replace with your own props or data source
const sampleData: EventTicketData = {
  accentColor: "#52525b",
  address: "123 Main St, Las Vegas, NV",
  doorsOpen: "8:00 AM",
  eventDate: "May 15, 2026",
  eventName: "ShadCN Labs Conf",
  eventTime: "9:00 AM",
  logoUrl: "/favicon.png",
  organizer: "ShadCN Labs",
  seat: { number: "12", row: "3", section: "A" },
  socialLinks: [
    { platform: "X", url: "x.com/shadcn" },
    { platform: "Instagram", url: "instagram.com/shadcn" },
  ],
  terms: "Ticket is non-transferable. All sales final. No re-entry.",
  ticketNumber: "TKT-00142",
  ticketType: "VIP",
  venue: "Convention Center",
};

// Standard event ticket, 7" x 3.5", expressed in PDF points (72 dpi)
const TICKET_SIZE = { height: 252, width: 504 };

const STUB_WIDTH = 120;

const STRIPE_WIDTH = 8;

const NOTCH_RADIUS = 8;

// Forme renders neither dashed borders nor dashed SVG strokes, so the
// perforation is painted as a stack of short dashes along the stub seam.
const PERFORATION_WIDTH = 1.5;

const PERFORATION_DASH = 4;

const PERFORATION_GAP = 3;

const perforationOffsets: number[] = [];
for (
  let offset = 0;
  offset < TICKET_SIZE.height;
  offset += PERFORATION_DASH + PERFORATION_GAP
) {
  perforationOffsets.push(offset);
}

const hexRgb = (color: string): [number, number, number] | null => {
  const hex = color.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [
      Number.parseInt(hex[0] + hex[0], 16),
      Number.parseInt(hex[1] + hex[1], 16),
      Number.parseInt(hex[2] + hex[2], 16),
    ];
  }

  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }

  return null;
};

const inkOnAccent = (accent: string, light: string, dark: string) => {
  const rgb = hexRgb(accent);

  if (!rgb) {
    return dark;
  }

  const [r, g, b] = rgb;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance > 0.55 ? dark : light;
};

const socialHandle = (url: string) => {
  const clean = url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
  const parts = clean.split("/").filter(Boolean);
  const handle = parts.at(-1);

  if (parts.length > 1 && handle) {
    return handle.startsWith("@") ? handle : `@${handle}`;
  }

  return clean;
};

const eventTicketStyles = (theme: PdfcnTheme, data: EventTicketData) => {
  const paper = theme.colors.background;
  const ink = theme.colors.foreground;
  const quiet = theme.colors.mutedForeground;

  const accent = resolveColor(
    data.accentColor ?? theme.colors.primary,
    theme.colors
  );
  const onAccent = inkOnAccent(accent, paper, ink);

  const styles = StyleSheet.create({
    admit: {
      color: onAccent,
      fontSize: 7,
      fontWeight: "bold",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    body: {
      flex: 1,
      height: TICKET_SIZE.height,
      justifyContent: "space-between",
      paddingBottom: 16,
      paddingLeft: 20,
      paddingRight: 18,
      paddingTop: 18,
    },
    brand: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      marginBottom: 14,
    },
    fact: {
      flexShrink: 1,
      minWidth: 0,
      paddingRight: 12,
    },
    facts: {
      flexDirection: "row",
    },
    footer: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      marginTop: 10,
    },
    label: {
      color: quiet,
      fontSize: 7,
      fontWeight: "bold",
      letterSpacing: 1.2,
      marginBottom: 3,
      textTransform: "uppercase",
    },
    logo: { borderRadius: 3, height: 14, width: 14 },
    notchBottom: {
      backgroundColor: paper,
      borderRadius: NOTCH_RADIUS,
      bottom: -NOTCH_RADIUS,
      height: NOTCH_RADIUS * 2,
      left: TICKET_SIZE.width - STUB_WIDTH - NOTCH_RADIUS,
      position: "absolute",
      width: NOTCH_RADIUS * 2,
    },
    notchTop: {
      backgroundColor: paper,
      borderRadius: NOTCH_RADIUS,
      height: NOTCH_RADIUS * 2,
      left: TICKET_SIZE.width - STUB_WIDTH - NOTCH_RADIUS,
      position: "absolute",
      top: -NOTCH_RADIUS,
      width: NOTCH_RADIUS * 2,
    },
    organizer: {
      color: quiet,
      // Forme ignores `marginLeft: "auto"`, so the organizer line absorbs the
      // free space and pushes the ticket-type pill to the right edge.
      flexGrow: 1,
      fontSize: 8,
      fontWeight: "bold",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    page: {
      alignItems: "stretch",
      backgroundColor: paper,
      flexDirection: "row",
      height: TICKET_SIZE.height,
      overflow: "hidden",
      position: "relative",
      width: TICKET_SIZE.width,
    },
    perforation: {
      height: TICKET_SIZE.height,
      left: TICKET_SIZE.width - STUB_WIDTH - PERFORATION_WIDTH / 2,
      position: "absolute",
      top: 0,
      width: PERFORATION_WIDTH,
    },
    perforationDash: {
      backgroundColor: paper,
      height: PERFORATION_DASH,
      marginBottom: PERFORATION_GAP,
      width: PERFORATION_WIDTH,
    },
    pill: {
      backgroundColor: accent,
      borderRadius: 9,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    pillText: {
      color: onAccent,
      fontSize: 7,
      fontWeight: "bold",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    qr: {
      backgroundColor: "#ffffff",
      borderRadius: 6,
      padding: 5,
    },
    serial: {
      color: onAccent,
      fontSize: 7,
      fontWeight: "bold",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    socialItem: {
      alignItems: "center",
      flexDirection: "row",
      gap: 4,
    },
    socialLabel: {
      color: quiet,
      fontSize: 6.5,
      fontWeight: "bold",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    socialList: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    socialValue: {
      color: quiet,
      fontSize: 6.5,
    },
    stripe: {
      backgroundColor: accent,
      height: TICKET_SIZE.height,
      width: STRIPE_WIDTH,
    },
    stub: {
      alignItems: "center",
      backgroundColor: accent,
      height: TICKET_SIZE.height,
      justifyContent: "space-between",
      paddingBottom: 14,
      paddingHorizontal: 12,
      paddingTop: 16,
      width: STUB_WIDTH,
    },
    terms: {
      color: quiet,
      flex: 1,
      fontSize: 6.5,
      lineHeight: 1.4,
      paddingRight: 8,
    },
    title: {
      color: ink,
      fontSize: 26,
      fontWeight: "bold",
      letterSpacing: -0.6,
      lineHeight: 1.08,
      marginBottom: 8,
    },
    value: {
      color: ink,
      fontSize: 12,
      fontWeight: "bold",
    },
    venue: {
      color: quiet,
      fontSize: 10,
      lineHeight: 1.4,
    },
  });

  return styles;
};

@Component({
  imports: [FormeDocument, FormePage, FormeView, PdfImage, PdfQRCode, PdfText],
  selector: "pdf-event-ticket-content",
  template: `
    @let data = this.data();
    @let styles = this.styles();
    <forme-document [title]="data.eventName + ' ' + data.ticketNumber">
      <forme-page [margin]="0" [size]="TICKET_SIZE">
        <forme-view [style]="styles.page">
          <forme-view [style]="styles.stripe" />

          <forme-view [style]="styles.body">
            <forme-view>
              <forme-view [style]="styles.brand">
                @if (data.logoUrl) {
                  <pdf-image
                    fit="contain"
                    [src]="data.logoUrl"
                    [style]="styles.logo"
                  />
                }
                <pdf-text noMargin [style]="styles.organizer">{{
                  data.organizer ?? "Event ticket"
                }}</pdf-text>
                <forme-view [style]="styles.pill">
                  <pdf-text noMargin [style]="styles.pillText">{{
                    data.ticketType
                  }}</pdf-text>
                </forme-view>
              </forme-view>
              <pdf-text noMargin [style]="styles.title">{{
                data.eventName
              }}</pdf-text>
              <pdf-text noMargin [style]="styles.venue">{{
                data.venue
              }}</pdf-text>
              <pdf-text noMargin [style]="styles.venue">{{
                data.address
              }}</pdf-text>
            </forme-view>

            <forme-view>
              <forme-view [style]="styles.facts">
                <forme-view [style]="styles.fact">
                  <pdf-text noMargin [style]="styles.label">Date</pdf-text>
                  <pdf-text noMargin [style]="styles.value">{{
                    data.eventDate
                  }}</pdf-text>
                </forme-view>
                <forme-view [style]="styles.fact">
                  <pdf-text noMargin [style]="styles.label">Time</pdf-text>
                  <pdf-text noMargin [style]="styles.value">{{
                    data.eventTime
                  }}</pdf-text>
                </forme-view>
                @if (data.doorsOpen) {
                  <forme-view [style]="styles.fact">
                    <pdf-text noMargin [style]="styles.label">Doors</pdf-text>
                    <pdf-text noMargin [style]="styles.value">{{
                      data.doorsOpen
                    }}</pdf-text>
                  </forme-view>
                }
                @if (data.seat) {
                  <forme-view [style]="styles.fact">
                    <pdf-text noMargin [style]="styles.label">Seat</pdf-text>
                    <pdf-text noMargin [style]="styles.value">{{
                      data.seat.section +
                        "–" +
                        data.seat.row +
                        "–" +
                        data.seat.number
                    }}</pdf-text>
                  </forme-view>
                }
              </forme-view>
              @if (
                data.terms || (data.socialLinks && data.socialLinks.length > 0)
              ) {
                <forme-view [style]="styles.footer">
                  @if (data.terms) {
                    <pdf-text noMargin [style]="styles.terms">{{
                      data.terms
                    }}</pdf-text>
                  }
                  @if (data.socialLinks && data.socialLinks.length > 0) {
                    <forme-view [style]="styles.socialList">
                      @for (
                        link of data.socialLinks;
                        track link.platform + "-" + link.url
                      ) {
                        <forme-view [style]="styles.socialItem">
                          <pdf-text noMargin [style]="styles.socialLabel">{{
                            link.platform
                          }}</pdf-text>
                          <pdf-text noMargin [style]="styles.socialValue">{{
                            socialHandle(link.url)
                          }}</pdf-text>
                        </forme-view>
                      }
                    </forme-view>
                  }
                </forme-view>
              }
            </forme-view>
          </forme-view>

          <forme-view [style]="styles.stub">
            <pdf-text noMargin [style]="styles.admit">Admit one</pdf-text>
            <forme-view [style]="styles.qr">
              @if (data.qrCodeUrl) {
                <pdf-image
                  fit="contain"
                  [height]="68"
                  [src]="data.qrCodeUrl"
                  [width]="68"
                />
              } @else {
                <pdf-qrcode
                  backgroundColor="#ffffff"
                  color="#000000"
                  [size]="68"
                  [value]="data.ticketNumber"
                />
              }
            </forme-view>
            <pdf-text noMargin [style]="styles.serial">{{
              data.ticketNumber
            }}</pdf-text>
          </forme-view>

          <forme-view [style]="styles.perforation">
            @for (offset of perforationOffsets; track offset) {
              <forme-view [style]="styles.perforationDash" />
            }
          </forme-view>

          <forme-view [style]="styles.notchTop" />
          <forme-view [style]="styles.notchBottom" />
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class EventTicketContent {
  readonly data = input.required<EventTicketData>();

  private readonly theme = injectPdfcnTheme();

  protected readonly TICKET_SIZE = TICKET_SIZE;
  protected readonly perforationOffsets = perforationOffsets;
  protected readonly socialHandle = socialHandle;

  protected readonly styles = computed(() =>
    eventTicketStyles(this.theme(), this.data())
  );
}

@Component({
  imports: [EventTicketContent, PdfcnThemeProvider],
  selector: "pdf-event-ticket",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-event-ticket-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class EventTicketDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<EventTicketData>(sampleData);
}
