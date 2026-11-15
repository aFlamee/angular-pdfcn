---
title: "Elegant"
description: "Warm cream whites, amber/gold accent, classic editorial combination."
---

::preview{base="forme" name="invoice-creative" theme="elegant"}

## Installation

::installation{name="theme-elegant"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { elegantTheme } from "@/lib/pdf-themes/elegant";

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
  protected readonly theme = elegantTheme;
}
```
