// Installs registry items into a fresh `ng new` app, renders a block to PDF, and builds the app.
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  createReadStream,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

import { addCommand, componentsJson, TSCONFIG_PATHS } from "../lib/install";

const ITEMS = [
  "forme/text",
  "forme/table",
  "forme/key-value",
  "forme/invoice-classic",
];
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

try {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "angular-pdfcn-install-")
  );
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
  const app = path.join(workspace, "app");

  writeFileSync(
    path.join(app, "components.json"),
    JSON.stringify(componentsJson(registryUrl), null, 2)
  );
  const tsconfigPath = path.join(app, "tsconfig.json");
  const tsconfig = readFileSync(tsconfigPath, "utf-8").replace(
    '"compilerOptions": {',
    `"compilerOptions": {\n    "paths": ${JSON.stringify(TSCONFIG_PATHS)},`
  );
  writeFileSync(tsconfigPath, tsconfig);

  // The documented command, run with the pinned CLI instead of @latest.
  const names = addCommand(...ITEMS)
    .split(" ")
    .slice(3);
  await run(app, bin("shadcn"), ["add", ...names, "--yes"]);

  writeFileSync(
    path.join(app, "src/app/invoice.pdf.spec.ts"),
    `import { writeFileSync } from "node:fs";

import { renderPdf } from "@formepdf/core";

import { InvoiceClassicDocument } from "@/components/pdf/blocks/invoice-classic/invoice-classic";
import { renderFormeDocument } from "@/lib/render";

it("renders the invoice block to a PDF", async () => {
  const pdf = await renderPdf(JSON.stringify(renderFormeDocument(InvoiceClassicDocument)));
  writeFileSync("invoice.pdf", pdf);
  expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
});
`
  );
  await run(app, "pnpm", ["add", "-D", "@types/node"]);
  const specConfig = path.join(app, "tsconfig.spec.json");
  writeFileSync(
    specConfig,
    readFileSync(specConfig, "utf-8").replace(
      '"vitest/globals"',
      '"vitest/globals", "node"'
    )
  );

  await run(app, bin("ng"), ["test", "--watch=false"]);
  const pdf = readFileSync(path.join(app, "invoice.pdf"));
  if (!/\/Type\s*\/Page\b/.test(pdf.toString("latin1"))) {
    throw new Error("The rendered invoice has no pages.");
  }
  await run(app, bin("ng"), ["build"]);
  console.log(
    `Install check passed: ${ITEMS.length} items installed, invoice rendered (${pdf.length} bytes), app built in ${app}`
  );
} finally {
  server.close();
}
