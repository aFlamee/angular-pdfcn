import { NgTemplateOutlet } from "@angular/common";
import { booleanAttribute, Component, computed, input } from "@angular/core";

import { injectPdfcnTheme } from "@/registry/bases/forme/components/theme-provider";
import {
  FormeSvg,
  FormeText,
  FormeView,
} from "@/registry/bases/forme/lib/pdf-primitives";
import type { Style } from "@/registry/bases/forme/lib/pdf-primitives";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

import { createGraphStyles } from "./graph.styles";
import type {
  ChartLayout,
  GraphDataPoint,
  GraphLegendPosition,
  GraphProps,
  GraphSeries,
  GraphVariant,
} from "./graph.types";
import {
  GRAPH_SAFE_WIDTHS,
  arcPath,
  buildLayout,
  fmtNum,
  getDefaultPalette,
  getGraphWidth,
  normalizeData,
  polarToCartesian,
  smoothPath,
  truncate,
} from "./graph.utils";

/**
 * Shared Y-axis grid lines and tick labels for cartesian charts (bar, line, area).
 * Extracted to avoid duplicating the identical block across render functions.
 */
const renderGridAndYAxis = (
  ticks: number[],
  toY: (v: number) => number,
  chartX: number,
  chartW: number,
  showGrid: boolean,
  gridColor: string,
  textColor: string
) =>
  ticks.map((tick) => {
    const ty = toY(tick);
    return {
      line: showGrid
        ? { stroke: gridColor, x1: chartX, x2: chartX + chartW, y1: ty, y2: ty }
        : null,
      text: { fill: textColor, text: fmtNum(tick), x: chartX - 4, y: ty + 3 },
    };
  });

const renderBarChart = (
  series: GraphSeries[],
  layout: ChartLayout,
  palette: string[],
  showGrid: boolean,
  showValues: boolean,
  theme: PdfcnTheme
) => {
  const { chartX, chartY, chartW, chartH, yMin, yMax, yTicks, xLabels } =
    layout;
  const nCategories = xLabels.length;
  const nSeries = series.length;
  const groupGap = 0.25;
  const groupW = chartW / nCategories;
  const barW = (groupW * (1 - groupGap)) / nSeries;
  const textColor = theme.colors.mutedForeground;
  const gridColor = theme.colors.border;
  const axisColor = theme.colors.foreground;
  const range = yMax - yMin || 1;
  const toY = (v: number) => chartY + chartH - ((v - yMin) / range) * chartH;

  return {
    axis: {
      stroke: axisColor,
      x1: chartX,
      x2: chartX + chartW,
      y1: chartY + chartH,
      y2: chartY + chartH,
    },
    grid: renderGridAndYAxis(
      yTicks,
      toY,
      chartX,
      chartW,
      showGrid,
      gridColor,
      textColor
    ),
    groups: xLabels.map((label, ci) => {
      const groupLeft = chartX + ci * groupW + groupW * (groupGap / 2);
      return {
        bars: series.map((s, si) => {
          const val = s.data[ci]?.value ?? 0;
          const color =
            s.data[ci]?.color ?? s.color ?? palette[si % palette.length];
          const barH = ((val - yMin) / range) * chartH;
          const bx = groupLeft + si * barW;
          const by = chartY + chartH - barH;
          return {
            rect: { fill: color, height: barH, width: barW - 1, x: bx, y: by },
            value:
              showValues && barH > 10
                ? {
                    fill: axisColor,
                    text: fmtNum(val),
                    x: bx + barW / 2 - 0.5,
                    y: by - 2,
                  }
                : null,
          };
        }),
        label: {
          fill: textColor,
          text: truncate(label, 10),
          x: groupLeft + (nSeries * barW) / 2,
          y: chartY + chartH + 10,
        },
      };
    }),
  };
};

