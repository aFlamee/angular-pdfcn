---
title: "Executive"
description: "Deep navy palette, Merriweather serif headings, premium boardroom aesthetic."
---

::preview{base="forme" name="invoice-corporate" theme="executive"}

## Installation

::installation{name="theme-executive"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { executiveTheme } from "@/lib/pdf-themes/executive";

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
  protected readonly theme = executiveTheme;
}
```
