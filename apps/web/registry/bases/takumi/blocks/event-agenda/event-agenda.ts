import { Component, computed, input } from "@angular/core";

import { PdfSection } from "@/registry/bases/takumi/components/section/section";
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

import type { EventAgendaProps, Session } from "./event-agenda.types";
import { sampleEventAgendaData } from "./event-agenda.types";

interface TimeSlotGroup {
  sessions: Session[];
  time: string;
}

const groupSessionsByTime = (sessions: Session[]): TimeSlotGroup[] => {
  const groups: TimeSlotGroup[] = [];
  const map = new Map<string, Session[]>();

  for (const session of sessions) {
    const existing = map.get(session.time);
    if (existing) {
      existing.push(session);
    } else {
      const list = [session];
      map.set(session.time, list);
      groups.push({ sessions: list, time: session.time });
    }
  }

  return groups;
};

const eventAgendaLayout = (theme: PdfcnTheme, data: EventAgendaProps) => {
  const accent = data.accentColor ?? theme.colors.primary;

  const trackColorMap = new Map<string, string>();
  if (data.tracks) {
    for (const track of data.tracks) {
      trackColorMap.set(track.name.toLowerCase(), track.color);
    }
  }

  const styles = StyleSheet.create({
    breakBadge: {
      backgroundColor: theme.colors.muted,
      borderColor: theme.colors.border,
      borderRadius: 4,
      borderStyle: "solid",
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    breakCard: {
      backgroundColor: theme.colors.muted,
      borderColor: theme.colors.border,
      borderRadius: 6,
      borderStyle: "dashed",
      borderWidth: 1,
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    dayBanner: {
      alignItems: "center",
      backgroundColor: theme.colors.muted,
      borderColor: theme.colors.border,
      borderRadius: 6,
      borderStyle: "solid",
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    footerContainer: {
      borderTopColor: theme.colors.border,
      borderTopStyle: "solid",
      borderTopWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: "auto",
      paddingTop: 8,
    },
    headerContainer: {
      borderBottomColor: theme.colors.border,
      borderBottomStyle: "solid",
      borderBottomWidth: 1.5,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: 10,
    },
    legendContainer: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 8,
    },
    legendDot: {
      borderRadius: 3,
      height: 7,
      marginRight: 4,
      width: 7,
    },
    legendItem: {
      alignItems: "center",
      backgroundColor: theme.colors.muted,
      borderColor: theme.colors.border,
      borderRadius: 4,
      borderStyle: "solid",
      borderWidth: 1,
      flexDirection: "row",
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      minHeight: 841,
      padding: 32,
      position: "relative",
    },
    roomBadge: {
      backgroundColor: theme.colors.muted,
      borderColor: theme.colors.border,
      borderRadius: 3,
      borderStyle: "solid",
      borderWidth: 1,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    sessionCard: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderRadius: 6,
      borderStyle: "solid",
      borderWidth: 1,
      flex: 1,
      flexDirection: "column",
      paddingHorizontal: 10,
      paddingVertical: 7,
      position: "relative",
    },
    sessionsRow: {
      flex: 1,
      flexDirection: "row",
      gap: 8,
    },
    timeBox: {
      alignItems: "flex-start",
      flexDirection: "column",
      paddingTop: 2,
      width: 78,
    },
    timeSlotRow: {
      flexDirection: "row",
      marginBottom: 8,
    },
    trackBadge: {
      borderRadius: 3,
      paddingHorizontal: 6,
      paddingVertical: 1,
    },
  });

  return { accent, styles, trackColorMap };
};

@Component({
  imports: [PdfSection, PdfText, TakumiDocument, TakumiPage, TakumiView],
  selector: "pdf-event-agenda-content",
  template: `
    @let data = this.data();
    @let theme = this.theme();
    @let accent = this.layout().accent;
    @let styles = this.layout().styles;
    @let trackColorMap = this.layout().trackColorMap;
    <takumi-document [title]="data.eventName + ' - Agenda'">
      @for (day of data.days; track day.label; let dayIndex = $index) {
        @let timeSlots = groupSessionsByTime(day.sessions);
        <takumi-page size="A4" [style]="styles.page">
          <!-- Header -->
          <takumi-view [style]="styles.headerContainer">
            <takumi-view [style]="{ flex: 1, paddingRight: 16 }">
              <pdf-text
                [style]="{
                  color: accent,
                  fontSize: 8.5,
                  fontWeight: 'bold',
                  letterSpacing: 1.2,
                  marginBottom: 2,
                  textTransform: 'uppercase',
                }"
                noMargin
                >Event Agenda</pdf-text
              >
              <pdf-text
                [style]="{
                  fontSize: 20,
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  marginBottom: 4,
                }"
                noMargin
                >{{ data.eventName }}</pdf-text
              >
              <pdf-text
                [style]="{
                  color: theme.colors.mutedForeground,
                  fontSize: 8.5,
                }"
                noMargin
                >{{ data.date }}{{ data.endDate ? " – " + data.endDate : "" }} •
                {{ data.venue }}</pdf-text
              >
            </takumi-view>

            <takumi-view
              [style]="{
                alignItems: 'flex-end',
                justifyContent: 'center',
              }"
            >
              <takumi-view
                [style]="{
                  backgroundColor: accent,
                  borderRadius: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }"
              >
                <pdf-text
                  [style]="{
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 'bold',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }"
                  noMargin
                  >AGENDA</pdf-text
                >
              </takumi-view>
            </takumi-view>
          </takumi-view>

          <!-- Day Title Banner -->
          <takumi-view [style]="styles.dayBanner">
            <takumi-view
              [style]="{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 6,
              }"
            >
              <pdf-text
                [style]="{ fontSize: 11, fontWeight: 'bold' }"
                noMargin
                >{{ day.label }}</pdf-text
              >
              <pdf-text
                [style]="{ color: theme.colors.mutedForeground, fontSize: 9 }"
                noMargin
                >— {{ day.date }}</pdf-text
              >
            </takumi-view>

            <pdf-text
              [style]="{
                color: theme.colors.mutedForeground,
                fontSize: 8.5,
                fontWeight: 600,
              }"
              noMargin
              >Day {{ dayIndex + 1 }} of {{ data.days.length }}</pdf-text
            >
          </takumi-view>

          <!-- Track Legend (if available) -->
          @if (data.tracks && data.tracks.length > 0) {
            <takumi-view [style]="styles.legendContainer">
              <pdf-text
                [style]="{
                  color: theme.colors.mutedForeground,
                  fontSize: 7.5,
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                  marginRight: 4,
                  textTransform: 'uppercase',
                }"
                noMargin
                >Tracks:</pdf-text
              >
              @for (track of data.tracks; track track.name) {
                <takumi-view [style]="styles.legendItem">
                  <takumi-view
                    [style]="[
                      styles.legendDot,
                      { backgroundColor: track.color },
                    ]"
                  />
                  <pdf-text
                    [style]="{ fontSize: 7.5, fontWeight: 600 }"
                    noMargin
                    >{{ track.name }}</pdf-text
                  >
                </takumi-view>
              }
            </takumi-view>
          }

          <!-- Sessions Time Grid -->
          <pdf-section [style]="{ marginTop: 2 }">
            @for (slot of timeSlots; track slot.time) {
              @let isSingleBreak =
                slot.sessions.length === 1 && slot.sessions[0].isBreak;
              <takumi-view [style]="styles.timeSlotRow">
                <!-- Time Column -->
                <takumi-view [style]="styles.timeBox">
                  <pdf-text
                    [style]="{
                      color: theme.colors.foreground,
                      fontSize: 9,
                      fontWeight: 'bold',
                    }"
                    noMargin
                    >{{ slot.time }}</pdf-text
                  >
                  @if (slot.sessions[0].endTime) {
                    <pdf-text
                      [style]="{
                        color: theme.colors.mutedForeground,
                        fontSize: 7.5,
                      }"
                      noMargin
                      >to {{ slot.sessions[0].endTime }}</pdf-text
                    >
                  }
                </takumi-view>

                <!-- Content Column -->
                @if (isSingleBreak) {
                  <takumi-view [style]="styles.breakCard">
                    <takumi-view
                      [style]="{
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }"
                    >
                      <pdf-text
                        [style]="{
                          color: theme.colors.foreground,
                          fontSize: 9.5,
                          fontWeight: 'bold',
                        }"
                        noMargin
                        >{{ slot.sessions[0].title }}</pdf-text
                      >
                      <takumi-view [style]="styles.breakBadge">
                        <pdf-text
                          [style]="{
                            color: theme.colors.mutedForeground,
                            fontSize: 7,
                            fontWeight: 'bold',
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                          }"
                          noMargin
                          >Break</pdf-text
                        >
                      </takumi-view>
                    </takumi-view>
                    @if (slot.sessions[0].description) {
                      <pdf-text
                        [style]="{
                          color: theme.colors.mutedForeground,
                          fontSize: 7.5,
                          marginTop: 2,
                        }"
                        noMargin
                        >{{ slot.sessions[0].description }}</pdf-text
                      >
                    }
                  </takumi-view>
                } @else {
                  <takumi-view [style]="styles.sessionsRow">
                    @for (
                      session of slot.sessions;
                      track session.title + "-" + sIndex;
                      let sIndex = $index
                    ) {
                      @let trackColor =
                        session.track
                          ? trackColorMap.get(session.track.toLowerCase())
                          : undefined;
                      <takumi-view
                        [style]="[
                          styles.sessionCard,
                          trackColor
                            ? {
                                borderLeftColor: trackColor,
                                borderLeftWidth: 3,
                              }
                            : {},
                        ]"
                      >
                        <!-- Track & Room Metadata -->
                        <takumi-view
                          [style]="{
                            alignItems: 'center',
                            flexDirection: 'row',
                            gap: 4,
                            marginBottom: 3,
                          }"
                        >
                          @if (session.track) {
                            <takumi-view
                              [style]="[
                                styles.trackBadge,
                                {
                                  backgroundColor: trackColor
                                    ? trackColor + '1A'
                                    : theme.colors.muted,
                                },
                              ]"
                            >
                              <pdf-text
                                [style]="{
                                  color: trackColor ?? theme.colors.foreground,
                                  fontSize: 7,
                                  fontWeight: 'bold',
                                }"
                                noMargin
                                >{{ session.track }}</pdf-text
                              >
                            </takumi-view>
                          }
                          @if (session.room) {
                            <takumi-view [style]="styles.roomBadge">
                              <pdf-text
                                [style]="{
                                  color: theme.colors.mutedForeground,
                                  fontSize: 7,
                                  fontWeight: 600,
                                }"
                                noMargin
                                >{{ session.room }}</pdf-text
                              >
                            </takumi-view>
                          }
                        </takumi-view>

                        <!-- Title -->
                        <pdf-text
                          [style]="{
                            fontSize: 9,
                            fontWeight: 'bold',
                            lineHeight: 1.25,
                          }"
                          noMargin
                          >{{ session.title }}</pdf-text
                        >

                        <!-- Speaker -->
                        @if (session.speaker) {
                          <pdf-text
                            [style]="{
                              color: accent,
                              fontSize: 7.8,
                              fontWeight: 600,
                              marginTop: 2,
                            }"
                            noMargin
                            >{{ session.speaker }}</pdf-text
                          >
                        }

                        <!-- Description -->
                        @if (session.description) {
                          <pdf-text
                            [style]="{
                              color: theme.colors.mutedForeground,
                              fontSize: 7.2,
                              lineHeight: 1.2,
                              marginTop: 2,
                            }"
                            noMargin
                            >{{ session.description }}</pdf-text
                          >
                        }
                      </takumi-view>
                    }
                  </takumi-view>
                }
              </takumi-view>
            }
          </pdf-section>

          <!-- Footer -->
          <takumi-view [style]="styles.footerContainer">
            <takumi-view [style]="{ flexDirection: 'column', gap: 1 }">
              @if (data.wifiInfo) {
                <pdf-text
                  [style]="{
                    color: theme.colors.mutedForeground,
                    fontSize: 7.5,
                    fontWeight: 600,
                  }"
                  noMargin
                  >Wi-Fi: {{ data.wifiInfo }}</pdf-text
                >
              }
              @if (data.emergencyContact) {
                <pdf-text
                  [style]="{
                    color: theme.colors.mutedForeground,
                    fontSize: 7.2,
                  }"
                  noMargin
                  >{{ data.emergencyContact }}</pdf-text
                >
              }
            </takumi-view>

            <takumi-view [style]="{ alignItems: 'flex-end' }">
              <pdf-text
                [style]="{
                  color: theme.colors.mutedForeground,
                  fontSize: 7.5,
                  fontWeight: 600,
                }"
                noMargin
                >Page {{ dayIndex + 1 }} of {{ data.days.length }}</pdf-text
              >
            </takumi-view>
          </takumi-view>
        </takumi-page>
      }
    </takumi-document>
  `,
})
export class EventAgendaContent {
  readonly data = input.required<EventAgendaProps>();

  protected readonly theme = injectPdfcnTheme();

  protected readonly groupSessionsByTime = groupSessionsByTime;

  protected readonly layout = computed(() =>
    eventAgendaLayout(this.theme(), this.data())
  );
}

@Component({
  imports: [EventAgendaContent, PdfcnThemeProvider],
  selector: "pdf-event-agenda",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-event-agenda-content [data]="data()" />
    </pdf-theme-provider>
  `,
})
export class EventAgendaDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<EventAgendaProps>(sampleEventAgendaData);
}

export { EventAgendaDocument as EventAgenda };
