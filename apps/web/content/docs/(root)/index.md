---
title: "Introduction"
description: "Copy-paste PDF components for Angular. Built on Takumi and Forme, works with the shadcn CLI."
---

**angular-pdfcn** provides beautifully designed, accessible, and customizable PDF components for Angular. Built on [Takumi](https://takumi.kane.tw/docs/pdf) and [Forme](https://docs.formepdf.com), and designed to work seamlessly with the [shadcn CLI](https://ui.shadcn.com).

angular-pdfcn is a community Angular port of [pdfcn](https://github.com/shadcn-labs/pdfcn).

## Philosophy

angular-pdfcn follows the shadcn model for document generation: copy-paste components you can own, with zero lock-in and sensible defaults that work immediately.

PDF layouts are often treated as one-off templates, assembled with renderer-specific primitives, duplicated styling, and brittle page-break logic. angular-pdfcn takes a different approach. It stays close to each renderer's primitives, keeps the API familiar across Takumi and Forme, and lets you drop down to the underlying renderer whenever you need more control.

The goal is simple: make generated PDFs feel like the rest of your Angular app. Composable, themeable, accessible, and easy to customize.

## Why angular-pdfcn?

Most PDF component setups are either too opinionated or too scattered. angular-pdfcn is built for teams that want to ship quickly without giving up control:

- **Own Your Code:** Copy the components into your project and customize everything.
- **Start Fast:** Run one command and render your first document with production-ready defaults.
- **Choose Your Engine:** Use the same component API with Takumi or Forme, then drop to raw renderer APIs when needed.

## Features

:::grid
::feature-card{icon="zap" title="Zero Config" description="Works out of the box with sensible defaults and renderer-aware installation."}
::feature-card{icon="sun-moon" title="Theme Aware" description="Share a consistent PDF theme across components, blocks, and both rendering bases."}
::feature-card{icon="layout-grid" title="Composable" description="Build invoices, reports, forms, and tables from small standalone components."}
::feature-card{icon="code-xml" title="TypeScript" description="Full type safety with matching inputs across Takumi and Forme."}
::feature-card{icon="clipboard-copy" title="Copy & Paste" description="Own your PDF code. Install it into your project and customize every detail."}
::feature-card{icon="blocks" title="shadcn Compatible" description="Uses the shadcn registry format. Add components and blocks with one command."}
:::
