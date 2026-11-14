import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input } from "@angular/core";

import { PdfBadge } from "@/registry/bases/forme/components/badge/badge";
import { PdfList } from "@/registry/bases/forme/components/list/list";
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

import type {
  MeetingMinutesActionStatus,
  MeetingMinutesProps,
} from "./meeting-minutes.types";

// Sample data — replace with your own props or data source
const sampleData: MeetingMinutesProps = {
  absent: [{ name: "Casey Wu", role: "QA Lead" }],
  accentColor: "#0891b2",
  actionItems: [
    {
      dueDate: "Sep 19, 2026",
      owner: "Jordan Lee",
      status: "In Progress",
      task: "Create pdfme integration RFC",
    },
    {
      dueDate: "Sep 22, 2026",
      owner: "Sam Patel",
      status: "Not Started",
      task: "Design community page wireframes",
    },
    {
      dueDate: "Sep 26, 2026",
      owner: "Alex Kim",
      status: "Complete",
      task: "Share Q2 outcomes deck with stakeholders",
    },
  ],
  agenda: [
    "Review Q2 outcomes",
    "Q3 feature priorities",
    "Resource allocation",
    "Timeline and milestones",
  ],
  attendees: [
    { name: "Alex Kim", role: "Product Lead" },
    { name: "Jordan Lee", role: "Engineering Lead" },
    { name: "Sam Patel", role: "Design Lead" },
  ],
  date: "September 12, 2026",
  decisions: [
    {
      decision: "Proceed with pdfme as second rendering base",
      number: 1,
      rationale: "Better JSX support",
    },
    {
      decision: "Allocate 2 engineers to PDF module full-time",
      number: 2,
    },
  ],
  discussions: [
    {
      notes: [
        "Shipped 4 of 5 planned features",
        "Customer satisfaction up 12%",
      ],
      speaker: "Alex Kim",
      topic: "Q2 Outcomes",
    },
    {
      notes: [
        "PDF generation module is top priority",
        "Community page scheduled for late Q3",
      ],
      speaker: "Jordan Lee",
      topic: "Q3 Feature Priorities",
    },
  ],
  distributionList: ["product-team@acme.com", "eng-leads@acme.com"],
  guests: ["Riya Shah (Advisor)"],
  location: "Conference Room B / Zoom",
  meetingTitle: "Q3 Product Roadmap Review",
  nextMeeting: {
    agenda: ["Review action items", "pdfme RFC walkthrough"],
    date: "September 19, 2026",
    time: "2:00 PM",
  },
  organizer: "Alex Kim",
  preparedBy: "Alex Kim",
  time: "2:00 PM - 3:30 PM",
};

const STATUS_VARIANT: Record<
  MeetingMinutesActionStatus,
  "success" | "info" | "default"
> = {
  Complete: "success",
  "In Progress": "info",
  "Not Started": "default",
};

const formatAttendee = (a: { name: string; role?: string }) =>
  `${a.name}${a.role ? ` — ${a.role}` : ""}`;

