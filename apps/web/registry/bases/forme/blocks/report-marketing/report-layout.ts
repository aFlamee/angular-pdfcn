import { Component, booleanAttribute, computed, input } from "@angular/core";
import type { TemplateRef } from "@angular/core";

import { PdfBadge } from "@/registry/bases/forme/components/badge/badge";
import { PdfDataTable } from "@/registry/bases/forme/components/data-table/data-table";
import type {
  DataTableCellContext,
  DataTableColumn,
} from "@/registry/bases/forme/components/data-table/data-table.types";
import { PdfGraph } from "@/registry/bases/forme/components/graph/graph";
import { PdfKeyValue } from "@/registry/bases/forme/components/key-value/key-value";
import { PdfList } from "@/registry/bases/forme/components/list/list";
import { PdfPageFooter } from "@/registry/bases/forme/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { PdfPageNumber } from "@/registry/bases/forme/components/page-number/page-number";
import { PdfSection } from "@/registry/bases/forme/components/section/section";
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

import type { BaseReportData, ReportRow } from "./report.types";

export interface ReportTemplateProps {
  theme?: PdfcnTheme;
  data?: BaseReportData;
}

type ReportGraphVariant =
  | "bar"
  | "horizontal-bar"
  | "line"
  | "area"
  | "pie"
  | "donut";

interface ReportLayoutProps {
  data: BaseReportData;
  titlePrefix: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "destructive" | "info";
  graphVariant: ReportGraphVariant;
  graphTitle: string;
  graphSubtitle: string;
  graphLegend?: "bottom" | "right" | "none";
  graphShowValues?: boolean;
  graphColors?: string[];
  graphData?: { label: string; value: number }[];
}

const toneColor = (
  theme: PdfcnTheme,
  tone: "success" | "warning" | "destructive" | "info"
) => {
  if (tone === "success") {
    return theme.colors.success;
  }
  if (tone === "warning") {
    return theme.colors.warning;
  }
  if (tone === "destructive") {
    return theme.colors.destructive;
  }
  return theme.colors.info;
};

const reportLayout = (
  theme: PdfcnTheme,
  {
    data,
    graphVariant,
    graphLegend = "none",
    graphShowValues = false,
    graphData,
    statusTone,
  }: ReportLayoutProps
) => {
  const accent = toneColor(theme, statusTone);
  const graphHeight: Record<ReportGraphVariant, number> = {
    area: 191,
    bar: 181,
    donut: 191,
    "horizontal-bar": 148,
    line: 191,
    pie: 191,
  };
  const deliveryOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 59,
    donut: -3,
    "horizontal-bar": -4,
    line: -30,
    pie: 0,
  };
  const sectionOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 32,
    donut: 0,
    "horizontal-bar": 0,
    line: 0,
    pie: 0,
  };
  const titleOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 0,
    donut: 0,
    "horizontal-bar": 0,
    line: 0,
    pie: 0,
  };

  const styles = StyleSheet.create({
    col: {
      width: 225,
    },
    graphShell: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderRadius: theme.primitives.borderRadius.md,
      borderStyle: "solid",
      borderWidth: 1,
      padding: 12,
    },
    metricCard: {
      alignItems: "flex-start",
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderRadius: theme.primitives.borderRadius.md,
      borderStyle: "solid",
      borderWidth: 1,
      height: 75,
      padding: 8,
      width: 225,
    },
    metricLabel: {
      color: theme.colors.mutedForeground,
      fontSize: 8,
      letterSpacing: 0.5,
      marginBottom: 2,
      textTransform: "uppercase",
    },
    metricTrend: {
      color: theme.colors.mutedForeground,
      fontSize: 9,
    },
    metricValue: {
      color: theme.colors.foreground,
      fontSize: 14,
      fontWeight: theme.primitives.fontWeights.bold,
      marginBottom: 2,
    },
    metricsGrid: {
      flexDirection: "column",
      gap: 8,
    },
    metricsRow: {
      flexDirection: "row",
      gap: 8,
    },
    page: {
      backgroundColor: theme.colors.background,
    },
    toolbar: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
      width: 499,
    },
    twoColumn: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 10,
    },
  });

  const avgProgress = Math.round(
    data.rows.reduce((sum, row) => sum + row.progress, 0) /
      Math.max(data.rows.length, 1)
  );

  return {
    deliveryStyle: {
      position: "relative" as const,
      top: deliveryOffset[graphVariant],
    },
    graphData: graphData ?? data.series,
    graphHeight: graphHeight[graphVariant],
    graphLegend,
    graphShellStyle: {
      ...styles.graphShell,
      paddingBottom: graphVariant === "horizontal-bar" ? 56 : 12,
    },
    graphShowValues,
    highlights: data.highlights.map((item) => ({
      checked: true,
      text: item,
    })),
    metricRows: [0, 2].map((startIndex) =>
      data.summary.slice(startIndex, startIndex + 2).map((metric) => ({
        badgeStyle: metric.trend
          ? {
              height: 16,
              width: metric.trend.endsWith("QoQ")
                ? metric.trend.length * 6.5 + 10
                : metric.trend.length * 5 + 18,
            }
          : undefined,
        cardStyle: {
          ...styles.metricCard,
          borderLeftColor: metric.tone ? toneColor(theme, metric.tone) : accent,
          borderLeftWidth: 3,
        },
        metric,
      }))
    ),
    riskItems: [
      {
        key: "Open Risks",
        value: `${data.rows.filter((r) => r.risk !== "Low").length}`,
      },
      {
        key: "On-Track Streams",
        value: `${data.rows.filter((r) => r.status === "On Track").length}/${data.rows.length}`,
      },
      {
        key: "Avg Progress",
        value: `${avgProgress}%`,
      },
    ],
    rowsFooter: {
      label: "Totals",
      owner: "-",
      progress: avgProgress,
      risk: "-",
      status: "-",
    },
    sectionStyle: {
      position: "relative" as const,
      top: sectionOffset[graphVariant],
    },
    showGrid: graphVariant !== "pie" && graphVariant !== "donut",
    smooth: graphVariant === "line" || graphVariant === "area",
    styles,
    titleStyle: {
      position: "relative" as const,
      top: titleOffset[graphVariant],
    },
  };
};

