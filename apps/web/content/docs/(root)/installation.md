---
title: Installation
description: Install PDF components, blocks, and themes from the registry.
---

## Prerequisites

An Angular project that can run either [Takumi](https://takumi.kane.tw/docs/pdf) or [Forme](https://docs.formepdf.com). The registry installs the renderer packages for the base you pick: `takumi-pdf` and `@takumi-rs/helpers` for Takumi, `@formepdf/core` and `@formepdf/shared` for Forme.

## Configure Your Project

`shadcn add` works in Angular projects, but `shadcn init` does not support Angular. Create `components.json` in your project root once instead:

::components-json

The `registries` entry maps the `@angular-pdfcn` namespace to this site. The aliases decide where the CLI writes files.

Installed files import each other through `@/`. Map it to `src` in `tsconfig.json`:

::tsconfig-paths

## Installation

Run the following command to add a Takumi component:

::add-command{names="takumi/text"}

Forme components use the `forme/` namespace:

::add-command{names="forme/text"}

The registry installs the matching renderer dependencies and the shared theme utilities required by the selected component.

## Usage

Import the installed component into a standalone component and use it inside your renderer's document primitives:

::::tabs
:::tab{value="takumi" label="Takumi"}

```angular-ts
import { Component } from "@angular/core";

import { PdfText } from "@/components/pdf/text/text";
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { TakumiDocument, TakumiPage } from "@/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfText],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-text variant="xl">Invoice</pdf-text>
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export class Invoice {}
```

:::
:::tab{value="forme" label="Forme"}

```angular-ts
import { Component } from "@angular/core";

import { PdfText } from "@/components/pdf/text/text";
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { FormeDocument, FormePage } from "@/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfcnThemeProvider, PdfText],
  template: `
    <forme-document>
      <forme-page size="A4">
        <pdf-theme-provider>
          <pdf-text variant="xl">Invoice</pdf-text>
        </pdf-theme-provider>
      </forme-page>
    </forme-document>
  `,
})
export class Invoice {}
```

:::
::::

The installed component API is the same for both bases. Only the document primitives differ.

## Render a PDF

The installed `lib/render.ts` turns a document component into the renderer's input. `renderTakumiDocument` and `renderFormeDocument` create the component once outside your app, read the element tree it renders, and serialize that tree for the engine. Pass the result to the renderer:

::::tabs
:::tab{value="takumi" label="Takumi"}

```ts
import { render } from "takumi-pdf";

import { renderTakumiDocument } from "@/lib/render";
import { Invoice } from "./invoice";

const { node } = renderTakumiDocument(Invoice);
const pdf = await render(node, { size: "a4" });
```

:::
:::tab{value="forme" label="Forme"}

```ts
import { renderPdf } from "@formepdf/core";

import { renderFormeDocument } from "@/lib/render";
import { Invoice } from "./invoice";

const pdf = await renderPdf(JSON.stringify(renderFormeDocument(Invoice)));
```

:::
::::

`pdf` holds the PDF bytes as a `Uint8Array`. To set the component's inputs, pass them as `inputs`, for example `renderTakumiDocument(InvoiceClassicDocument, { inputs: { theme } })`.

## Install a Block

Blocks are complete document templates composed from registry components:

::add-command{names="takumi/invoice-minimal"}

Use the `forme/` namespace for the equivalent Forme document:

::add-command{names="forme/invoice-minimal"}

## Install a Theme

angular-pdfcn ships theme presets that work with `<pdf-theme-provider>`. Both bases share them:

::add-command{names="theme-minimal"}
