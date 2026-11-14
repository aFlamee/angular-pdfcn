import {
  Component,
  InjectionToken,
  inject,
  input,
  signal,
} from "@angular/core";
import type { Signal } from "@angular/core";
import type { Style } from "@formepdf/shared";

import { professionalTheme } from "@/registry/themes/professional";
import type { PdfcnTheme } from "@/registry/types/pdf-themes";

export type { PdfcnTheme };

export const PDFCN_THEME = new InjectionToken<Signal<PdfcnTheme>>(
  "PDFCN_THEME"
);

const defaultTheme = signal(professionalTheme).asReadonly();

/** The theme of the nearest `<pdf-theme-provider>`, or the professional theme. */
export const injectPdfcnTheme = (): Signal<PdfcnTheme> =>
  inject(PDFCN_THEME, { optional: true }) ?? defaultTheme;

/** Provides a theme to the components it wraps. */
@Component({
  providers: [
    {
      provide: PDFCN_THEME,
      useFactory: () => inject(PdfcnThemeProvider).theme,
    },
  ],
  selector: "pdf-theme-provider",
  template: "<ng-content />",
})
export class PdfcnThemeProvider {
  readonly theme = input(professionalTheme, {
    transform: (theme: PdfcnTheme | undefined) => theme ?? professionalTheme,
  });
}

type PdfStyleInput = Style | PdfStyleInput[] | false | null | undefined;

const mergeStyleInput = (target: Style, value: PdfStyleInput): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      mergeStyleInput(target, item);
    }
  } else if (value) {
    Object.assign(target, value);
  }
};

export const mergePdfStyles = (...inputs: PdfStyleInput[]): Style => {
  const merged: Style = {};
  for (const value of inputs) {
    mergeStyleInput(merged, value);
  }
  return merged;
};
