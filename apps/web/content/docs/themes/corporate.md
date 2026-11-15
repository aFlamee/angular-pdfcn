---
title: "Corporate"
description: "Blue-gray palette, Lato sans-serif, structured and dependable."
---

::preview{base="forme" name="invoice-corporate" theme="corporate"}

## Installation

::installation{name="theme-corporate"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { corporateTheme } from "@/lib/pdf-themes/corporate";

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
  protected readonly theme = corporateTheme;
}
```