const deliveryColumns = (
  progress: TemplateRef<DataTableCellContext<ReportRow>>
): DataTableColumn<ReportRow>[] => [
  { header: "Stream", key: "label" },
  { header: "Owner", key: "owner" },
  { align: "center", header: "Status", key: "status" },
  {
    align: "right",
    header: "Progress",
    key: "progress",
    render: progress,
  },
  { align: "right", header: "Risk", key: "risk" },
];

@Component({
  imports: [
    FormeDocument,
    FormePage,
    FormeView,
    PdfBadge,
    PdfDataTable,
    PdfGraph,
    PdfKeyValue,
    PdfList,
    PdfPageFooter,
    PdfPageHeader,
    PdfPageNumber,
    PdfSection,
    PdfText,
  ],
  selector: "pdf-report-layout",
  template: `
    @let data = this.data();
    @let l = layout();
    @let styles = l.styles;
    <ng-template #pageNumber>
      <pdf-page-number align="right" size="xs" />
    </ng-template>
    <ng-template #progress let-value>{{ value }}%</ng-template>
    <forme-document [title]="titlePrefix() + ' ' + data.period">
      <forme-page
        size="A4"
        [margin]="{ bottom: 48, left: 48, right: 48, top: 56 }"
      >
        <pdf-page-footer
          variant="three-column"
          leftText="Confidential — Internal Use"
          centerText="Generated with pdfcn"
          [rightText]="pageNumber"
          sticky
          [pagePadding]="theme().spacing.page.marginLeft"
        />
        <forme-view [style]="styles.page">
          <pdf-page-header
            variant="two-column"
            [title]="data.title"
            [subtitle]="titlePrefix() + ' · ' + data.subtitle"
            [rightText]="data.period"
            [rightSubText]="'Generated ' + data.generatedAt"
            [marginBottom]="14"
          />

          <forme-view [style]="styles.toolbar">
            <pdf-badge
              [label]="statusLabel()"
              [variant]="statusTone()"
              size="sm"
            />
            <pdf-text variant="xs" color="mutedForeground" noMargin
              >Author: {{ data.author }}</pdf-text
            >
          </forme-view>

          <pdf-section variant="card" padding="md" noWrap>
            <pdf-text variant="sm" transform="uppercase" color="mutedForeground"
              >Executive Summary</pdf-text
            >
            <forme-view [style]="styles.metricsGrid">
              @for (row of l.metricRows; track $index) {
                <forme-view [style]="styles.metricsRow">
                  @for (card of row; track card.metric.label) {
                    <forme-view [style]="card.cardStyle">
                      <pdf-text [style]="styles.metricLabel" noMargin>{{
                        card.metric.label
                      }}</pdf-text>
                      <pdf-text [style]="styles.metricValue" noMargin>{{
                        card.metric.value
                      }}</pdf-text>
                      @if (card.metric.trend) {
                        <pdf-badge
                          [label]="card.metric.trend"
                          size="sm"
                          [variant]="card.metric.tone ?? 'info'"
                          [style]="card.badgeStyle"
                        />
                      }
                    </forme-view>
                  }
                </forme-view>
              }
            </forme-view>
          </pdf-section>
        </forme-view>
      </forme-page>

      <forme-page
        size="A4"
        [margin]="{ bottom: 48, left: 48, right: 48, top: 56 }"
      >
        <pdf-page-footer
          variant="three-column"
          leftText="Confidential — Internal Use"
          centerText="Generated with pdfcn"
          [rightText]="pageNumber"
          sticky
          [pagePadding]="theme().spacing.page.marginLeft"
        />
        <forme-view [style]="styles.page">
          <pdf-section padding="md" noWrap [style]="l.sectionStyle">
            <pdf-text
              variant="sm"
              transform="uppercase"
              color="mutedForeground"
              [style]="l.titleStyle"
              >Performance Trend</pdf-text
            >
            <forme-view [style]="l.graphShellStyle">
              <pdf-graph
                [variant]="graphVariant()"
                [data]="l.graphData"
                [title]="graphTitle()"
                [subtitle]="graphSubtitle()"
                [yLabel]="undefined"
                [xLabel]="undefined"
                [showGrid]="l.showGrid"
                [showValues]="l.graphShowValues"
                [smooth]="l.smooth"
                [legend]="l.graphLegend"
                [height]="l.graphHeight"
                [colors]="graphColors()"
                fullWidth
                [containerPadding]="12"
                [wrapperPadding]="12"
                [style]="{ marginBottom: 0 }"
              />
            </forme-view>
          </pdf-section>

          <pdf-section padding="md" [style]="l.deliveryStyle">
            <pdf-text variant="sm" transform="uppercase" color="mutedForeground"
              >Delivery Table</pdf-text
            >
            <pdf-data-table
              variant="compact"
              size="compact"
              stripe
              [columns]="deliveryColumns(progress)"
              [data]="data.rows"
              [footer]="l.rowsFooter"
            />
          </pdf-section>
        </forme-view>
      </forme-page>

      <forme-page
        size="A4"
        [margin]="{ bottom: 48, left: 48, right: 48, top: 56 }"
      >
        <pdf-page-footer
          variant="three-column"
          leftText="Confidential — Internal Use"
          centerText="Generated with pdfcn"
          [rightText]="pageNumber"
          sticky
          [pagePadding]="theme().spacing.page.marginLeft"
        />
        <forme-view [style]="styles.page">
          <pdf-section padding="md" variant="card" noWrap>
            <pdf-text variant="sm" transform="uppercase" color="mutedForeground"
              >Highlights &amp; Risks</pdf-text
            >
            <forme-view [style]="styles.twoColumn">
              <forme-view [style]="styles.col">
                <pdf-list variant="checklist" [items]="l.highlights" gap="sm" />
              </forme-view>
              <forme-view [style]="styles.col">
                <pdf-key-value size="sm" divided [items]="l.riskItems" />
              </forme-view>
            </forme-view>
          </pdf-section>
        </forme-view>
      </forme-page>
    </forme-document>
  `,
})
export class ReportLayout {
  readonly data = input.required<BaseReportData>();
  readonly titlePrefix = input.required<string>();
  readonly statusLabel = input.required<string>();
  readonly statusTone = input.required<
    "success" | "warning" | "destructive" | "info"
  >();
  readonly graphVariant = input.required<ReportGraphVariant>();
  readonly graphTitle = input.required<string>();
  readonly graphSubtitle = input.required<string>();
  readonly graphLegend = input<"bottom" | "right" | "none" | undefined>("none");
  readonly graphShowValues = input(false, { transform: booleanAttribute });
  readonly graphColors = input<string[]>();
  readonly graphData = input<{ label: string; value: number }[]>();

