---
title: November 15, 2026 - Initial Release
description: The Angular port of pdfcn, with every component, block, and theme on Takumi PDF and Forme PDF.
date: 2026-11-15
---

We shipped the initial release of angular-pdfcn, a community Angular port of [pdfcn](https://github.com/shadcn-labs/pdfcn).

:::grid{class="mt-6 flex w-full items-center justify-center gap-4 rounded-lg border bg-muted/50 py-32"}
::icon{name="takumi" class="size-12"}
::icon{name="plus" class="size-8 text-muted-foreground"}
::icon{name="forme" class="size-12"}
:::

### What's new

- **24 components and 20 blocks** for both [Takumi PDF](/docs/components/takumi/text) and [Forme PDF](/docs/components/forme/text), written as Angular components
- **The shadcn CLI**: install any item with `npx shadcn@latest add @angular-pdfcn/<name>` after a one-time [setup](/docs/installation)
- **Rendering in Node or the browser**: `renderFormeDocument` and `renderTakumiDocument` turn a component into the engine's document, with no DOM
- **9 [themes](/docs/themes)** and the [Theme Builder](/theme-builder/takumi), with live PDF preview and code export
