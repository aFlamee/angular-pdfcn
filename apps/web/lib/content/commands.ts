import type { PackageManager } from "./types";

// The reference's rehype transformer: a command block shows the same command for each package manager.
const RULES: [
  prefix: string,
  replacements: Record<Exclude<PackageManager, "npm">, string>,
][] = [
  ["npm install", { bun: "bun add", pnpm: "pnpm add", yarn: "yarn add" }],
  [
    "npx create-",
    { bun: "bunx --bun create-", pnpm: "pnpm create ", yarn: "yarn create " },
  ],
  [
    "npm create",
    { bun: "bun create", pnpm: "pnpm create", yarn: "yarn create" },
  ],
  ["npx", { bun: "bunx --bun", pnpm: "pnpm dlx", yarn: "yarn dlx" }],
  ["npm run", { bun: "bun", pnpm: "pnpm", yarn: "yarn" }],
];

export const packageManagerCommands = (
  raw: string
): Record<PackageManager, string> | undefined => {
  const rule = RULES.find(([prefix]) => raw.startsWith(prefix));
  if (!rule) {
    return undefined;
  }
  const [prefix, replacements] = rule;
  return {
    bun: raw.replace(prefix, replacements.bun),
    npm: raw,
    pnpm: raw.replace(prefix, replacements.pnpm),
    yarn: raw.replace(prefix, replacements.yarn),
  };
};
