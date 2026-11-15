import type { BaseName } from "@/lib/content/types";
import { addCommand } from "@/lib/install";
import type { PdfcnTheme, ThemePresetName } from "@/registry/themes";
import { themePresets } from "@/registry/themes";

type Json = boolean | Json[] | null | number | string | { [key: string]: Json };

const deepDiff = (base: Json, next: Json): Json | undefined => {
  if (Array.isArray(base) || Array.isArray(next)) {
    return JSON.stringify(base) === JSON.stringify(next) ? undefined : next;
  }

  if (
    base !== null &&
    next !== null &&
    typeof base === "object" &&
    typeof next === "object"
  ) {
    const result: Record<string, Json> = {};

    for (const key of Object.keys(next)) {
      const delta = deepDiff(base[key], next[key]);
      if (delta !== undefined) {
        result[key] = delta;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  return base === next ? undefined : next;
};

const isRecord = (value: Json): value is Record<string, Json> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const indent = (depth: number) => "  ".repeat(depth);

/** The overrides as an object literal that spreads `source` at every level it changes. */
const spreadLiteral = (
  source: string,
  overrides: Record<string, Json>,
  depth: number
): string => {
  const lines = Object.entries(overrides).map(([key, value]) => {
    const name = /^[a-z_$][\w$]*$/i.test(key) ? key : JSON.stringify(key);
    const path = `${source}${name === key ? `.${key}` : `[${name}]`}`;
    const literal = isRecord(value)
      ? spreadLiteral(path, value, depth + 1)
      : JSON.stringify(value, null, 2).replaceAll("\n", `\n${indent(depth)}`);
    return `${indent(depth)}${name}: ${literal},`;
  });
  return `{\n${[`${indent(depth)}...${source},`, ...lines].join("\n")}\n${indent(depth - 1)}}`;
};

/** The registry file a preset installs to, like `lib/pdf-themes/modern.ts`. */
const presetImport = (preset: ThemePresetName) =>
  `import { ${preset}Theme } from "@/lib/pdf-themes/${preset}";`;

export const generateThemeCode = (theme: PdfcnTheme) =>
  `import type { PdfcnTheme } from "@/types/pdf-themes";\n\nexport const customTheme: PdfcnTheme = ${JSON.stringify(theme, null, 2)};\n`;

export const generateDeltaCode = (
  theme: PdfcnTheme,
  basePreset: ThemePresetName
) => {
  const overrides = deepDiff(
    themePresets[basePreset] as unknown as Json,
    theme as unknown as Json
  );

  const literal = spreadLiteral(
    `${basePreset}Theme`,
    overrides && isRecord(overrides) ? overrides : {},
    1
  );

  return `${presetImport(basePreset)}\nimport type { PdfcnTheme } from "@/types/pdf-themes";\n\n// The '${basePreset}' preset with your changes.\nexport const customTheme: PdfcnTheme = ${literal};\n`;
};

/** Installs the base's theme provider, plus the preset a delta file imports. */
export const generateInstallCommand = (
  base: BaseName,
  basePreset?: ThemePresetName
) =>
  addCommand(
    `${base}/theme-provider`,
    ...(basePreset ? [`theme-${basePreset}`] : [])
  );

/** A component that renders its PDF content in the exported theme. */
export const generateUsageCode = (
  fileName: string
) => `import { Component } from "@angular/core";

import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { customTheme } from "@/lib/${fileName}";

@Component({
  selector: "app-invoice",
  imports: [PdfcnThemeProvider],
  template: \`
    <pdf-theme-provider [theme]="theme">
      <!-- Your PDF content -->
    </pdf-theme-provider>
  \`,
})
export class Invoice {
  protected readonly theme = customTheme;
}
`;
