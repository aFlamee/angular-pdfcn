import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  Component,
  computed,
  input,
  viewChild,
} from "@angular/core";
import type { TemplateRef } from "@angular/core";

import { PdfBadge } from "@/registry/bases/takumi/components/badge/badge";
import { PdfDataTable } from "@/registry/bases/takumi/components/data-table/data-table";
import type {
  DataTableCellContext,
  DataTableColumn,
} from "@/registry/bases/takumi/components/data-table/data-table.types";
import { PdfGraph } from "@/registry/bases/takumi/components/graph/graph";
import { PdfKeyValue } from "@/registry/bases/takumi/components/key-value/key-value";
import { PdfList } from "@/registry/bases/takumi/components/list/list";
import { PdfPageFooter } from "@/registry/bases/takumi/components/page-footer/page-footer";
import { PdfPageHeader } from "@/registry/bases/takumi/components/page-header/page-header";
import { PdfPageNumber } from "@/registry/bases/takumi/components/page-number/page-number";
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
    graphColors,
    graphData,
    statusTone,
  }: ReportLayoutProps,
  renderProgress: TemplateRef<DataTableCellContext<ReportRow>> | undefined
) => {
  const accent = toneColor(theme, statusTone);
  const deliveryOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 31,
    donut: 65,
    "horizontal-bar": -2,
    line: -31,
    pie: 0,
  };
  const graphHeight: Record<ReportGraphVariant, number> = {
    area: 191,
    bar: 184,
    donut: 193,
    "horizontal-bar": 163,
    line: 195,
    pie: 191,
  };
  const graphOffset: Record<ReportGraphVariant, number> = {
    area: 0,
    bar: 0,
    donut: 0,
    "horizontal-bar": 0,
    line: 0,
    pie: 0,
  };
  const styles = StyleSheet.create({
    col: {
      flex: 1,
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
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderRadius: theme.primitives.borderRadius.md,
      borderStyle: "solid",
      borderWidth: 1,
      padding: 8,
      width: "48.6%",
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
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      minHeight: 841,
      paddingBottom: theme.spacing.page.marginBottom,
      paddingLeft: theme.spacing.page.marginLeft,
      paddingRight: theme.spacing.page.marginRight,
      paddingTop: theme.spacing.page.marginTop,
      position: "relative",
    },
    pageBreak: {
      breakAfter: "page",
    },
    toolbar: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    twoColumn: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 10,
    },
  });

  const columns: DataTableColumn<ReportRow>[] = [
    { header: "Stream", key: "label" },
    { header: "Owner", key: "owner" },
    { align: "center", header: "Status", key: "status" },
    {
      align: "right",
      header: "Progress",
      key: "progress",
      render: renderProgress,
    },
    { align: "right", header: "Risk", key: "risk" },
  ];

  return {
    columns,
    deliveryStyle: {
      position: "relative" as const,
      top: deliveryOffset[graphVariant],
    },
    footer: {
      label: "Totals",
      owner: "-",
      progress: Math.round(
        data.rows.reduce((sum, row) => sum + row.progress, 0) /
          Math.max(data.rows.length, 1)
      ),
      risk: "-",
      status: "-",
    },
    graph: {
      data: graphData ?? data.series,
      height: graphHeight[graphVariant],
      legend: graphLegend,
      showGrid: graphVariant !== "pie" && graphVariant !== "donut",
      showValues: graphShowValues,
      smooth: graphVariant === "line" || graphVariant === "area",
    },
    graphColors,
    graphSectionStyle:
      graphVariant === "horizontal-bar" ? { marginTop: -6 } : undefined,
    graphShellStyle: [
      styles.graphShell,
      {
        marginTop: graphVariant === "horizontal-bar" ? 34 : 0,
        position: "relative" as const,
        top: graphOffset[graphVariant],
      },
    ],
    highlights: data.highlights.map((item) => ({
      checked: true,
      text: item,
    })),
    keyValues: [
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
        value: `${Math.round(
          data.rows.reduce((sum, row) => sum + row.progress, 0) /
            Math.max(data.rows.length, 1)
        )}%`,
      },
    ],
    metrics: data.summary.map((metric) => ({
      metric,
      style: [
        styles.metricCard,
        {
          borderLeftColor: metric.tone ? toneColor(theme, metric.tone) : accent,
          borderLeftWidth: 3,
        },
      ],
    })),
    pagePadding: theme.spacing.page.marginLeft,
    styles,
  };
};

