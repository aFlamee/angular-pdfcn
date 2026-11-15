---
title: "Badge"
description: "Compact status badge for labels and tags."
---

::preview{base="takumi" name="badge"}

## Installation

::installation{base="takumi" name="badge"}

## Usage

::example{base="takumi" name="badge"}

## API Reference

### PdfBadge

| Input        | Type                                                                                       | Default     |
| ------------ | ------------------------------------------------------------------------------------------ | ----------- |
| `label`      | `string`                                                                                   | -           |
| `variant`    | `'default' \| 'primary' \| 'success' \| 'warning' \| 'destructive' \| 'info' \| 'outline'` | `'default'` |
| `size`       | `'sm' \| 'md' \| 'lg'`                                                                     | `'md'`      |
| `background` | `string`                                                                                   | -           |
| `color`      | `string`                                                                                   | -           |

The badge text is the `label` input or projected content.
