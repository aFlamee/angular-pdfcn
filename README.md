<img src="assets/icon.svg" width="64" height="64" alt="">

# angular-pdfcn

PDF components for Angular that you add to your app with the shadcn CLI and then own. It is a community port of [pdfcn](https://github.com/shadcn-labs/pdfcn), in the spirit of [shadcn-svelte](https://www.shadcn-svelte.com).

You write a document as Angular components. angular-pdfcn renders it to a node tree, and one of two engines turns that tree into a PDF:

- [Forme](https://docs.formepdf.com), with items under `forme/`
- [Takumi](https://takumi.kane.tw/docs/pdf), with items under `takumi/`

Each base has the same components (text, tables, key-value lists, charts, QR codes, signatures, and more), blocks (invoices, reports, tickets, forms), and themes.

## Install

`shadcn init` does not support Angular, but `shadcn add` works in any Angular app after two one-time steps.

1. Add the `@/` path alias to `compilerOptions` in `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "paths": { "@/*": ["./src/*"] }
     }
   }
   ```

2. Create `components.json` in the app root. The `registries` entry points the CLI at angular-pdfcn:

   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "aliases": {
       "components": "@/components",
       "hooks": "@/hooks",
       "lib": "@/lib",
       "ui": "@/components/ui",
       "utils": "@/lib/utils"
     },
     "registries": {
       "@angular-pdfcn": "https://raw.githubusercontent.com/aFlamee/angular-pdfcn/main/apps/web/public/r/{name}.json"
     },
     "rsc": false,
     "style": "new-york",
     "tailwind": {
       "baseColor": "neutral",
       "config": "",
       "css": "src/styles.css",
       "cssVariables": true
     },
     "tsx": true
   }
   ```

Then add components or blocks by name:

```bash
npx shadcn@latest add @angular-pdfcn/forme/invoice-classic
```

The CLI copies the item and everything it depends on into `src/components/pdf`, `src/lib`, and `src/types`, and installs the npm packages it needs.

Use one base per app. Forme and Takumi items install to the same paths.

## Render a PDF

With Forme:

```ts
import { renderPdf } from "@formepdf/core";

import { InvoiceClassicDocument } from "@/components/pdf/blocks/invoice-classic/invoice-classic";
import { renderFormeDocument } from "@/lib/render";

const pdf = await renderPdf(
  JSON.stringify(renderFormeDocument(InvoiceClassicDocument))
);
```

With Takumi:

```ts
import { render } from "takumi-pdf";

import { InvoiceClassicDocument } from "@/components/pdf/blocks/invoice-classic/invoice-classic";
import { renderTakumiDocument } from "@/lib/render";

const pdf = await render(renderTakumiDocument(InvoiceClassicDocument).node);
```

Both return the PDF as a `Uint8Array`. To set a component's inputs, pass them as `renderFormeDocument(Component, { inputs: { ... } })`. `renderTakumiDocument` takes the same options.

In `ng test`, `takumi-pdf` resolves to its Vite entry, which cannot load the engine's WebAssembly in Node. Import from `takumi-pdf/no-init` there and call `initSync({ module: readFileSync("node_modules/takumi-pdf/pkg/takumi_pdf_wasm_bg.wasm") })` before you render.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how the port works and how to add a component. Report security issues as described in [SECURITY.md](SECURITY.md). By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)

## Credits

angular-pdfcn ports [pdfcn](https://github.com/shadcn-labs/pdfcn) by Shadcn Labs. The component designs, styles, sample data, and themes come from pdfcn and [its contributors](https://github.com/shadcn-labs/pdfcn/graphs/contributors).
