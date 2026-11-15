---
title: Theming
description: Configure PDF themes, colors, typography, and spacing for Takumi.
---

::theme-preview{base="takumi"}

## Installation

::installation{name="takumi/theme-provider"}

## Usage

Wrap your document content in `<pdf-theme-provider>` and pass a theme through its `theme` input. Without a provider, components use the professional theme.

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

### Read the theme

`injectPdfcnTheme()` returns the nearest provider's theme as a signal. Use it to style your own components with theme tokens.

```angular-ts
import { Component, computed } from "@angular/core";

import { injectPdfcnTheme } from "@/components/pdf/theme-provider";
import { TakumiText } from "@/lib/pdf-primitives";

@Component({
  selector: "app-brand-line",
  imports: [TakumiText],
  template: `<takumi-text [style]="style()">Acme Inc.</takumi-text>`,
})
export class BrandLine {
  private readonly theme = injectPdfcnTheme();
  protected readonly style = computed(() => ({
    color: this.theme().colors.primary,
  }));
}
```

## Color Tokens

Use hex strings for all color values, such as `#1a1a1a`. The PDF renderers do not support `oklch`.

| Token               | Purpose                     |
| ------------------- | --------------------------- |
| `foreground`        | Primary text color          |
| `background`        | Page background             |
| `muted`             | Secondary backgrounds       |
| `mutedForeground`   | Captions, footnotes         |
| `primary`           | Brand/accent color          |
| `primaryForeground` | Text on primary backgrounds |
| `border`            | Table borders, dividers     |
| `accent`            | Call-to-action elements     |
| `destructive`       | Error states                |
| `success`           | Success states              |
| `warning`           | Warning states              |
| `info`              | Informational states        |

## Primitive Tokens

Primitives define the raw design scales available to themes:

- **Typography Scale**: Major Third (1.25) ratio with 12pt base
- **Spacing Scale**: 4pt grid system
- **Font Weights**: 400–700
- **Line Heights**: 1.2–1.6
- **Border Radius**: 0–8pt

## Custom Themes

Use the `PdfcnTheme` interface to create custom themes while preserving the complete theme shape.

```ts
import { defaultPrimitives } from "@/lib/pdf-themes/primitives";
import type { PdfcnTheme } from "@/types/pdf-themes";

export const oceanTheme: PdfcnTheme = {
  name: "ocean",
  primitives: defaultPrimitives,
  colors: {
    foreground: "#0f172a",
    background: "#ffffff",
    primary: "#0369a1",
    accent: "#0ea5e9",
    muted: "#f1f5f9",
    border: "#e2e8f0",
    mutedForeground: "#64748b",
    primaryForeground: "#ffffff",
    destructive: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    info: "#0ea5e9",
  },
  typography: {
    body: { fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.6 },
    heading: {
      fontFamily: "Times-Roman",
      fontWeight: 700,
      lineHeight: 1.25,
      fontSize: { h1: 32, h2: 24, h3: 20, h4: 16, h5: 14, h6: 12 },
    },
  },
  spacing: {
    page: { marginTop: 56, marginRight: 48, marginBottom: 56, marginLeft: 48 },
    sectionGap: 28,
    paragraphGap: 10,
    componentGap: 14,
  },
  page: { size: "A4", orientation: "portrait" },
};
```

## Available Themes

::theme-preview-grid
