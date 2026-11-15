---
title: Registry
description: Learn how to use the angular-pdfcn registry with the shadcn CLI.
---

The **angular-pdfcn** registry ships Takumi and Forme components, blocks, and themes in the [shadcn registry format](https://ui.shadcn.com/docs/registry). Register the namespace once in `components.json`, then pull items by name with the CLI.

## Setup

Add a **registries** entry for this site. Angular projects need the whole file, because `shadcn init` does not support Angular. See the [shadcn registry documentation](https://ui.shadcn.com/docs/registry) for all `components.json` fields and behaviors.

::components-json

Keep the `@angular-pdfcn` namespace. Registry items depend on each other through it, so the CLI resolves dependencies only when the namespace matches.

## Usage

Items are namespaced by base: `takumi/` for Takumi and `forme/` for Forme. Themes have no base prefix, because both bases share them.

Registry files follow these destinations:

- Components install into `components/pdf/`.
- Blocks install into `components/pdf/blocks/`.
- Themes install into `lib/pdf-themes/`, and shared helpers such as `lib/render.ts` and `lib/pdf-primitives.ts` into `lib/`.

Components declare their dependencies, so installing a component does not require additional setup.

### Takumi

Install a component:

::add-command{names="takumi/text"}

Install a block:

::add-command{names="takumi/invoice-minimal"}

### Forme

Install a component:

::add-command{names="forme/text"}

Install a block:

::add-command{names="forme/invoice-minimal"}
