---
title: "Table"
description: "Low-level table primitives."
---

::preview{base="forme" name="table"}

## Installation

::installation{base="forme" name="table"}

## Usage

::example{base="forme" name="table"}

### Variants

```angular-html
<pdf-table variant="striped" zebraStripe>
  <!-- header, body, rows, and cells -->
</pdf-table>
```

## API Reference

### PdfTable

| Input         | Type                                                                                        | Default  |
| ------------- | ------------------------------------------------------------------------------------------- | -------- |
| `variant`     | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | `'line'` |
| `zebraStripe` | `boolean`                                                                                   | `false`  |
| `noWrap`      | `boolean`                                                                                   | `false`  |
| `style`       | `Style`                                                                                     | -        |

Rows and cells are projected content. `pdf-table-header`, `pdf-table-body`, and `pdf-table-footer` group the rows and take a `style` input.

### PdfTableRow

| Input     | Type                                                                                        | Default   |
| --------- | ------------------------------------------------------------------------------------------- | --------- |
| `header`  | `boolean`                                                                                   | `false`   |
| `footer`  | `boolean`                                                                                   | `false`   |
| `stripe`  | `boolean`                                                                                   | `false`   |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | inherited |

### PdfTableCell

| Input     | Type                                                                                        | Default   |
| --------- | ------------------------------------------------------------------------------------------- | --------- |
| `header`  | `boolean`                                                                                   | `false`   |
| `footer`  | `boolean`                                                                                   | `false`   |
| `align`   | `'left' \| 'center' \| 'right'`                                                             | `'left'`  |
| `width`   | `string \| number`                                                                          | -         |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | inherited |
