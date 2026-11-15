// Runs every check, even after a failure, and prints one summary.
import { spawnSync } from "node:child_process";

const STEPS = [
  ["check", "pnpm check"],
  ["typecheck", "pnpm typecheck"],
  ["parity", "pnpm test"],
  ["registry build", "pnpm --filter web registry:build"],
  ["site build", "pnpm --filter web exec vite build"],
  ["install check", "pnpm install:check"],
];

const results = STEPS.map(([name, command]) => {
  console.log(`\n▶ ${name}: ${command}`);
  const { status } = spawnSync(command, { shell: true, stdio: "inherit" });
  return { name, ok: status === 0 };
});

console.log("\nverify summary");
for (const { name, ok } of results) {
  console.log(`  ${ok ? "pass" : "FAIL"}  ${name}`);
}
process.exitCode = results.every(({ ok }) => ok) ? 0 : 1;
