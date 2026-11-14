// Installs each base's items into a fresh `ng new` app, renders its invoice block to PDF, and builds the app.
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  createReadStream,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

import { addCommand, componentsJson, TSCONFIG_PATHS } from "../lib/install";

// Both bases install to the same paths, so each gets its own app.
const BASES = {
  forme: {
    imports: `import { renderPdf } from "@formepdf/core";

import { renderFormeDocument } from "@/lib/render";`,
    items: [
      "forme/text",
      "forme/table",
      "forme/key-value",
      "forme/invoice-classic",
    ],
    render:
      "await renderPdf(JSON.stringify(renderFormeDocument(InvoiceClassicDocument)))",
  },
  takumi: {
    // `ng test` resolves takumi-pdf to its Vite entry, which can't load the wasm in Node.
    imports: `import { readFileSync } from "node:fs";

import { initSync, render } from "takumi-pdf/no-init";

import { renderTakumiDocument } from "@/lib/render";

initSync({ module: readFileSync("node_modules/takumi-pdf/pkg/takumi_pdf_wasm_bg.wasm") });`,
    items: ["takumi/invoice-classic"],
    render: "await render(renderTakumiDocument(InvoiceClassicDocument).node)",
  },
};

const root = path.resolve(import.meta.dirname, "..");
const bin = (name: string) => path.join(root, "node_modules/.bin", name);

const registry = path.join(root, "public");
const server = createServer((request, response) => {
  const file = path.join(
    registry,
    decodeURIComponent(new URL(request.url ?? "/", "http://x").pathname)
  );
  if (!file.startsWith(registry) || !existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  createReadStream(file).pipe(response);
});
await once(server.listen(0, "127.0.0.1"), "listening");
const registryUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

/** Runs a command without blocking the registry server on this event loop. */
const run = async (cwd: string, command: string, args: string[]) => {
  console.log(`$ ${path.basename(command)} ${args.join(" ")}`);
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, CI: "1", NG_CLI_ANALYTICS: "false" },
    stdio: ["ignore", "inherit", "inherit"],
  });
  const [code] = await once(child, "exit");
  if (code !== 0) {
    throw new Error(`${path.basename(command)} exited with ${code}`);
  }
};

const patch = (file: string, search: string, replacement: string) =>
  writeFileSync(file, readFileSync(file, "utf-8").replace(search, replacement));

const workspace = await mkdtemp(path.join(tmpdir(), "angular-pdfcn-install-"));
try {
  // One `ng new` plus the documented one-time setup, copied for each base.
  await run(workspace, bin("ng"), [
    "new",
    "app",
    "--defaults",
    "--skip-git",
    "--package-manager=pnpm",
    "--ssr=false",
    "--style=css",
    "--ai-config=none",
  ]);
  const template = path.join(workspace, "app");
  writeFileSync(
    path.join(template, "components.json"),
    JSON.stringify(componentsJson(registryUrl), null, 2)
  );
  patch(
    path.join(template, "tsconfig.json"),
    '"compilerOptions": {',
    `"compilerOptions": {\n    "paths": ${JSON.stringify(TSCONFIG_PATHS)},`
  );
  // The specs write the PDF with node:fs.
  await run(template, "pnpm", ["add", "-D", "@types/node"]);
  patch(
    path.join(template, "tsconfig.spec.json"),
    '"vitest/globals"',
    '"vitest/globals", "node"'
  );

  const results: string[] = [];
  for (const [base, { imports, items, render }] of Object.entries(BASES)) {
    const app = path.join(workspace, base);
    await cp(template, app, {
      filter: (source) => path.basename(source) !== "node_modules",
      recursive: true,
    });
    await run(app, "pnpm", ["install", "--prefer-offline"]);

    // The documented command, run with the pinned CLI instead of @latest.
    const names = addCommand(...items)
      .split(" ")
      .slice(3);
    await run(app, bin("shadcn"), ["add", ...names, "--yes"]);

    writeFileSync(
      path.join(app, "src/app/invoice.pdf.spec.ts"),
      `import { writeFileSync } from "node:fs";

${imports}
import { InvoiceClassicDocument } from "@/components/pdf/blocks/invoice-classic/invoice-classic";

it("renders the invoice block to a PDF", async () => {
  const pdf = ${render};
  writeFileSync("invoice.pdf", pdf);
  expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
});
`
    );
    await run(app, bin("ng"), ["test", "--watch=false"]);
    const pdf = readFileSync(path.join(app, "invoice.pdf"));
    if (!/\/Type\s*\/Page\b/.test(pdf.toString("latin1"))) {
      throw new Error(`The rendered ${base} invoice has no pages.`);
    }
    await run(app, bin("ng"), ["build"]);
    results.push(
      `${base}: ${items.length} items installed, invoice rendered (${pdf.length} bytes), app built`
    );
  }

  await rm(workspace, { force: true, recursive: true });
  console.log(`Install check passed.\n  ${results.join("\n  ")}`);
} catch (error) {
  console.error(`Install check failed. The apps are in ${workspace}`);
  throw error;
} finally {
  server.close();
}
