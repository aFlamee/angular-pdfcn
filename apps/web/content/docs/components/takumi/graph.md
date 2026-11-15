---
title: "Graph"
description: "Bar, line, and area charts drawn with SVG."
---

::preview{base="takumi" name="graph"}

## Installation

::installation{base="takumi" name="graph"}

## Usage

::example{base="takumi" name="graph"}

### Variants

```angular-html
<pdf-graph variant="line" [data]="series" showDots smooth />
<pdf-graph variant="donut" [data]="totals" centerLabel="$48k" />
```

## API Reference

### PdfGraph

| Input         | Type                                                                | Default    |
| ------------- | ------------------------------------------------------------------- | ---------- |
| `variant`     | `'bar' \| 'horizontal-bar' \| 'line' \| 'area' \| 'pie' \| 'donut'` | `'bar'`    |
| `data`        | `GraphDataPoint[] \| GraphSeries[]`                                 | -          |
| `title`       | `string`                                                            | -          |
| `subtitle`    | `string`                                                            | -          |
| `xLabel`      | `string`                                                            | -          |
| `yLabel`      | `string`                                                            | -          |
| `width`       | `number`                                                            | `420`      |
| `height`      | `number`                                                            | `260`      |
| `fullWidth`   | `boolean`                                                           | `false`    |
| `colors`      | `string[]`                                                          | theme      |
| `showValues`  | `boolean`                                                           | `false`    |
| `showGrid`    | `boolean`                                                           | `true`     |
| `legend`      | `'bottom' \| 'right' \| 'none'`                                     | `'bottom'` |
| `centerLabel` | `string`                                                            | -          |
| `showDots`    | `boolean`                                                           | `true`     |
| `smooth`      | `boolean`                                                           | `false`    |
| `yTicks`      | `number`                                                            | `5`        |
| `noWrap`      | `boolean`                                                           | `true`     |
| `style`       | `Style`                                                             | -          |
