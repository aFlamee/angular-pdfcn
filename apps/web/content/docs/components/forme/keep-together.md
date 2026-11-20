---
title: "Keep Together"
description: "Keeps children on one PDF page when they fit."
---

::preview{base="forme" name="keep-together"}

## Installation

::installation{base="forme" name="keep-together"}

## Usage

::example{base="forme" name="keep-together"}

## API Reference

### PdfKeepTogether

| Input              | Type     | Default |
| ------------------ | -------- | ------- |
| `minPresenceAhead` | `number` | -       |
| `style`            | `Style`  | -       |

The content to keep on one page is projected content. If it doesn't fit in the space left on the page, it starts on the next page. Text taller than a full page still splits across pages, so it leaves the rest of the previous page empty. Let long text flow instead of wrapping it.

Forme ignores `minPresenceAhead`. The input exists for parity with pdfcn.
