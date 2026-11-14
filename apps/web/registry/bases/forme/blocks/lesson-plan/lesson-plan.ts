import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input } from "@angular/core";

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

import type { LessonPlanProps } from "./lesson-plan.types";

// Sample data — replace with your own props or data source
const sampleData: LessonPlanProps = {
  accentColor: "#7c3aed",
  assessment: {
    formative: ["Exit ticket", "Observation during guided practice"],
    summative: ["Chapter quiz"],
  },
  date: "September 15, 2026",
  differentiation: [
    "Provide equation mats for visual learners",
    "Allow calculator use for students with processing difficulties",
    "Offer extension problems for advanced learners",
  ],
  duration: "50 minutes",
  essentialQuestion:
    "How can we represent real-world relationships using linear equations?",
  gradeLevel: "8th Grade",
  homework: "Complete worksheet problems 11-20",
  lessonTitle: "Introduction to Linear Equations",
  materials: ["Graph paper", "Rulers", "Calculator", "Whiteboard markers"],
  objectives: [
    "Define linear equations",
    "Graph linear equations on a coordinate plane",
    "Solve simple linear equations",
  ],
  sequence: [
    {
      activity: "Warm-up",
      description: "Review solving one-step equations",
      notes: "5 problems on the board",
      time: "5 min",
    },
    {
      activity: "Introduction",
      description: "Define linear equations, show examples",
      notes: "Use real-world context",
      time: "10 min",
    },
    {
      activity: "Guided Practice",
      description: "Work through 3 examples together",
      notes: "Check for understanding",
      time: "15 min",
    },
    {
      activity: "Independent Practice",
      description: "Complete worksheet problems 1-10",
      notes: "Circulate and support",
      time: "15 min",
    },
    {
      activity: "Closure",
      description: "Exit ticket: solve one linear equation",
      notes: "Collect before dismissal",
      time: "5 min",
    },
  ],
  standards: ["CCSS.MATH.8.EE.B.6", "CCSS.MATH.8.EE.C.7"],
  subject: "Mathematics",
  teacherName: "Ms. Johnson",
  topic: "Linear Equations",
};

const REFLECTION_LINE_KEYS = Array.from(
  { length: 8 },
  (_, line) => `reflection-line-${line}`
);

const COLUMN_WIDTHS = { activity: 104, notes: 140, time: 56 };

