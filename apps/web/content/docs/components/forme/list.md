---
title: "List"
description: "Ordered and unordered lists."
---

::preview{base="forme" name="list"}

## Installation

::installation{base="forme" name="list"}

## Usage

::example{base="forme" name="list"}

### Variants

```angular-html
<pdf-list variant="numbered" [items]="items" />
<pdf-list variant="checklist" [items]="checklistItems" gap="md" />
```

## API Reference

### PdfList

| Input     | Type                                                                                | Default    |
| --------- | ----------------------------------------------------------------------------------- | ---------- |
| `items`   | `ListItem[]`                                                                        | -          |
| `variant` | `'bullet' \| 'numbered' \| 'checklist' \| 'icon' \| 'multi-level' \| 'descriptive'` | `'bullet'` |
| `gap`     | `'xs' \| 'sm' \| 'md'`                                                              | `'sm'`     |
| `noWrap`  | `boolean`                                                                           | `false`    |
| `style`   | `Style`                                                                             | -          |