const meetingMinutesLayout = (theme: PdfcnTheme, data: MeetingMinutesProps) => {
  const styles = StyleSheet.create({
    columnHeading: {
      fontSize: 9,
      fontWeight: "bold",
      marginBottom: 2,
    },
    discussionTopic: {
      marginBottom: theme.primitives.spacing[2],
    },
    listItem: {
      marginBottom: theme.primitives.spacing[1],
    },
    page: {
      backgroundColor: theme.colors.background,
    },
  });

  const attendeeColumns = [
    { heading: "Attendees", names: data.attendees.map(formatAttendee) },
    ...(data.absent?.length
      ? [{ heading: "Absent", names: data.absent.map(formatAttendee) }]
      : []),
    ...(data.guests?.length ? [{ heading: "Guests", names: data.guests }] : []),
  ];

  const footerRightText = data.distributionList?.length
    ? `Distribution: ${data.distributionList.join(", ")}`
    : undefined;

  const discussions = data.discussions.map((discussion) => ({
    ...discussion,
    items: discussion.notes.map((text) => ({ text })),
  }));

  const nextMeetingAgenda = data.nextMeeting?.agenda?.map((text) => ({
    text,
  }));

  return {
    attendeeColumns,
    discussions,
    footerRightText,
    nextMeetingAgenda,
    styles,
  };
};

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    NgTemplateOutlet,
    PdfBadge,
    PdfList,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfText,
    TABLE,
  ],
  selector: "pdf-meeting-minutes-content",
  template: `
    @let data = this.data();
    @let l = layout();
    @let styles = l.styles;
    <ng-template #heading let-text>
      <pdf-text
        [style]="styles.columnHeading"
        color="mutedForeground"
        transform="uppercase"
        noMargin
        >{{ text }}</pdf-text
      >
    </ng-template>
    <ng-template #footer>
      <pdf-page-footer
        [leftText]="'Prepared by ' + data.preparedBy"
        [rightText]="l.footerRightText"
        sticky
        [pagePadding]="25"
      />
    </ng-template>
    <forme-document [title]="'Minutes — ' + data.meetingTitle">
      <forme-page
        size="A4"
        [margin]="{ bottom: 25, left: 56, right: 56, top: 56 }"
      >
        <ng-container *ngTemplateOutlet="footer" />
        <forme-view [style]="styles.page">
          <pdf-page-header
            variant="simple"
            [title]="data.meetingTitle"
            [subtitle]="data.location + ' · Organized by ' + data.organizer"
            [rightText]="data.date"
            [rightSubText]="data.time"
            [style]="{ marginBottom: 0 }"
          />
          <pdf-section spacing="sm" [style]="{ flexDirection: 'row' }">
            @for (column of l.attendeeColumns; track column.heading) {
              <forme-view [style]="{ flex: 1, paddingRight: 15 }">
                <ng-container
                  *ngTemplateOutlet="
                    heading;
                    context: { $implicit: column.heading }
                  "
                />
                @for (name of column.names; track name) {
                  <pdf-text noMargin variant="xs">{{ name }}</pdf-text>
                }
              </forme-view>
            }
          </pdf-section>
          <pdf-section spacing="sm">
            <ng-container
              *ngTemplateOutlet="heading; context: { $implicit: 'Agenda' }"
            />
            @for (item of data.agenda; track item; let index = $index) {
              <pdf-text [style]="styles.listItem" variant="sm" noMargin>{{
                index + 1 + ". " + item
              }}</pdf-text>
            }
          </pdf-section>
          <pdf-section spacing="sm">
            <ng-container
              *ngTemplateOutlet="heading; context: { $implicit: 'Discussion' }"
            />
            @for (discussion of l.discussions; track discussion.topic) {
              <forme-view [style]="styles.discussionTopic">
                <pdf-text variant="sm" weight="semibold" noMargin>{{
                  discussion.topic
                }}</pdf-text>
                @if (discussion.speaker) {
                  <pdf-text variant="xs" color="mutedForeground" noMargin>{{
                    "— " + discussion.speaker
                  }}</pdf-text>
                }
                <pdf-list
                  variant="bullet"
                  gap="xs"
                  [items]="discussion.items"
                />
              </forme-view>
            }
          </pdf-section>
        </forme-view>
      </forme-page>
      <forme-page
        size="A4"
        [margin]="{ bottom: 25, left: 56, right: 56, top: 56 }"
      >
        <ng-container *ngTemplateOutlet="footer" />
        <forme-view [style]="styles.page">
          <pdf-section spacing="sm">
            <ng-container
              *ngTemplateOutlet="heading; context: { $implicit: 'Decisions' }"
            />
            @for (d of data.decisions; track d.number) {
              <forme-view [style]="styles.discussionTopic">
                <pdf-text variant="sm" weight="semibold" noMargin>{{
                  d.number + ". " + d.decision
                }}</pdf-text>
                @if (d.rationale) {
                  <pdf-text variant="xs" color="mutedForeground" noMargin>{{
                    d.rationale
                  }}</pdf-text>
                }
              </forme-view>
            }
          </pdf-section>
          <pdf-section spacing="sm">
            <ng-container
              *ngTemplateOutlet="
                heading;
                context: { $implicit: 'Action Items' }
              "
            />
            <pdf-table variant="grid" zebraStripe>
              <pdf-table-header>
                <pdf-table-row header>
                  <pdf-table-cell>Task</pdf-table-cell>
                  <pdf-table-cell align="center">Owner</pdf-table-cell>
                  <pdf-table-cell align="center">Due Date</pdf-table-cell>
                  <pdf-table-cell align="center">Status</pdf-table-cell>
                </pdf-table-row>
              </pdf-table-header>
              <pdf-table-body>
                @for (item of data.actionItems; track item.task) {
                  <pdf-table-row>
                    <pdf-table-cell>{{ item.task }}</pdf-table-cell>
                    <pdf-table-cell align="center">{{
                      item.owner
                    }}</pdf-table-cell>
                    <pdf-table-cell align="center">{{
                      item.dueDate
                    }}</pdf-table-cell>
                    <pdf-table-cell align="center">
                      <pdf-badge
                        [variant]="STATUS_VARIANT[item.status]"
                        size="sm"
                        [label]="item.status"
                      />
                    </pdf-table-cell>
                  </pdf-table-row>
                }
              </pdf-table-body>
            </pdf-table>
          </pdf-section>
          @if (data.nextMeeting) {
            <pdf-section
              spacing="sm"
              variant="highlight"
              [accentColor]="data.accentColor"
            >
              <ng-container
                *ngTemplateOutlet="
                  heading;
                  context: { $implicit: 'Next Meeting' }
                "
              />
              <pdf-text variant="sm" weight="medium" noMargin>{{
                data.nextMeeting.date + " · " + data.nextMeeting.time
              }}</pdf-text>
              @if (l.nextMeetingAgenda) {
                <pdf-list
                  variant="bullet"
                  gap="xs"
                  [items]="l.nextMeetingAgenda"
                />
              }
            </pdf-section>
          }
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class MeetingMinutesContent {
  readonly data = input.required<MeetingMinutesProps>();

  private readonly theme = injectPdfcnTheme();

  protected readonly STATUS_VARIANT = STATUS_VARIANT;

  protected readonly layout = computed(() =>
    meetingMinutesLayout(this.theme(), this.data())
  );
}

@Component({
  imports: [MeetingMinutesContent, PdfcnThemeProvider],
  selector: "pdf-meeting-minutes",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-meeting-minutes-content [data]="mergedData()" />
    </pdf-theme-provider>
  `,
})
export class MeetingMinutesDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<Partial<MeetingMinutesProps>>();

  protected readonly mergedData = computed(
    (): MeetingMinutesProps => ({ ...sampleData, ...this.data() })
  );
}