  protected readonly theme = injectPdfcnTheme();

  protected readonly deliveryColumns = deliveryColumns;

  protected readonly layout = computed(() =>
    reportLayout(this.theme(), {
      data: this.data(),
      graphColors: this.graphColors(),
      graphData: this.graphData(),
      graphLegend: this.graphLegend(),
      graphShowValues: this.graphShowValues(),
      graphSubtitle: this.graphSubtitle(),
      graphTitle: this.graphTitle(),
      graphVariant: this.graphVariant(),
      statusLabel: this.statusLabel(),
      statusTone: this.statusTone(),
      titlePrefix: this.titlePrefix(),
    })
  );
}

@Component({
  imports: [PdfcnThemeProvider, ReportLayout],
  selector: "pdf-report-template-frame",
  template: `
    @if (data(); as data) {
      <pdf-theme-provider [theme]="theme()">
        <pdf-report-layout
          [data]="data"
          [titlePrefix]="titlePrefix()"
          [statusLabel]="statusLabel()"
          [statusTone]="statusTone()"
          [graphVariant]="graphVariant()"
          [graphTitle]="graphTitle()"
          [graphSubtitle]="graphSubtitle()"
          [graphLegend]="graphLegend()"
          [graphShowValues]="graphShowValues()"
          [graphColors]="graphColors()"
          [graphData]="graphData()"
        />
      </pdf-theme-provider>
    }
  `,
})
export class ReportTemplateFrame {
  readonly theme = input<PdfcnTheme>();
  readonly data = input<BaseReportData>();
  readonly titlePrefix = input.required<string>();
  readonly statusLabel = input.required<string>();
  readonly statusTone = input.required<
    "success" | "warning" | "destructive" | "info"
  >();
  readonly graphVariant = input.required<ReportGraphVariant>();
  readonly graphTitle = input.required<string>();
  readonly graphSubtitle = input.required<string>();
  readonly graphLegend = input<"bottom" | "right" | "none">();
  readonly graphShowValues = input(false, { transform: booleanAttribute });
  readonly graphColors = input<string[]>();
  readonly graphData = input<{ label: string; value: number }[]>();
}
