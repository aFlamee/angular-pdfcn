---
title: "Badge"
description: "Compact status badge for labels and tags."
---

::preview{base="forme" name="badge"}

## Installation

::installation{base="forme" name="badge"}

## Usage

::example{base="forme" name="badge"}

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