@Component({
  imports: [
    NgTemplateOutlet,
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
    TakumiDocument,
    TakumiPage,
    TakumiView,
  ],
  selector: "pdf-report-layout",
  template: `
    @let data = this.data();
    @let l = layout();
    @let styles = l.styles;
    <ng-template #progress let-value>{{ progressText(value) }}</ng-template>
    <ng-template #pageNumber><pdf-page-number size="xs" /></ng-template>
    <ng-template #footer>
      <pdf-page-footer
        variant="three-column"
        leftText="Confidential — Internal Use"
        centerText="Generated with pdfcn"
        [rightText]="pageNumber"
        sticky
        [pagePadding]="l.pagePadding"
      />
    </ng-template>
    <takumi-document [title]="titlePrefix() + ' ' + data.period">
      <takumi-page size="A4" [style]="[styles.page, styles.pageBreak]">
        <pdf-page-header
          variant="two-column"
          [title]="data.title"
          [subtitle]="titlePrefix() + ' · ' + data.subtitle"
          [rightText]="data.period"
          [rightSubText]="'Generated ' + data.generatedAt"
          [marginBottom]="14"
        />

        <takumi-view [style]="styles.toolbar">
          <pdf-badge
            [label]="statusLabel()"
            [variant]="statusTone()"
            size="sm"
          />
          <pdf-text variant="xs" color="mutedForeground" noMargin
            >Author: {{ data.author }}</pdf-text
          >
        </takumi-view>

        <pdf-section variant="card" padding="md" noWrap>
          <pdf-text variant="sm" transform="uppercase" color="mutedForeground"
            >Executive Summary</pdf-text
          >
          <takumi-view [style]="styles.metricsGrid">
            @for (card of l.metrics; track card.metric.label) {
              <takumi-view [style]="card.style">
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
                  />
                }
              </takumi-view>
            }
          </takumi-view>
        </pdf-section>

        <ng-container *ngTemplateOutlet="footer" />
      </takumi-page>

      <takumi-page size="A4" [style]="[styles.page, styles.pageBreak]">
        <pdf-section padding="md" noWrap [style]="l.graphSectionStyle">
          <pdf-text variant="sm" transform="uppercase" color="mutedForeground"
            >Performance Trend</pdf-text
          >
          <takumi-view [style]="l.graphShellStyle">
            <pdf-graph
              [variant]="graphVariant()"
              [data]="l.graph.data"
              [title]="graphTitle()"
              [subtitle]="graphSubtitle()"
              [yLabel]="undefined"
              [xLabel]="undefined"
              [showGrid]="l.graph.showGrid"
              [showValues]="l.graph.showValues"
              [smooth]="l.graph.smooth"
              [legend]="l.graph.legend"
              [height]="l.graph.height"
              [colors]="l.graphColors"
              fullWidth
              [containerPadding]="12"
              [wrapperPadding]="12"
              [style]="{ marginBottom: 0 }"
            />
          </takumi-view>
        </pdf-section>

        <pdf-section padding="md" [style]="l.deliveryStyle">
          <pdf-text variant="sm" transform="uppercase" color="mutedForeground"
            >Delivery Table</pdf-text
          >
          <pdf-data-table
            variant="compact"
            size="compact"
            stripe
            [columns]="l.columns"
            [data]="data.rows"
            [footer]="l.footer"
          />
        </pdf-section>

        <ng-container *ngTemplateOutlet="footer" />
      </takumi-page>

      <takumi-page size="A4" [style]="styles.page">
        <pdf-section padding="md" variant="card" noWrap>
          <pdf-text variant="sm" transform="uppercase" color="mutedForeground"
            >Highlights &amp; Risks</pdf-text
          >
          <takumi-view [style]="styles.twoColumn">
            <takumi-view [style]="styles.col">
              <pdf-list variant="checklist" [items]="l.highlights" gap="sm" />
            </takumi-view>
            <takumi-view [style]="styles.col">
              <pdf-key-value size="sm" divided [items]="l.keyValues" />
            </takumi-view>
          </takumi-view>
        </pdf-section>

        <ng-container *ngTemplateOutlet="footer" />
      </takumi-page>
    </takumi-document>
  `,
})
export class ReportLayout {
  readonly data = input.required<BaseReportData>();
  readonly titlePrefix = input.required<string>();
  readonly statusLabel = input.required<string>();
  readonly statusTone = input.required<ReportLayoutProps["statusTone"]>();
  readonly graphVariant = input.required<ReportGraphVariant>();
  readonly graphTitle = input.required<string>();
  readonly graphSubtitle = input.required<string>();
  readonly graphLegend = input<ReportLayoutProps["graphLegend"]>("none");
  readonly graphShowValues = input(false, { transform: booleanAttribute });
  readonly graphColors = input<string[]>();
  readonly graphData = input<ReportLayoutProps["graphData"]>();

  private readonly theme = injectPdfcnTheme();
  private readonly progress =
    viewChild<TemplateRef<DataTableCellContext<ReportRow>>>("progress");

  protected readonly progressText = (value: unknown) => `${String(value)}%`;

  protected readonly layout = computed(() =>
    reportLayout(
      this.theme(),
      {
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
      },
      this.progress()
    )
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
  readonly statusTone = input.required<ReportLayoutProps["statusTone"]>();
  readonly graphVariant = input.required<ReportGraphVariant>();
  readonly graphTitle = input.required<string>();
  readonly graphSubtitle = input.required<string>();
  readonly graphLegend = input<ReportLayoutProps["graphLegend"]>();
  readonly graphShowValues = input(false, { transform: booleanAttribute });
  readonly graphColors = input<string[]>();
  readonly graphData = input<ReportLayoutProps["graphData"]>();
}