const renderHorizontalBarChart = (
  series: GraphSeries[],
  layout: ChartLayout,
  palette: string[],
  showValues: boolean,
  theme: PdfcnTheme
) => {
  const { chartX, chartY, chartW, chartH, xLabels } = layout;
  const nCategories = xLabels.length;
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const maxVal = Math.max(...allValues, 1);
  const rowH = chartH / nCategories;
  const barH = rowH * 0.5;
  const textColor = theme.colors.mutedForeground;
  const axisColor = theme.colors.foreground;
  const labelW = 60;

  return {
    axis: {
      stroke: axisColor,
      x1: chartX + labelW,
      x2: chartX + labelW,
      y1: chartY,
      y2: chartY + chartH,
    },
    rows: xLabels.map((label, ci) => {
      const rowY = chartY + ci * rowH;
      const val = series[0]?.data[ci]?.value ?? 0;
      const color =
        series[0]?.data[ci]?.color ??
        series[0]?.color ??
        palette[ci % palette.length];
      const barW = (val / maxVal) * (chartW - labelW);
      return {
        label: {
          fill: textColor,
          text: truncate(label, 14),
          x: chartX + labelW - 4,
          y: rowY + rowH / 2 + 3,
        },
        rect: {
          fill: color,
          height: barH,
          width: Math.max(barW, 1),
          x: chartX + labelW,
          y: rowY + (rowH - barH) / 2,
        },
        value: showValues
          ? {
              fill: axisColor,
              text: fmtNum(val),
              x: chartX + labelW + barW + 3,
              y: rowY + rowH / 2 + 3,
            }
          : null,
      };
    }),
  };
};

