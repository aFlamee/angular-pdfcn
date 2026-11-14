import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Type } from "@angular/core";
import { afterAll, describe, expect, it } from "vitest";

import { demos } from "@/examples/__index__";
import type { BaseName } from "@/examples/__index__";
import { renderFormeDocument } from "@/registry/bases/forme/lib/render";
import { renderTakumiDocument } from "@/registry/bases/takumi/lib/render";

const FIXTURES = path.join(import.meta.dirname, "../fixtures");

/** Each engine's document, shaped like its fixture. */
const render: Record<BaseName, (demo: Type<unknown>) => unknown> = {
  forme: (demo) => ({ document: renderFormeDocument(demo) }),
  takumi: (demo) => renderTakumiDocument(demo),
};

/** The JSON path and both values at the first point where `a` and `b` differ. */
const firstDiff = (a: unknown, b: unknown, at = "$"): string | null => {
  if (Object.is(a, b)) {
    return null;
  }
  if (
    a &&
    b &&
    typeof a === "object" &&
    typeof b === "object" &&
    Array.isArray(a) === Array.isArray(b)
  ) {
    const keys = [
      ...new Set([...Object.keys(a), ...Object.keys(b)]),
    ].toSorted();
    for (const key of keys) {
      const diff = firstDiff(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        Array.isArray(a) ? `${at}[${key}]` : `${at}.${key}`
      );
      if (diff) {
        return diff;
      }
    }
    return null;
  }
  return `${at}: expected ${JSON.stringify(b)}, received ${JSON.stringify(a)}`;
};

const cases = (Object.keys(render) as BaseName[]).flatMap((base) =>
  readdirSync(path.join(FIXTURES, base))
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({ base, name: file.slice(0, -".json".length) }))
);

describe("document parity with the React reference", () => {
  const failures: string[] = [];

  afterAll(() => {
    console.log(
      `\n${cases.length - failures.length}/${cases.length} demos match`
    );
    if (failures.length > 0) {
      console.log(`First diff: ${failures[0]}`);
    }
  });

  it.each(cases)("$base/$name", ({ base, name }) => {
    const demo = demos[base][name];
    const fixture = JSON.parse(
      readFileSync(path.join(FIXTURES, base, `${name}.json`), "utf-8")
    );
    // The fixtures went through JSON, so the output does too.
    const diff = demo
      ? // oxlint-disable-next-line prefer-structured-clone -- structuredClone keeps undefined and NaN
        firstDiff(JSON.parse(JSON.stringify(render[base](demo))), fixture)
      : "demo is missing";
    if (diff) {
      failures.push(`${base}/${name}: ${diff}`);
    }
    expect(diff).toBeNull();
  });
});
