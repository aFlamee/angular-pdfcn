import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { DEFAULT_BASE } from "@/lib/bases";
import type { BaseName } from "@/lib/content/types";
import { THEME_NAMES, getTheme, THEMES } from "@/registry/themes";
import type { ThemePresetName } from "@/registry/themes";

import { BASE_SCHEMA } from "./pdf-tool";
import type { WebMcpTool } from "./web-mcp";

const themeSummary = (entry: (typeof THEMES)[number]) => ({
  colors: {
    accent: entry.theme.colors.accent,
    background: entry.theme.colors.background,
    foreground: entry.theme.colors.foreground,
    primary: entry.theme.colors.primary,
  },
  name: entry.name,
  page: entry.theme.page,
  title: entry.title,
  typography: {
    bodyFont: entry.theme.typography.body.fontFamily,
    headingFont: entry.theme.typography.heading.fontFamily,
  },
});

const getThemeEntry = (name: ThemePresetName) => {
  const entry = getTheme(name);
  if (!entry) {
    throw new Error(`Unknown theme: ${name}`);
  }
  return entry;
};

export const listThemesTool: WebMcpTool = {
  description:
    "List all available PDF themes with their color palettes, typography, and page settings. Use this to discover themes before applying one.",
  execute: () => THEMES.map(themeSummary),
  inputSchema: {
    properties: {
      category: {
        description: "Filter category (currently only 'all' is supported)",
        enum: ["all"],
        type: "string",
      },
    },
    type: "object",
  },
  name: `${SITE.NAME}_list_themes`,
};

export const getThemeTool: WebMcpTool<{ name: ThemePresetName }> = {
  description:
    "Get the full token details for a specific PDF theme, including all colors, typography, spacing, and page settings.",
  execute: ({ name }) => getThemeEntry(name).theme,
  inputSchema: {
    properties: {
      name: {
        description: "The theme preset name to retrieve",
        enum: [...THEME_NAMES],
        type: "string",
      },
    },
    required: ["name"],
    type: "object",
  },
  name: `${SITE.NAME}_get_theme`,
};

export const applyThemeTool: WebMcpTool<{
  name: ThemePresetName;
  base?: BaseName;
}> = {
  description:
    "Navigate to the Theme Builder with a specific theme pre-loaded. The user can then customize it visually. Returns the URL the browser will navigate to.",
  execute: ({ name, base = DEFAULT_BASE }) => {
    const entry = getThemeEntry(name);
    // Same encoding as `serializeTheme` in `lib/theme-builder/persist-theme.ts`.
    const state = btoa(
      encodeURIComponent(
        JSON.stringify({ basePreset: name, theme: entry.theme })
      )
    );
    const hash = new URLSearchParams({ theme: state }).toString();
    const builderBase =
      base === "forme"
        ? ROUTES.THEME_BUILDER_FORME
        : ROUTES.THEME_BUILDER_TAKUMI;
    const url = `${builderBase}#${hash}`;

    window.location.assign(url);
    return { base, ok: true, theme: name, url };
  },
  inputSchema: {
    properties: {
      base: BASE_SCHEMA,
      name: {
        description: "The theme preset to apply",
        enum: [...THEME_NAMES],
        type: "string",
      },
    },
    required: ["name"],
    type: "object",
  },
  name: `${SITE.NAME}_apply_theme`,
};
