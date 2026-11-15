# Contributing to angular-pdfcn

This guide covers how the port works, how to run it locally, and how to add a component.

## Prerequisites

- Node.js 22.22 or later
- pnpm, at the version pinned in [`package.json`](./package.json)

## Getting started

Fork the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/<your-username>/angular-pdfcn.git
cd angular-pdfcn
pnpm install
pnpm dev
```

`pnpm dev` starts the documentation site from `apps/web`.

## How it works

Everything lives in `apps/web`.

- **Renderer.** `registry/lib/pdf-renderer.ts` is a custom Angular `RendererFactory2`. It renders a component into a plain node tree instead of the DOM.
- **Primitives.** Each base has directives in `registry/bases/{forme,takumi}/lib/pdf-primitives.ts`, such as `forme-page`, `forme-text`, `takumi-view`, and `takumi-text`. An element with a primitive becomes an engine node. Elements without one, such as component hosts, are transparent and pass their children through.
- **Serializers.** `registry/bases/{forme,takumi}/lib/render.ts` turn the tree into the engine's document. `renderFormeDocument` returns the Forme JSON that `@formepdf/core` renders. `renderTakumiDocument` returns the Takumi node that `takumi-pdf` renders.
- **Components and blocks.** `registry/bases/{base}/components` and `registry/bases/{base}/blocks` hold the installable source. The two bases differ, so each has its own copy.
- **Parity suite.** `fixtures/{base}/{name}.json` holds the engine document that each pdfcn demo produced. `tests/parity.test.ts` renders every demo in `examples/{base}` and compares it with its fixture. A fixture defines the correct output, so never edit one to make a test pass.
- **Registry.** `registry.json` lists every item, its files with install targets, and its dependencies. `pnpm registry:build` publishes `public/r`, rewrites `@/registry/...` imports to the installed paths, and checks that each item installs on its own.

## Checks

```bash
pnpm verify
```

`pnpm verify` runs every check and prints one summary, even after a failure:

| Step           | Command               | What it checks                                                                                                               |
| -------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| check          | `pnpm check`          | Lint and format (ultracite)                                                                                                  |
| typecheck      | `pnpm typecheck`      | Angular compiler in strict mode                                                                                              |
| parity         | `pnpm test`           | Every demo matches its fixture                                                                                               |
| registry build | `pnpm registry:build` | Registry output and install closures                                                                                         |
| site build     | `vite build`          | The documentation site                                                                                                       |
| install check  | `pnpm install:check`  | Installs Forme and Takumi blocks into a fresh `ng new` app per base, renders each to a PDF in `ng test`, and runs `ng build` |

To run one demo, use `cd apps/web && npx vitest run -t "forme/text"`. A failure prints the first JSON path that differs from the fixture.

`pnpm fix` formats and fixes lint issues. A [lefthook](https://github.com/evilmartians/lefthook) pre-commit hook runs it on staged files.

## Adding a component

Add the component to each base separately. For a component named `badge` in the Forme base:

1. Write `registry/bases/forme/components/badge/badge.ts`. Keep the style logic in a plain function, `badgeStyles(theme, props)`, and add a thin `@Component` with selector `pdf-badge`, signal inputs for the props, `injectPdfcnTheme()`, and one `computed()` that calls the function. Build the template from the base's primitives. `components/text/text.ts` and `components/table/table.ts` show the pattern.
2. Add a demo at `examples/forme/badge.ts` whose default export renders the component in a document. The demo index picks it up automatically.
3. Add the fixture `fixtures/forme/badge.json`. For a pdfcn component, it is the document the pdfcn demo produces.
4. Add an item to `registry.json` with its files, install targets, npm `dependencies`, and `registryDependencies` for every other item it imports.
5. Add the docs page in `content/docs/components/forme/badge.mdx`.
6. Run `pnpm verify`. Commit the regenerated `public/r` with your change, because the registry is served from it.

## Pull requests

- Branch from `develop` and open the pull request against `develop`. `main` only receives merges from `develop`.
- For a non-trivial change, open an issue first so we can agree on the direction.
- Keep each pull request to one purpose.
- Make sure `pnpm verify` passes and describe what you changed and how you checked it.

Report bugs and request features with the [issue templates](https://github.com/aFlamee/angular-pdfcn/issues/new/choose). Report security issues as described in [SECURITY.md](./SECURITY.md), not in a public issue.

## Code of conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## License

angular-pdfcn is licensed under the [MIT License](./LICENSE). By contributing, you agree that your contributions are licensed under the same license.
