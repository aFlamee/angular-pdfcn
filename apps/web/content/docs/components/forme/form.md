---
title: "Form"
description: "Labeled form groups for PDF inputs."
---

::preview{base="forme" name="form"}

## Installation

::installation{base="forme" name="form"}

## Usage

::example{base="forme" name="form"}

### Variants

```angular-html
<pdf-form
  variant="outlined"
  labelPosition="left"
  [groups]="[{ title: 'Contact', layout: 'two-column', fields }]"
/>
```

## API Reference

### PdfForm

| Input           | Type                                            | Default       |
| --------------- | ----------------------------------------------- | ------------- |
| `title`         | `string`                                        | -             |
| `subtitle`      | `string`                                        | -             |
| `groups`        | `PdfFormGroup[]`                                | -             |
| `variant`       | `'underline' \| 'box' \| 'outlined' \| 'ghost'` | `'underline'` |
| `labelPosition` | `'above' \| 'left'`                             | `'above'`     |
| `noWrap`        | `boolean`                                       | `false`       |
| `style`         | `Style`                                         | -             |

Groups support `single`, `two-column`, and `three-column` layouts.
