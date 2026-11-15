---
title: "Signature"
description: "Signature block with name and label."
---

::preview{base="forme" name="signature"}

## Installation

::installation{base="forme" name="signature"}

## Usage

::example{base="forme" name="signature"}

## API Reference

### PdfSignatureBlock

| Input     | Type                                 | Default    |
| --------- | ------------------------------------ | ---------- |
| `variant` | `'single' \| 'double' \| 'inline'`   | `'single'` |
| `label`   | `string`                             | -          |
| `name`    | `string`                             | -          |
| `title`   | `string`                             | -          |
| `date`    | `string`                             | -          |
| `signers` | `[SignatureSigner, SignatureSigner]` | -          |
| `style`   | `Style`                              | -          |
