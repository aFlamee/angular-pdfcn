---
title: "Page Header"
description: "Repeating page header."
---

::preview{base="takumi" name="page-header"}

## Installation

::installation{base="takumi" name="page-header"}

## Usage

::example{base="takumi" name="page-header"}

## API Reference

### PdfPageHeader

| Input          | Type                                                                                              | Default    |
| -------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| `title`        | `string`                                                                                          | -          |
| `subtitle`     | `string`                                                                                          | -          |
| `rightText`    | `string`                                                                                          | -          |
| `rightSubText` | `string`                                                                                          | -          |
| `variant`      | `'simple' \| 'centered' \| 'minimal' \| 'branded' \| 'logo-left' \| 'logo-right' \| 'two-column'` | `'simple'` |
| `background`   | `string`                                                                                          | -          |
| `titleColor`   | `string`                                                                                          | -          |
| `marginBottom` | `number`                                                                                          | -          |
| `address`      | `string`                                                                                          | -          |
| `phone`        | `string`                                                                                          | -          |
| `email`        | `string`                                                                                          | -          |
| `logo`         | `TemplateRef<unknown>`                                                                            | -          |
| `fixed`        | `boolean`                                                                                         | `false`    |
| `noWrap`       | `boolean`                                                                                         | `true`     |
