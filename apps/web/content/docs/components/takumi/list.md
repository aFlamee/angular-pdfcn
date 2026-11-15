---
title: "List"
description: "Ordered and unordered lists."
---

::preview{base="takumi" name="list"}

## Installation

::installation{base="takumi" name="list"}

## Usage

::example{base="takumi" name="list"}

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
