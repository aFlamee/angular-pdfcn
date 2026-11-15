import type { PdfcnTheme, ThemePresetName } from "@/registry/themes";
import { themePresets } from "@/registry/themes";

export interface StoredThemeState {
  basePreset: ThemePresetName;
  theme: PdfcnTheme;
}

const HEX_COLOR = /^#[\da-f]{6}$/i;
const PAGE_SIZES: ReadonlySet<string> = new Set(["A4", "LETTER", "LEGAL"]);
const ORIENTATIONS: ReadonlySet<string> = new Set(["portrait", "landscape"]);

/** True when `value` has every key of `template`, each holding the same kind of value. Numbers must be finite. */
const matchesShape = (template: unknown, value: unknown): boolean => {
  if (typeof template === "object" && template !== null) {
    return (
      typeof value === "object" &&
      value !== null &&
      Object.entries(template).every(([key, child]) =>
        matchesShape(child, (value as Record<string, unknown>)[key])
      )
    );
  }
  return typeof template === "number"
    ? Number.isFinite(value)
    : typeof value === typeof template;
};

/** Stored state from the URL or storage, or null when it isn't a complete theme. */
const parseThemeState = (value: unknown): StoredThemeState | null => {
  const { basePreset, theme } = (value ?? {}) as Record<string, unknown>;
  if (
    typeof basePreset !== "string" ||
    !Object.hasOwn(themePresets, basePreset) ||
    !matchesShape(themePresets.professional, theme)
  ) {
    return null;
  }
  const { colors, page } = theme as PdfcnTheme;
  const valid =
    Object.values(colors).every((color) => HEX_COLOR.test(color)) &&
    PAGE_SIZES.has(page.size) &&
    ORIENTATIONS.has(page.orientation);
  return valid
    ? { basePreset: basePreset as ThemePresetName, theme: theme as PdfcnTheme }
    : null;
};

const readFromLocalStorage = (storageKey: string): StoredThemeState | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    return parseThemeState(JSON.parse(raw));
  } catch {
    return null;
  }
};

const writeToLocalStorage = (storageKey: string, state: StoredThemeState) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Storage unavailable. The URL is still the source of truth.
  }
};

const serializeTheme = (state: StoredThemeState): string =>
  btoa(encodeURIComponent(JSON.stringify(state)));

const deserializeTheme = (encoded: string): StoredThemeState | null => {
  try {
    const json = decodeURIComponent(atob(encoded));
    return parseThemeState(JSON.parse(json));
  } catch {
    return null;
  }
};

export const readThemeState = (storageKey: string): StoredThemeState | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const encoded = params.get("theme");
  if (encoded) {
    const fromUrl = deserializeTheme(encoded);
    if (fromUrl) {
      writeToLocalStorage(storageKey, fromUrl);
      return fromUrl;
    }
  }
  return readFromLocalStorage(storageKey);
};

export const writeThemeState = (
  storageKey: string,
  state: StoredThemeState
) => {
  if (typeof window === "undefined") {
    return;
  }
  writeToLocalStorage(storageKey, state);
  const encoded = serializeTheme(state);
  const url = new URL(window.location.href);
  url.hash = `theme=${encoded}`;
  // Keeps the router's entry in `history.state`.
  window.history.replaceState(window.history.state, "", url.toString());
};
