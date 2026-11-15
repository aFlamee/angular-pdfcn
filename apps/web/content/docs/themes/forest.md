---
title: "Forest"
description: "Natural deep greens, Merriweather headings, earthy and trustworthy."
---

::preview{base="forme" name="invoice-classic" theme="forest"}

## Installation

::installation{name="theme-forest"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { forestTheme } from "@/lib/pdf-themes/forest";

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
  protected readonly theme = forestTheme;
}
```
