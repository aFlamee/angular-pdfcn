---
title: "Minimal"
description: "Courier headings, zinc neutrals, maximum whitespace."
---

::preview{base="forme" name="invoice-minimal" theme="minimal"}

## Installation

::installation{name="theme-minimal"}

## Usage

```angular-ts
import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { minimalTheme } from "@/lib/pdf-themes/minimal";

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
  protected readonly theme = minimalTheme;
}
```
