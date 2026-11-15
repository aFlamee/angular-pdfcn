---
title: "Signature"
description: "Signature block with name and label."
---

::preview{base="takumi" name="signature"}

## Installation

::installation{base="takumi" name="signature"}

## Usage

::example{base="takumi" name="signature"}

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
