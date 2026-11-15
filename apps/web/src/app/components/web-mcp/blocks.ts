import type { BaseName } from "@/lib/content/types";
import { addCommand } from "@/lib/install";

import { pages } from "../../lib/docs-source";

export interface BlockInfo {
  name: string;
  type: "invoice" | "report" | "other";
  title: string;
  description?: string;
  bases: BaseName[];
  installCommand: string;
  docsUrl: string;
}

const blockType = (name: string): BlockInfo["type"] => {
  const [prefix] = name.split("-");
  return prefix === "invoice" || prefix === "report" ? prefix : "other";
};

const byName = new Map<string, BlockInfo>();
// Block pages live at `/docs/blocks/<base>/<name>`.
for (const { slugs, title, description, url } of pages) {
  const [section, base, name] = slugs as [string, BaseName, string?];
  if (section !== "blocks" || !name) {
    continue;
  }
  const block = byName.get(name);
  if (block) {
    block.bases.push(base);
    continue;
  }
  byName.set(name, {
    bases: [base],
    description,
    docsUrl: url,
    installCommand: addCommand(`${base}/${name}`),
    name,
    title,
    type: blockType(name),
  });
}

/** Every block with a docs page, in sidebar order. */
export const BLOCKS = [...byName.values()];

export const BLOCK_NAMES = BLOCKS.map((block) => block.name);

export const getBlock = (name: string) => {
  const block = byName.get(name);
  if (!block) {
    throw new Error(
      `Unknown block: ${name}. Available: ${BLOCK_NAMES.join(", ")}`
    );
  }
  return block;
};
