import { Injectable, afterNextRender, computed, signal } from "@angular/core";

import {
  THEME_BUILDER_HISTORY_LIMIT,
  THEME_BUILDER_STORAGE_KEY,
} from "@/constants/theme-builder";
import {
  readThemeState,
  writeThemeState,
} from "@/lib/theme-builder/persist-theme";
import type { StoredThemeState } from "@/lib/theme-builder/persist-theme";
import type { PdfcnTheme, ThemePresetName } from "@/registry/themes";
import { themePresets } from "@/registry/themes";

export type ColorTokenName = keyof PdfcnTheme["colors"];
export type HeadingLevel =
  keyof PdfcnTheme["typography"]["heading"]["fontSize"];
export type PageMargin = keyof PdfcnTheme["spacing"]["page"];
export type SpacingTokenName = Exclude<keyof PdfcnTheme["spacing"], "page">;

type ThemeUpdate = (theme: PdfcnTheme) => PdfcnTheme;
type ThemeSnapshot = StoredThemeState;

interface ThemeBuilderState {
  basePreset: ThemePresetName;
  future: ThemeSnapshot[];
  past: ThemeSnapshot[];
  theme: PdfcnTheme;
}

type ThemeBuilderAction =
  | { type: "UPDATE"; update: ThemeUpdate }
  | { type: "LOAD_PRESET"; preset: ThemePresetName }
  | { type: "RESTORE"; stored: StoredThemeState }
  | { type: "UNDO" }
  | { type: "REDO" };

const cloneTheme = (theme: PdfcnTheme): PdfcnTheme => ({
  ...theme,
  colors: { ...theme.colors },
  page: { ...theme.page },
  primitives: {
    ...theme.primitives,
    borderRadius: { ...theme.primitives.borderRadius },
    fontWeights: { ...theme.primitives.fontWeights },
    letterSpacing: { ...theme.primitives.letterSpacing },
    lineHeights: { ...theme.primitives.lineHeights },
    spacing: { ...theme.primitives.spacing },
    typography: { ...theme.primitives.typography },
  },
  spacing: {
    ...theme.spacing,
    page: { ...theme.spacing.page },
  },
  typography: {
    body: { ...theme.typography.body },
    heading: {
      ...theme.typography.heading,
      fontSize: { ...theme.typography.heading.fontSize },
    },
  },
});

const pushHistory = (
  history: ThemeSnapshot[],
  snapshot: ThemeSnapshot
): ThemeSnapshot[] => [
  ...history.slice(-(THEME_BUILDER_HISTORY_LIMIT - 1)),
  snapshot,
];

const snapshotState = (state: ThemeBuilderState): ThemeSnapshot => ({
  basePreset: state.basePreset,
  theme: state.theme,
});

const getInitialState = (): ThemeBuilderState => ({
  basePreset: "professional",
  future: [],
  past: [],
  theme: cloneTheme(themePresets.professional),
});

const reducer = (
  state: ThemeBuilderState,
  action: ThemeBuilderAction
): ThemeBuilderState => {
  if (action.type === "RESTORE") {
    return {
      basePreset: action.stored.basePreset,
      future: [],
      past: [],
      theme: cloneTheme(action.stored.theme),
    };
  }

  if (action.type === "UPDATE") {
    const nextTheme = action.update(state.theme);
    if (nextTheme === state.theme) {
      return state;
    }

    return {
      ...state,
      future: [],
      past: pushHistory(state.past, snapshotState(state)),
      theme: nextTheme,
    };
  }

  if (action.type === "LOAD_PRESET") {
    return {
      ...state,
      basePreset: action.preset,
      future: [],
      past: pushHistory(state.past, snapshotState(state)),
      theme: cloneTheme(themePresets[action.preset]),
    };
  }

  if (action.type === "UNDO") {
    const previous = state.past.at(-1);
    if (!previous) {
      return state;
    }

    return {
      ...state,
      basePreset: previous.basePreset,
      future: [
        snapshotState(state),
        ...state.future.slice(0, THEME_BUILDER_HISTORY_LIMIT - 1),
      ],
      past: state.past.slice(0, -1),
      theme: previous.theme,
    };
  }

  if (action.type === "REDO") {
    const [next, ...remaining] = state.future;
    if (!next) {
      return state;
    }

    return {
      ...state,
      basePreset: next.basePreset,
      future: remaining,
      past: pushHistory(state.past, snapshotState(state)),
      theme: next.theme,
    };
  }

  return state;
};

/**
 * The theme builder's theme, preset, and undo history. Provide it on the builder component.
 * It starts at the default and loads the shared or stored theme after the first render, so hydration sees the server markup.
 */
@Injectable()
export class ThemeBuilderStore {
  private readonly state = signal(getInitialState());