const renderLineAreaChart = (
  series: GraphSeries[],
  layout: ChartLayout,
  palette: string[],
  showGrid: boolean,
  showValues: boolean,
  showDots: boolean,
  smooth: boolean,
  isArea: boolean,
  theme: PdfcnTheme
) => {
  const { chartX, chartY, chartW, chartH, yMin, yMax, yTicks, xLabels } =
    layout;
  const range = yMax - yMin || 1;
  const textColor = theme.colors.mutedForeground;
  const gridColor = theme.colors.border;
  const axisColor = theme.colors.foreground;
  const nPoints = xLabels.length;

  const xFor = (i: number) => chartX + (i / Math.max(nPoints - 1, 1)) * chartW;
  const yFor = (v: number) => chartY + chartH - ((v - yMin) / range) * chartH;

  return {
    axis: {
      stroke: axisColor,
      x1: chartX,
      x2: chartX + chartW,
      y1: chartY + chartH,
      y2: chartY + chartH,
    },
    grid: renderGridAndYAxis(
      yTicks,
      yFor,
      chartX,
      chartW,
      showGrid,
      gridColor,
      textColor
    ),
    labels: xLabels.map((label, i) => ({
      fill: textColor,
      text: truncate(label, 8),
      x: xFor(i),
      y: chartY + chartH + 10,
    })),
    series: series.map((s, si) => {
      const color = s.color ?? palette[si % palette.length];
      const points = s.data.map((d, i) => ({ x: xFor(i), y: yFor(d.value) }));

      const lineDStr = smooth
        ? smoothPath(points)
        : `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;

      const lastPoint = points.at(-1);
      const firstPoint = points.at(0);
      const areaPath =
        isArea && points.length > 1 && lastPoint && firstPoint
          ? `${lineDStr} L ${lastPoint.x} ${chartY + chartH} L ${firstPoint.x} ${chartY + chartH} Z`
          : null;

      return {
        area: isArea && areaPath ? areaPath : null,
        color,
        dots: showDots ? points : [],
        line: lineDStr,
        values: showValues
          ? points.map((p, pi) => ({
              text: fmtNum(s.data[pi].value),
              x: p.x,
              y: p.y - 5,
            }))
          : [],
      };
    }),
  };
};

const renderPieDonutChart = (
  series: GraphSeries[],
  layout: ChartLayout,
  palette: string[],
  centerLabel: string | undefined,
  isDonut: boolean,
  theme: PdfcnTheme
) => {
  const { svgW, svgH } = layout;
  const cx = svgW / 2;
  const cy = svgH / 2;
  const r = Math.min(svgW, svgH) / 2 - 20;
  const innerR = isDonut ? r * 0.52 : 0;
  const textColor = theme.colors.mutedForeground;

  const data = series[0]?.data ?? [];
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let currentAngle = 0;

  return {
    center:
      isDonut && centerLabel
        ? {
            cx,
            cy,
            fill: theme.colors.foreground,
            r: innerR,
            text: centerLabel,
            y: cy + 4,
          }
        : null,
    slices: data.map((d, i) => {
      const color = d.color ?? palette[i % palette.length];
      const sweep = (d.value / total) * 360;
      const midAngle = currentAngle + sweep / 2;
      const path = arcPath(
        cx,
        cy,
        r,
        currentAngle,
        currentAngle + sweep,
        innerR
      );
      currentAngle += sweep;

      const labelR = r * 1.18;
      const lp = polarToCartesian(cx, cy, labelR, midAngle);
      const anchor = lp.x > cx ? "start" : "end";

      return {
        color,
        // Show label only if slice is large enough to label
        label:
          sweep > 15
            ? {
                anchor,
                fill: textColor,
                text: truncate(d.label, 10),
                x: lp.x,
                y: lp.y + 3,
              }
            : null,
        path,
      };
    }),
  };
};

const Legend = ({
  series,
  palette,
  styles,
  position = "bottom",
}: {
  series: GraphSeries[];
  palette: string[];
  styles: ReturnType<typeof createGraphStyles>;
  position?: "bottom" | "right";
}) => {
  const containerStyle =
    position === "right" ? styles.legendColumn : styles.legendRow;

  return {
    containerStyle,
    items: series.map((s, i) => ({
      color: s.color ?? palette[i % palette.length],
      name: s.name,
    })),
  };
};

interface ChartContent {
  bar?: ReturnType<typeof renderBarChart>;
  horizontalBar?: ReturnType<typeof renderHorizontalBarChart>;
  lineArea?: ReturnType<typeof renderLineAreaChart>;
  pieDonut?: ReturnType<typeof renderPieDonutChart>;
}

const renderChartContent = (
  variant: string,
  series: GraphSeries[],
  layout: ChartLayout,
  palette: string[],
  showGrid: boolean,
  showValues: boolean,
  showDots: boolean,
  smooth: boolean,
  centerLabel: string | undefined,
  theme: PdfcnTheme
): ChartContent => {
  switch (variant) {
    case "bar": {
      return {
        bar: renderBarChart(
          series,
          layout,
          palette,
          showGrid,
          showValues,
          theme
        ),
      };
    }
    case "horizontal-bar": {
      return {
        horizontalBar: renderHorizontalBarChart(
          series,
          layout,
          palette,
          showValues,
          theme
        ),
      };
    }
    case "line":
    case "area": {
      return {
        lineArea: renderLineAreaChart(
          series,
          layout,
          palette,
          showGrid,
          showValues,
          showDots,
          smooth,
          variant === "area",
          theme
        ),
      };
    }
    case "pie": {
      return {
        pieDonut: renderPieDonutChart(
          series,
          layout,
          palette,
          undefined,
          false,
          theme
        ),
      };
    }
    case "donut": {
      return {
        pieDonut: renderPieDonutChart(
          series,
          layout,
          palette,
          centerLabel,
          true,
          theme
        ),
      };
    }
    default: {
      return {};
    }
  }
};

const renderAxisLabels = (
  isPieOrDonut: boolean,
  xLabel: string | undefined,
  yLabel: string | undefined,
  chartX: number,
  chartW: number,
  height: number,
  mutedForeground: string
) => ({
  fill: mutedForeground,
  x:
    !isPieOrDonut && xLabel
      ? { text: xLabel, x: chartX + chartW / 2, y: height - 2 }
      : null,
  y: !isPieOrDonut && yLabel ? { text: yLabel, x: 2, y: 10 } : null,
});

const renderTextFallback = (
  variant: GraphProps["variant"],
  series: GraphSeries[],
  layout: ChartLayout,
  showValues: boolean,
  textColor: string
) => {
  if (variant === "pie" || variant === "donut") {
    const data = series[0]?.data ?? [];
    const total = data.reduce((sum, point) => sum + point.value, 0) || 1;
    const cx = layout.svgW / 2;
    const cy = layout.svgH / 2;
    const radius = Math.min(layout.svgW, layout.svgH) / 2 - 20;
    const labelRadius = radius * 1.18;
    let currentAngle = 0;

    return {
      labels: data.map((point) => {
        const sweep = (point.value / total) * 360;
        const midAngle = currentAngle + sweep / 2;
        currentAngle += sweep;
        if (sweep <= 15) {
          return null;
        }
        const labelPoint = polarToCartesian(cx, cy, labelRadius, midAngle);
        const onRight = labelPoint.x > cx;
        return {
          style: {
            color: textColor,
            fontSize: 7,
            left: onRight ? labelPoint.x : labelPoint.x - 60,
            lineHeight: 1,
            position: "absolute",
            textAlign: onRight ? "left" : "right",
            top: labelPoint.y - 4,
            width: 60,
          } satisfies Style,
          text: truncate(point.label, 10),
        };
      }),
      rows: [],
      style: {
        height: layout.svgH,
        left: 0,
        position: "absolute",
        top: 0,
        width: layout.svgW,
      } satisfies Style,
    };
  }

  const {
    chartH,
    chartW,
    chartX,
    chartY,
    svgH,
    svgW,
    xLabels,
    yMax,
    yMin,
    yTicks,
  } = layout;
  const range = yMax - yMin || 1;
  const toY = (value: number) =>
    chartY + chartH - ((value - yMin) / range) * chartH;
  const labelStyle = {
    color: textColor,
    fontSize: 7,
    lineHeight: 1,
    position: "absolute" as const,
  };

  if (variant === "horizontal-bar") {
    const labelWidth = 60;
    const rowHeight = chartH / Math.max(xLabels.length, 1);
    const maxValue = Math.max(
      ...series.flatMap((item) => item.data.map((point) => point.value)),
      1
    );

    return {
      labels: [],
      rows: xLabels.map((label, index) => {
        const value = series[0]?.data[index]?.value ?? 0;
        const barWidth = (value / maxValue) * (chartW - labelWidth);
        return {
          label: {
            style: {
              ...labelStyle,
              left: chartX,
              textAlign: "right",
              top: chartY + index * rowHeight + rowHeight / 2 - 4,
              width: labelWidth - 4,
            } satisfies Style,
            text: truncate(label, 14),
          },
          value: showValues
            ? {
                style: {
                  ...labelStyle,
                  color: textColor,
                  fontSize: 6,
                  left: chartX + labelWidth + barWidth + 3,
                  top: chartY + index * rowHeight + rowHeight / 2 - 4,
                  width: 28,
                } satisfies Style,
                text: fmtNum(value),
              }
            : null,
        };
      }),
      style: {
        height: svgH,
        left: 0,
        position: "absolute",
        top: 0,
        width: svgW,
      } satisfies Style,
    };
  }

  const pointX = (index: number) =>
    chartX + (index / Math.max(xLabels.length - 1, 1)) * chartW;
  const groupWidth = chartW / Math.max(xLabels.length, 1);
  const barGap = 2;
  const barWidth = Math.max(
    (groupWidth - barGap * (series.length + 1)) / Math.max(series.length, 1),
    1
  );

  return {
    labels: [
      ...yTicks.map((tick) => ({
        style: {
          ...labelStyle,
          left: 0,
          textAlign: "right",
          top: toY(tick) - 4,
          width: chartX - 4,
        } satisfies Style,
        text: fmtNum(tick),
      })),
      ...(variant === "line" || variant === "area"
        ? xLabels.map((label, index) => ({
            style: {
              ...labelStyle,
              left: pointX(index) - 12,
              textAlign: "center",
              top: chartY + chartH + 3,
              width: 24,
            } satisfies Style,
            text: truncate(label, 8),
          }))
        : []),
      ...(variant === "bar" && showValues
        ? xLabels.flatMap((_label, categoryIndex) =>
            series.map((item, seriesIndex) => {
              const value = item.data[categoryIndex]?.value ?? 0;
              const left =
                chartX +
                categoryIndex * groupWidth +
                barGap +
                seriesIndex * (barWidth + barGap);
              return {
                style: {
                  ...labelStyle,
                  fontSize: 6,
                  left,
                  textAlign: "center",
                  top: toY(value) - 8,
                  width: barWidth,
                } satisfies Style,
                text: fmtNum(value),
              };
            })
          )
        : []),
    ],
    rows: [],
    style: {
      height: svgH,
      left: 0,
      position: "absolute",
      top: 0,
      width: svgW,
    } satisfies Style,
  };
};

const renderBarLabels = (
  variant: GraphProps["variant"],
  series: GraphSeries[],
  chartX: number,
  chartW: number
) => {
  if (variant !== "bar") {
    return null;
  }

  return {
    cellStyle: { alignItems: "center", flex: 1 } satisfies Style,
    labels: (series[0]?.data ?? []).map((point) => truncate(point.label, 10)),
    style: {
      display: "flex",
      flexDirection: "row",
      marginLeft: chartX,
      width: chartW,
    } satisfies Style,
    textStyle: { fontSize: 7 } satisfies Style,
  };
};

const graphLayout = (
  theme: PdfcnTheme,
  {
    variant = "bar",
    data,
    title,
    subtitle,
    xLabel,
    yLabel,
    width: explicitWidth,
    height = 260,
    fullWidth = false,
    containerPadding = 0,
    wrapperPadding = 0,
    colors,
    showValues = false,
    showGrid = true,
    legend = "bottom",
    centerLabel,
    showDots = true,
    smooth = false,
    yTicks: yTickCount = 5,
    style,
  }: GraphProps
) => {
  const styles = createGraphStyles(theme);
  const palette = colors ?? getDefaultPalette(theme);
  const series = normalizeData(data);

  const width = fullWidth
    ? getGraphWidth(theme, { containerPadding, wrapperPadding })
    : (explicitWidth ?? GRAPH_SAFE_WIDTHS.default);

  const isPieOrDonut = variant === "pie" || variant === "donut";
  const layout = buildLayout(series, width, height, isPieOrDonut, yTickCount);
  const { chartX, chartW } = layout;

  const chartContent = renderChartContent(
    variant,
    series,
    layout,
    palette,
    showGrid,
    showValues,
    showDots,
    smooth,
    centerLabel,
    theme
  );

  const showLegend = legend !== "none" && !isPieOrDonut;
  const chartLabels = renderBarLabels(variant, series, chartX, chartW);

  const containerStyles: Style[] = [styles.container];
  if (style) {
    containerStyles.push(style);
  }

  return {
    axisLabels: renderAxisLabels(
      isPieOrDonut,
      xLabel,
      yLabel,
      chartX,
      chartW,
      height,
      theme.colors.mutedForeground
    ),
    chartContent,
    chartLabels,
    containerStyles,
    height,
    legend,
    legends: {
      bottom: Legend({ palette, position: "bottom", series, styles }),
      right: Legend({ palette, position: "right", series, styles }),
    },
    showLegend,
    styles,
    subtitle,
    textFallback: renderTextFallback(
      variant,
      series,
      layout,
      showValues,
      theme.colors.mutedForeground
    ),
    title,
    width,
  };
};

/**
 * PdfGraph — renders bar, horizontal-bar, line, area, pie, and donut charts
 * natively inside react-pdf documents using SVG primitives.
 *
 * No external chart libraries are required or used — all rendering is done via
 * react-pdf's built-in SVG support (`<Svg>`, `<Rect>`, `<Path>`, `<Line>`, etc.).
 *
 * @example Bar chart
 * ```tsx
 * <PdfGraph
 *   variant="bar"
 *   title="Monthly Revenue"
 *   data={[
 *     { label: 'Jan', value: 42000 },
 *     { label: 'Feb', value: 38000 },
 *     { label: 'Mar', value: 55000 },
 *   ]}
 * />
 * ```
 *
 * @example Donut chart with center label
 * ```tsx
 * <PdfGraph
 *   variant="donut"
 *   data={[
 *     { label: 'Product A', value: 45 },
 *     { label: 'Product B', value: 30 },
 *     { label: 'Other', value: 25 },
 *   ]}
 *   centerLabel="$1.2M"
 * />
 * ```
 *
 * **Limitations (by design):**
 * - No interactivity (PDFs are static)
 * - No animations
 * - SVG Text inside charts uses SVG font attributes (not react-pdf StyleSheet fonts)
 * - For print PDFs use SVG-friendly fonts registered with Font.register()
 */
@Component({
  imports: [FormeSvg, FormeText, FormeView, NgTemplateOutlet],
  selector: "pdf-graph",
  template: `
    @if (noWrap()) {
      <forme-view [wrap]="false">
        <ng-container *ngTemplateOutlet="content" />
      </forme-view>
    } @else {
      <ng-container *ngTemplateOutlet="content" />
    }
    <ng-template #content>
      @let g = graph();
      <forme-view [style]="g.containerStyles">
        @if (g.title) {
          <forme-text [style]="g.styles.title">{{ g.title }}</forme-text>
        }
        @if (g.subtitle) {
          <forme-text [style]="g.styles.subtitle">{{ g.subtitle }}</forme-text>
        }
        <forme-view
          [style]="
            g.legend === 'right' ? g.styles.chartWithRightLegend : undefined
          "
        >
          <forme-view
            [style]="{ height: g.height, position: 'relative', width: g.width }"
          >
            <forme-svg [width]="g.width" [height]="g.height">
              @if (g.chartContent.bar; as bar) {
                <ng-container
                  *ngTemplateOutlet="gridAndYAxis; context: { $implicit: bar }"
                />
                <ng-container
                  *ngTemplateOutlet="axisLine; context: { $implicit: bar.axis }"
                />
                @for (group of bar.groups; track $index) {
                  <svg:g>
                    @for (b of group.bars; track $index) {
                      <svg:g>
                        <svg:rect
                          [attr.x]="b.rect.x"
                          [attr.y]="b.rect.y"
                          [attr.width]="b.rect.width"
                          [attr.height]="b.rect.height"
                          [attr.fill]="b.rect.fill"
                        />
                        @if (b.value; as v) {
                          <svg:text
                            font-family="sans-serif"
                            [attr.x]="v.x"
                            [attr.y]="v.y"
                            [attr.fill]="v.fill"
                            [attr.text-anchor]="'middle'"
                            [attr.font-size]="6"
                          >
                            <ng-container>{{ v.text }}</ng-container>
                          </svg:text>
                        }
                      </svg:g>
                    }
                    <svg:text
                      font-family="sans-serif"
                      [attr.x]="group.label.x"
                      [attr.y]="group.label.y"
                      [attr.fill]="group.label.fill"
                      [attr.text-anchor]="'middle'"
                      [attr.font-size]="7"
                    >
                      <ng-container>{{ group.label.text }}</ng-container>
                    </svg:text>
                  </svg:g>
                }
              }
              @if (g.chartContent.horizontalBar; as hbar) {
                @for (row of hbar.rows; track $index) {
                  <svg:g>
                    <svg:text
                      font-family="sans-serif"
                      [attr.x]="row.label.x"
                      [attr.y]="row.label.y"
                      [attr.fill]="row.label.fill"
                      [attr.text-anchor]="'end'"
                      [attr.font-size]="7"
                    >
                      <ng-container>{{ row.label.text }}</ng-container>
                    </svg:text>
                    <svg:rect
                      [attr.x]="row.rect.x"
                      [attr.y]="row.rect.y"
                      [attr.width]="row.rect.width"
                      [attr.height]="row.rect.height"
                      [attr.fill]="row.rect.fill"
                    />
                    @if (row.value; as v) {
                      <svg:text
                        font-family="sans-serif"
                        [attr.x]="v.x"
                        [attr.y]="v.y"
                        [attr.fill]="v.fill"
                        [attr.text-anchor]="'start'"
                        [attr.font-size]="6"
                      >
                        <ng-container>{{ v.text }}</ng-container>
                      </svg:text>
                    }
                  </svg:g>
                }
                <ng-container
                  *ngTemplateOutlet="
                    axisLine;
                    context: { $implicit: hbar.axis }
                  "
                />
              }
              @if (g.chartContent.lineArea; as chart) {
                <ng-container
                  *ngTemplateOutlet="
                    gridAndYAxis;
                    context: { $implicit: chart }
                  "
                />
                <ng-container
                  *ngTemplateOutlet="
                    axisLine;
                    context: { $implicit: chart.axis }
                  "
                />
                @for (s of chart.series; track $index) {
                  <svg:g>
                    @if (s.area) {
                      <svg:path
                        [attr.d]="s.area"
                        [attr.fill]="s.color"
                        [attr.fill-opacity]="0.2"
                        [attr.stroke]="'none'"
                      />
                    }
                    <svg:path
                      [attr.d]="s.line"
                      [attr.stroke]="s.color"
                      [attr.stroke-width]="2"
                      [attr.fill]="'none'"
                    />
                    @for (p of s.dots; track $index) {
                      <svg:circle
                        [attr.cx]="p.x"
                        [attr.cy]="p.y"
                        [attr.r]="3"
                        [attr.fill]="s.color"
                      />
                    }
                    @for (v of s.values; track $index) {
                      <svg:text
                        font-family="sans-serif"
                        [attr.x]="v.x"
                        [attr.y]="v.y"
                        [attr.fill]="s.color"
                        [attr.text-anchor]="'middle'"
                        [attr.font-size]="6"
                      >
                        <ng-container>{{ v.text }}</ng-container>
                      </svg:text>
                    }
                  </svg:g>
                }
                @for (label of chart.labels; track $index) {
                  <svg:text
                    font-family="sans-serif"
                    [attr.x]="label.x"
                    [attr.y]="label.y"
                    [attr.fill]="label.fill"
                    [attr.text-anchor]="'middle'"
                    [attr.font-size]="7"
                  >
                    <ng-container>{{ label.text }}</ng-container>
                  </svg:text>
                }
              }
              @if (g.chartContent.pieDonut; as pie) {
                @for (slice of pie.slices; track $index) {
                  <svg:g>
                    <svg:path
                      [attr.d]="slice.path"
                      [attr.fill]="slice.color"
                      [attr.stroke]="'white'"
                      [attr.stroke-width]="1"
                    />
                    @if (slice.label; as label) {
                      <svg:text
                        font-family="sans-serif"
                        [attr.x]="label.x"
                        [attr.y]="label.y"
                        [attr.fill]="label.fill"
                        [attr.text-anchor]="label.anchor"
                        [attr.font-size]="7"
                      >
                        <ng-container>{{ label.text }}</ng-container>
                      </svg:text>
                    }
                  </svg:g>
                }
                @if (pie.center; as center) {
                  <svg:circle
                    [attr.cx]="center.cx"
                    [attr.cy]="center.cy"
                    [attr.r]="center.r"
                    [attr.fill]="'white'"
                  />
                  <svg:text
                    font-family="sans-serif"
                    [attr.x]="center.cx"
                    [attr.y]="center.y"
                    [attr.fill]="center.fill"
                    [attr.text-anchor]="'middle'"
                    [attr.font-size]="9"
                    [attr.font-weight]="'bold'"
                  >
                    <ng-container>{{ center.text }}</ng-container>
                  </svg:text>
                }
              }
              @if (g.axisLabels.x; as label) {
                <svg:text
                  font-family="sans-serif"
                  [attr.x]="label.x"
                  [attr.y]="label.y"
                  [attr.fill]="g.axisLabels.fill"
                  [attr.text-anchor]="'middle'"
                  [attr.font-size]="8"
                >
                  <ng-container>{{ label.text }}</ng-container>
                </svg:text>
              }
              @if (g.axisLabels.y; as label) {
                <svg:text
                  font-family="sans-serif"
                  [attr.x]="label.x"
                  [attr.y]="label.y"
                  [attr.fill]="g.axisLabels.fill"
                  [attr.text-anchor]="'start'"
                  [attr.font-size]="8"
                >
                  <ng-container>{{ label.text }}</ng-container>
                </svg:text>
              }
            </forme-svg>
            <forme-view [style]="g.textFallback.style">
              @for (label of g.textFallback.labels; track $index) {
                @if (label) {
                  <forme-text [style]="label.style">{{
                    label.text
                  }}</forme-text>
                }
              }
              @for (row of g.textFallback.rows; track $index) {
                <forme-view>
                  <forme-text [style]="row.label.style">{{
                    row.label.text
                  }}</forme-text>
                  @if (row.value; as value) {
                    <forme-text [style]="value.style">{{
                      value.text
                    }}</forme-text>
                  }
                </forme-view>
              }
            </forme-view>
          </forme-view>
          @if (g.showLegend && g.legend === "right") {
            <ng-container
              *ngTemplateOutlet="
                legendTemplate;
                context: { $implicit: g.legends.right }
              "
            />
          }
        </forme-view>
        @if (g.chartLabels; as chartLabels) {
          <forme-view [style]="chartLabels.style">
            @for (label of chartLabels.labels; track $index) {
              <forme-view [style]="chartLabels.cellStyle">
                <forme-text [style]="chartLabels.textStyle">{{
                  label
                }}</forme-text>
              </forme-view>
            }
          </forme-view>
        }
        @if (g.showLegend && g.legend === "bottom") {
          <ng-container
            *ngTemplateOutlet="
              legendTemplate;
              context: { $implicit: g.legends.bottom }
            "
          />
        }
      </forme-view>
      <ng-template #legendTemplate let-legend>
        <forme-view [style]="legend.containerStyle">
          @for (item of legend.items; track $index) {
            <forme-view [style]="g.styles.legendItem">
              <forme-svg [width]="10" [height]="10">
                <svg:rect
                  x="0"
                  y="2"
                  width="8"
                  height="8"
                  [attr.fill]="item.color"
                />
              </forme-svg>
              <forme-text [style]="g.styles.legendText">{{
                item.name
              }}</forme-text>
            </forme-view>
          }
        </forme-view>
      </ng-template>
    </ng-template>

    <ng-template #gridAndYAxis let-chart>
      @for (tick of chart.grid; track $index) {
        <svg:g>
          @if (tick.line; as line) {
            <svg:line
              [attr.x1]="line.x1"
              [attr.y1]="line.y1"
              [attr.x2]="line.x2"
              [attr.y2]="line.y2"
              [attr.stroke]="line.stroke"
              [attr.stroke-width]="0.5"
              [attr.stroke-dasharray]="'3 3'"
            />
          }
          <svg:text
            font-family="sans-serif"
            [attr.x]="tick.text.x"
            [attr.y]="tick.text.y"
            [attr.fill]="tick.text.fill"
            [attr.text-anchor]="'end'"
            [attr.font-size]="7"
          >
            <ng-container>{{ tick.text.text }}</ng-container>
          </svg:text>
        </svg:g>
      }
    </ng-template>

    <ng-template #axisLine let-line>
      <svg:line
        [attr.x1]="line.x1"
        [attr.y1]="line.y1"
        [attr.x2]="line.x2"
        [attr.y2]="line.y2"
        [attr.stroke]="line.stroke"
        [attr.stroke-width]="1"
      />
    </ng-template>
  `,
})
export class PdfGraph {
  readonly variant = input<GraphVariant>("bar");
  readonly data = input.required<GraphDataPoint[] | GraphSeries[]>();
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly xLabel = input<string>();
  readonly yLabel = input<string>();
  readonly width = input<number>();
  readonly height = input(260);
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly containerPadding = input(0);
  readonly wrapperPadding = input(0);
  readonly colors = input<string[]>();
  readonly showValues = input(false, { transform: booleanAttribute });
  readonly showGrid = input(true, { transform: booleanAttribute });
  readonly legend = input<GraphLegendPosition>("bottom");
  readonly centerLabel = input<string>();
  readonly showDots = input(true, { transform: booleanAttribute });
  readonly smooth = input(false, { transform: booleanAttribute });
  readonly yTicks = input(5);
  readonly noWrap = input(true, { transform: booleanAttribute });
  readonly style = input<GraphProps["style"]>();

  private readonly theme = injectPdfcnTheme();
  protected readonly graph = computed(() =>
    graphLayout(this.theme(), {
      centerLabel: this.centerLabel(),
      colors: this.colors(),
      containerPadding: this.containerPadding(),
      data: this.data(),
      fullWidth: this.fullWidth(),
      height: this.height(),
      legend: this.legend(),
      showDots: this.showDots(),
      showGrid: this.showGrid(),
      showValues: this.showValues(),
      smooth: this.smooth(),
      style: this.style(),
      subtitle: this.subtitle(),
      title: this.title(),
      variant: this.variant(),
      width: this.width(),
      wrapperPadding: this.wrapperPadding(),
      xLabel: this.xLabel(),
      yLabel: this.yLabel(),
      yTicks: this.yTicks(),
    })
  );
}