const lessonPlanLayout = (theme: PdfcnTheme, data: LessonPlanProps) => {
  const rule = {
    borderBottomColor: theme.colors.border,
    borderBottomStyle: "solid" as const,
    borderBottomWidth: 1,
  };

  const styles = StyleSheet.create({
    block: {
      marginBottom: 16,
    },
    colHalf: {
      flex: 2,
      paddingRight: 20,
    },
    colQuarter: {
      flex: 1,
      paddingRight: 10,
    },
    infoRow: {
      ...rule,
      flexDirection: "row",
      marginBottom: 16,
      paddingBottom: 12,
    },
    intro: {
      marginBottom: 3,
    },
    label: {
      fontSize: 9,
      fontWeight: "bold",
      marginBottom: 4,
    },
    listMarker: {
      width: 12,
    },
    listRow: {
      flexDirection: "row",
      marginBottom: 3,
    },
    listText: {
      flex: 1,
    },
    page: {
      backgroundColor: theme.colors.background,
    },
    reflectionLine: {
      ...rule,
      height: 24,
    },
    row: {
      flexDirection: "row",
    },
  });

  const pageMargin = {
    bottom: theme.spacing.page.marginBottom,
    left: theme.spacing.page.marginLeft,
    right: theme.spacing.page.marginRight,
    top: theme.spacing.page.marginTop,
  };

  const info = [
    { label: "Subject", value: data.subject },
    { label: "Grade Level", value: data.gradeLevel },
    { label: "Teacher", value: data.teacherName },
    { label: "Duration", value: data.duration },
  ];

  const footerText = `${data.subject} · ${data.gradeLevel} · ${data.lessonTitle}`;

  return { footerText, info, pageMargin, styles };
};

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    NgTemplateOutlet,
    PdfPageFooter,
    PdfPageHeader,
    PdfSection,
    PdfText,
    TABLE,
  ],
  selector: "pdf-lesson-plan-content",
  template: `
    @let data = this.data();
    @let styles = layout().styles;
    <ng-template #renderLabel let-label>
      <pdf-text
        [style]="styles.label"
        color="mutedForeground"
        transform="uppercase"
        noMargin
        >{{ label }}</pdf-text
      >
    </ng-template>
    <ng-template #renderList let-items let-numbered="numbered">
      @let list = items ?? [];
      @if (list.length > 0) {
        @for (item of list; track $index; let index = $index) {
          <forme-view [style]="styles.listRow">
            <forme-view [style]="styles.listMarker">
              <pdf-text variant="xs" color="mutedForeground" noMargin>{{
                numbered ? index + 1 + "." : "•"
              }}</pdf-text>
            </forme-view>
            <forme-view [style]="styles.listText">
              <pdf-text variant="xs" noMargin>{{ item }}</pdf-text>
            </forme-view>
          </forme-view>
        }
      } @else {
        <pdf-text variant="xs" color="mutedForeground" noMargin>—</pdf-text>
      }
    </ng-template>
    <forme-document [title]="'Lesson Plan — ' + data.lessonTitle">
      <forme-page [margin]="layout().pageMargin" size="A4">
        <pdf-page-footer
          [leftText]="layout().footerText"
          rightText="Page 1 of 2"
          sticky
          [pagePadding]="25"
        />
        <forme-view [style]="styles.page">
          <pdf-page-header
            variant="simple"
            [title]="data.lessonTitle"
            [subtitle]="
              data.topic ? 'Lesson Plan · ' + data.topic : 'Lesson Plan'
            "
            [rightText]="data.date"
            [marginBottom]="16"
          />

          <forme-view [style]="styles.infoRow">
            @for (item of layout().info; track item.label) {
              <forme-view [style]="styles.colQuarter">
                <ng-container
                  *ngTemplateOutlet="
                    renderLabel;
                    context: { $implicit: item.label }
                  "
                />
                <pdf-text variant="xs" weight="medium" noMargin>{{
                  item.value
                }}</pdf-text>
              </forme-view>
            }
          </forme-view>

          @if (data.essentialQuestion) {
            <pdf-section
              variant="highlight"
              [accentColor]="data.accentColor"
              spacing="none"
              padding="sm"
              [style]="styles.block"
            >
              <ng-container
                *ngTemplateOutlet="
                  renderLabel;
                  context: { $implicit: 'Essential Question' }
                "
              />
              <pdf-text variant="sm" weight="medium" noMargin>{{
                data.essentialQuestion
              }}</pdf-text>
            </pdf-section>
          }

          <forme-view [style]="{ ...styles.row, ...styles.block }">
            <forme-view [style]="styles.colHalf">
              <ng-container
                *ngTemplateOutlet="
                  renderLabel;
                  context: { $implicit: 'Objectives' }
                "
              />
              <pdf-text
                variant="xs"
                color="mutedForeground"
                [style]="styles.intro"
                noMargin
                >Students will be able to (SWBAT):</pdf-text
              >
              <ng-container
                *ngTemplateOutlet="
                  renderList;
                  context: { $implicit: data.objectives, numbered: true }
                "
              />
            </forme-view>
            @if (data.standards?.length) {
              <forme-view [style]="styles.colQuarter">
                <ng-container
                  *ngTemplateOutlet="
                    renderLabel;
                    context: { $implicit: 'Standards' }
                  "
                />
                <ng-container
                  *ngTemplateOutlet="
                    renderList;
                    context: { $implicit: data.standards }
                  "
                />
              </forme-view>
            }
            <forme-view [style]="styles.colQuarter">
              <ng-container
                *ngTemplateOutlet="
                  renderLabel;
                  context: { $implicit: 'Materials' }
                "
              />
              <ng-container
                *ngTemplateOutlet="
                  renderList;
                  context: { $implicit: data.materials }
                "
              />
            </forme-view>
          </forme-view>

          <forme-view>
            <ng-container
              *ngTemplateOutlet="
                renderLabel;
                context: { $implicit: 'Lesson Sequence' }
              "
            />
            <pdf-table variant="grid" zebraStripe>
              <pdf-table-header>
                <pdf-table-row header>
                  <pdf-table-cell [width]="COLUMN_WIDTHS.time"
                    >Time</pdf-table-cell
                  >
                  <pdf-table-cell [width]="COLUMN_WIDTHS.activity"
                    >Activity</pdf-table-cell
                  >
                  <pdf-table-cell>Description</pdf-table-cell>
                  <pdf-table-cell [width]="COLUMN_WIDTHS.notes"
                    >Notes</pdf-table-cell
                  >
                </pdf-table-row>
              </pdf-table-header>
              <pdf-table-body>
                @for (item of data.sequence; track $index) {
                  <pdf-table-row>
                    <pdf-table-cell [width]="COLUMN_WIDTHS.time">{{
                      item.time
                    }}</pdf-table-cell>
                    <pdf-table-cell [width]="COLUMN_WIDTHS.activity">{{
                      item.activity
                    }}</pdf-table-cell>
                    <pdf-table-cell>{{ item.description }}</pdf-table-cell>
                    <pdf-table-cell [width]="COLUMN_WIDTHS.notes">{{
                      item.notes ?? "—"
                    }}</pdf-table-cell>
                  </pdf-table-row>
                }
              </pdf-table-body>
            </pdf-table>
          </forme-view>
        </forme-view>
      </forme-page>

      <forme-page [margin]="layout().pageMargin" size="A4">
        <pdf-page-footer
          [leftText]="layout().footerText"
          rightText="Page 2 of 2"
          sticky
          [pagePadding]="25"
        />
        <forme-view [style]="styles.page">
          @if (data.differentiation?.length) {
            <forme-view [style]="styles.block">
              <ng-container
                *ngTemplateOutlet="
                  renderLabel;
                  context: { $implicit: 'Differentiation' }
                "
              />
              <ng-container
                *ngTemplateOutlet="
                  renderList;
                  context: { $implicit: data.differentiation }
                "
              />
            </forme-view>
          }

          <forme-view [style]="{ ...styles.row, ...styles.block }">
            <forme-view [style]="styles.colHalf">
              <ng-container
                *ngTemplateOutlet="
                  renderLabel;
                  context: { $implicit: 'Formative Assessment' }
                "
              />
              <ng-container
                *ngTemplateOutlet="
                  renderList;
                  context: { $implicit: data.assessment.formative }
                "
              />
            </forme-view>
            <forme-view [style]="styles.colHalf">
              <ng-container
                *ngTemplateOutlet="
                  renderLabel;
                  context: { $implicit: 'Summative Assessment' }
                "
              />
              <ng-container
                *ngTemplateOutlet="
                  renderList;
                  context: { $implicit: data.assessment.summative }
                "
              />
            </forme-view>
          </forme-view>

          @if (data.homework) {
            <forme-view [style]="styles.block">
              <ng-container
                *ngTemplateOutlet="
                  renderLabel;
                  context: { $implicit: 'Homework' }
                "
              />
              <pdf-text variant="xs" noMargin>{{ data.homework }}</pdf-text>
            </forme-view>
          }

          <forme-view>
            <ng-container
              *ngTemplateOutlet="
                renderLabel;
                context: { $implicit: 'Teacher Reflection' }
              "
            />
            @if (data.reflection) {
              <pdf-text variant="xs" noMargin>{{ data.reflection }}</pdf-text>
            }
            @for (key of REFLECTION_LINE_KEYS; track key) {
              <forme-view [style]="styles.reflectionLine" />
            }
          </forme-view>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class LessonPlanContent {
  readonly data = input.required<LessonPlanProps>();

  private readonly theme = injectPdfcnTheme();

  protected readonly COLUMN_WIDTHS = COLUMN_WIDTHS;
  protected readonly REFLECTION_LINE_KEYS = REFLECTION_LINE_KEYS;

  protected readonly layout = computed(() =>
    lessonPlanLayout(this.theme(), this.data())
  );
}

@Component({
  imports: [LessonPlanContent, PdfcnThemeProvider],
  selector: "pdf-lesson-plan",
  template: `
    <pdf-theme-provider [theme]="theme()">
      <pdf-lesson-plan-content [data]="mergedData()" />
    </pdf-theme-provider>
  `,
})
export class LessonPlanDocument {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<Partial<LessonPlanProps>>();

  protected readonly mergedData = computed(
    (): LessonPlanProps => ({ ...sampleData, ...this.data() })
  );
}