  readonly theme = computed(() => this.state().theme);
  readonly basePreset = computed(() => this.state().basePreset);
  readonly canUndo = computed(() => this.state().past.length > 0);
  readonly canRedo = computed(() => this.state().future.length > 0);
  /** True once the stored theme is read, in the browser only. */
  readonly loaded = signal(false);

  constructor() {
    afterNextRender(() => {
      const stored = readThemeState(THEME_BUILDER_STORAGE_KEY);
      if (stored) {
        this.dispatch({ stored, type: "RESTORE" });
      }
      this.loaded.set(true);
    });
  }

  syncToUrl(snapshot: StoredThemeState) {
    writeThemeState(THEME_BUILDER_STORAGE_KEY, snapshot);
  }

  loadPreset(preset: ThemePresetName) {
    this.dispatch({ preset, type: "LOAD_PRESET" });
  }

  undo() {
    this.dispatch({ type: "UNDO" });
  }

  redo() {
    this.dispatch({ type: "REDO" });
  }

  setBodyFontFamily(value: string) {
    this.update((theme) =>
      theme.typography.body.fontFamily === value
        ? theme
        : {
            ...theme,
            typography: {
              ...theme.typography,
              body: { ...theme.typography.body, fontFamily: value },
            },
          }
    );
  }

  setBodyFontSize(value: number) {
    this.update((theme) =>
      theme.typography.body.fontSize === value
        ? theme
        : {
            ...theme,
            typography: {
              ...theme.typography,
              body: { ...theme.typography.body, fontSize: value },
            },
          }
    );
  }

  setBodyLineHeight(value: number) {
    this.update((theme) =>
      theme.typography.body.lineHeight === value
        ? theme
        : {
            ...theme,
            typography: {
              ...theme.typography,
              body: { ...theme.typography.body, lineHeight: value },
            },
          }
    );
  }

  setColor(key: ColorTokenName, value: string) {
    this.update((theme) =>
      theme.colors[key] === value
        ? theme
        : { ...theme, colors: { ...theme.colors, [key]: value } }
    );
  }

  setHeadingFontFamily(value: string) {
    this.update((theme) =>
      theme.typography.heading.fontFamily === value
        ? theme
        : {
            ...theme,
            typography: {
              ...theme.typography,
              heading: { ...theme.typography.heading, fontFamily: value },
            },
          }
    );
  }

  setHeadingFontSize(level: HeadingLevel, value: number) {
    this.update((theme) =>
      theme.typography.heading.fontSize[level] === value
        ? theme
        : {
            ...theme,
            typography: {
              ...theme.typography,
              heading: {
                ...theme.typography.heading,
                fontSize: {
                  ...theme.typography.heading.fontSize,
                  [level]: value,
                },
              },
            },
          }
    );
  }

  setHeadingFontWeight(value: number) {
    this.update((theme) =>
      theme.typography.heading.fontWeight === value
        ? theme
        : {
            ...theme,
            typography: {
              ...theme.typography,
              heading: { ...theme.typography.heading, fontWeight: value },
            },
          }
    );
  }

  setHeadingLineHeight(value: number) {
    this.update((theme) =>
      theme.typography.heading.lineHeight === value
        ? theme
        : {
            ...theme,
            typography: {
              ...theme.typography,
              heading: { ...theme.typography.heading, lineHeight: value },
            },
          }
    );
  }

  setName(value: string) {
    this.update((theme) =>
      theme.name === value ? theme : { ...theme, name: value }
    );
  }

  setPageMargin(edge: PageMargin, value: number) {
    this.update((theme) =>
      theme.spacing.page[edge] === value
        ? theme
        : {
            ...theme,
            spacing: {
              ...theme.spacing,
              page: { ...theme.spacing.page, [edge]: value },
            },
          }
    );
  }

  setPageOrientation(value: PdfcnTheme["page"]["orientation"]) {
    this.update((theme) =>
      theme.page.orientation === value
        ? theme
        : { ...theme, page: { ...theme.page, orientation: value } }
    );
  }

  setPageSize(value: PdfcnTheme["page"]["size"]) {
    this.update((theme) =>
      theme.page.size === value
        ? theme
        : { ...theme, page: { ...theme.page, size: value } }
    );
  }

  setSpacing(key: SpacingTokenName, value: number) {
    this.update((theme) =>
      theme.spacing[key] === value
        ? theme
        : { ...theme, spacing: { ...theme.spacing, [key]: value } }
    );
  }

  private update(update: ThemeUpdate) {
    this.dispatch({ type: "UPDATE", update });
  }

  private dispatch(action: ThemeBuilderAction) {
    this.state.update((state) => reducer(state, action));
  }
}
