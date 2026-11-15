---
title: "PDF Image"
description: "Embedded image with fit options."
---

::preview{base="forme" name="pdf-image"}

## Installation

::installation{base="forme" name="pdf-image"}

## Usage

::example{base="forme" name="pdf-image"}

## API Reference

### PdfImage

| Input          | Type                                                                                          | Default     |
| -------------- | --------------------------------------------------------------------------------------------- | ----------- |
| `src`          | `string \| { uri: string; method?: string; headers?: Record<string, string>; body?: string }` | -           |
| `variant`      | `'default' \| 'full-width' \| 'thumbnail' \| 'avatar' \| 'cover' \| 'bordered' \| 'rounded'`  | `'default'` |
| `width`        | `number \| string`                                                                            | -           |
| `height`       | `number \| string`                                                                            | -           |
| `fit`          | `'cover' \| 'contain' \| 'fill' \| 'none'`                                                    | -           |
| `position`     | `string`                                                                                      | `'50% 50%'` |
| `caption`      | `string`                                                                                      | -           |
| `aspectRatio`  | `number`                                                                                      | -           |
| `borderRadius` | `number`                                                                                      | -           |
| `noWrap`       | `boolean`                                                                                     | `true`      |
| `style`        | `Style`                                                                                       | -           |
