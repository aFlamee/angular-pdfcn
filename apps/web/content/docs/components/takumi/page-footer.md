---
title: "Page Footer"
description: "Repeating page footer."
---

::preview{base="takumi" name="page-footer"}

## Installation

::installation{base="takumi" name="page-footer"}

## Usage

::example{base="takumi" name="page-footer"}

## API Reference

### PdfPageFooter

| Input         | Type                                                                               | Default    |
| ------------- | ---------------------------------------------------------------------------------- | ---------- |
| `leftText`    | `string \| TemplateRef<unknown>`                                                   | -          |
| `rightText`   | `string \| TemplateRef<unknown>`                                                   | -          |
| `centerText`  | `string \| TemplateRef<unknown>`                                                   | -          |
| `variant`     | `'simple' \| 'centered' \| 'branded' \| 'minimal' \| 'three-column' \| 'detailed'` | `'simple'` |
| `background`  | `string`                                                                           | -          |
| `textColor`   | `string`                                                                           | -          |
| `marginTop`   | `number`                                                                           | -          |
| `address`     | `string`                                                                           | -          |
| `phone`       | `string`                                                                           | -          |
| `email`       | `string`                                                                           | -          |
| `website`     | `string`                                                                           | -          |
| `fixed`       | `boolean`                                                                          | `false`    |
| `sticky`      | `boolean`                                                                          | `false`    |
| `pagePadding` | `number`                                                                           | `0`        |
| `noWrap`      | `boolean`                                                                          | `true`     |
