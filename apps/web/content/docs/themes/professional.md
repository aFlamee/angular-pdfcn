---
title: "Professional"
description: "Serif headings, refined zinc/slate palette, formal document feel."
---

::preview{base="forme" name="invoice-classic" theme="professional"}

## Installation

::installation{name="theme-professional"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { professionalTheme } from "@/lib/pdf-themes/professional";

@Component({
  selector: "app-invoice",
  imports: [PdfcnThemeProvider],
  template: `
    <pdf-theme-provider [theme]="theme">
      <!-- Your PDF content -->
    </pdf-theme-provider>
  `,
})
export class Invoice {
  protected readonly theme = professionalTheme;
}
```
