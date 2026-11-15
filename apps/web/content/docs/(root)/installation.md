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

`pdf` holds the PDF bytes as a `Uint8Array`. To set the component's inputs, pass them as `inputs`, for example `renderTakumiDocument(InvoiceClassicDocument, { inputs: { theme } })`. In a browser app, render in a Web Worker instead, as the next section shows.

## Render in the Browser

Both engines compile WebAssembly, and a strict Content Security Policy blocks that on the page. Angular's `security.autoCsp` option writes such a policy as a `<meta>` tag. It can allow WebAssembly only through `unsafeEval`, which also allows `eval()`. A `<meta>` policy doesn't apply to Web Workers, so run the engine in a worker. Your app serializes the document, and the worker turns it into PDF bytes.

Angular bundles workers without plugins, so the worker loads each engine's web build and fetches the `.wasm` file itself. Create the worker:

```bash
ng generate web-worker pdf
```

Copy the engine's `.wasm` file into the build output with an entry in the `assets` array of `angular.json`, then replace the generated worker:

::::tabs
:::tab{value="takumi" label="Takumi"}

```json title="angular.json"
{
  "glob": "takumi_pdf_wasm_bg.wasm",
  "input": "node_modules/takumi-pdf/pkg",
  "output": "takumi"
}
```

```ts title="src/app/pdf.worker.ts"
/// <reference lib="webworker" />
import init, { render } from "takumi-pdf/no-init";

const ready = init({
  module_or_path: new URL("takumi/takumi_pdf_wasm_bg.wasm", location.href),
});

addEventListener("message", async ({ data, ports: [port] }) => {
  try {
    await ready;
    const pdf = await render(data.node, data.options);
    port.postMessage({ pdf }, [pdf.buffer]);
  } catch (error) {
    port.postMessage({ error });
  }
});
```

:::
:::tab{value="forme" label="Forme"}

```json title="angular.json"
{
  "glob": "forme_bg.wasm",
  "input": "node_modules/@formepdf/core/pkg-web",
  "output": "forme"
}
```

```ts title="src/app/pdf.worker.ts"
/// <reference lib="webworker" />
import { init, renderSerializedDoc } from "@formepdf/core/worker";

const ready = init(new URL("forme/forme_bg.wasm", location.href));

addEventListener("message", async ({ data, ports: [port] }) => {
  try {
    await ready;
    const pdf = await renderSerializedDoc(data);
    port.postMessage({ pdf }, [pdf.buffer]);
  } catch (error) {
    port.postMessage({ error });
  }
});
```

:::
::::

In your app, send each document to the worker with its own `MessageChannel`, so that concurrent renders get their own replies:

::::tabs
:::tab{value="takumi" label="Takumi"}

```ts
import { renderTakumiDocument } from "@/lib/render";
import { Invoice } from "./invoice";

const worker = new Worker(new URL("./pdf.worker", import.meta.url), {
  type: "module",
});

const renderInWorker = (message: unknown) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = ({ data }) =>
      data.error ? reject(data.error) : resolve(data.pdf);
    worker.postMessage(message, [port2]);
  });

const { node } = renderTakumiDocument(Invoice);
const pdf = await renderInWorker({ node, options: { size: "a4" } });
```

:::
:::tab{value="forme" label="Forme"}

```ts
import { renderFormeDocument } from "@/lib/render";
import { Invoice } from "./invoice";

const worker = new Worker(new URL("./pdf.worker", import.meta.url), {
  type: "module",
});

const renderInWorker = (message: unknown) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = ({ data }) =>
      data.error ? reject(data.error) : resolve(data.pdf);
    worker.postMessage(message, [port2]);
  });

const pdf = await renderInWorker(renderFormeDocument(Invoice));
```

:::
::::

### Fonts

Forme renders every font family you don't register with a standard PDF font: Helvetica, Times-Roman, or Courier. These cover Western European text such as ä, ß, „“, and €, and print other characters, such as ≥, →, and ✓, as `?`. Takumi rejects the render instead, with an error such as `No registered font covers ≥ (U+2265)`. Register a TrueType font that covers your text:

::::tabs
:::tab{value="takumi" label="Takumi"}

```ts
const pdf = await renderInWorker({
  node,
  options: { size: "a4", fonts: ["/fonts/NotoSans-Regular.ttf"] },
});
```

:::
:::tab{value="forme" label="Forme"}

```ts
const doc = renderFormeDocument(Invoice, { inputs: { theme } });
doc.fonts = [
  ...(doc.fonts ?? []),
  {
    family: "Noto Sans",
    src: "/fonts/NotoSans-Regular.ttf",
    weight: 400,
    italic: false,
  },
];
const pdf = await renderInWorker(doc);
```

For Forme, `family` must match the font family that your theme's typography names. `src` takes a URL or a data URI. Forme embeds only the glyphs that the document uses.

:::
::::

## Install a Block

Blocks are complete document templates composed from registry components:

::add-command{names="takumi/invoice-minimal"}

Use the `forme/` namespace for the equivalent Forme document:

::add-command{names="forme/invoice-minimal"}

## Install a Theme

angular-pdfcn ships theme presets that work with `<pdf-theme-provider>`. Both bases share them:

::add-command{names="theme-minimal"}
