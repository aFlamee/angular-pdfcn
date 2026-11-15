---
title: "Vivid"
description: "Deep violet palette, Nunito rounded sans-serif, playful but professional."
---

::preview{base="forme" name="invoice-creative" theme="vivid"}

## Installation

::installation{name="theme-vivid"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { vividTheme } from "@/lib/pdf-themes/vivid";

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
  protected readonly theme = vividTheme;
}
```
