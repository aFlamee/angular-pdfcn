---
title: "Modern"
description: "All-Helvetica typography, slate-cool neutrals with subtle violet accent."
---

::preview{base="forme" name="invoice-modern" theme="modern"}

## Installation

::installation{name="theme-modern"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { modernTheme } from "@/lib/pdf-themes/modern";

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
  protected readonly theme = modernTheme;
}
```
