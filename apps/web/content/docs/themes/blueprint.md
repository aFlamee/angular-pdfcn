---
title: "Blueprint"
description: "Dark slate with cyan accent, monospace headings, technical precision."
---

::preview{base="forme" name="invoice-classic" theme="blueprint"}

## Installation

::installation{name="theme-blueprint"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { blueprintTheme } from "@/lib/pdf-themes/blueprint";

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
  protected readonly theme = blueprintTheme;
}
```
