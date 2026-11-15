import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { ROUTES } from "@/constants/routes";
import type { BaseName } from "@/lib/content/types";
import { THEMES, getTheme } from "@/registry/themes";
import type { RegistryThemeName } from "@/registry/themes";
import { PdfPreview } from "@/src/app/components/pdf-preview";
import {
  UiSelect,
  UiSelectContent,
  UiSelectItem,
  UiSelectTrigger,
  UiSelectValue,
} from "@/src/app/components/ui/select";

const THEMES_OPTIONS = [
  { label: "Professional", value: "professional" },
  { label: "Modern", value: "modern" },
  { label: "Minimal", value: "minimal" },
  { label: "Executive", value: "executive" },
  { label: "Corporate", value: "corporate" },
  { label: "Elegant", value: "elegant" },
  { label: "Vivid", value: "vivid" },
  { label: "Forest", value: "forest" },
  { label: "Blueprint", value: "blueprint" },
] as const;

const SWATCH_COLORS = ["foreground", "primary", "accent", "muted"] as const;

/** Invoice Classic in a theme picked from a select, for `::theme-preview`. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "not-prose mt-4 block" },
  imports: [
    PdfPreview,
    UiSelect,
    UiSelectContent,
    UiSelectItem,
    UiSelectTrigger,
    UiSelectValue,
  ],
  selector: "app-theme-preview",
  template: `
    <div
      class="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 px-4 py-2"
    >
      <div class="flex gap-1.5" aria-hidden="true">
        <span class="size-2.5 rounded-full bg-red-400"></span>
        <span class="size-2.5 rounded-full bg-amber-400"></span>
        <span class="size-2.5 rounded-full bg-emerald-400"></span>
      </div>
      <span class="text-sm text-muted-foreground">document.pdf</span>
      <ng-container uiSelect [(value)]="selectedTheme">
        <button uiSelectTrigger class="w-35 bg-background">
          <ui-select-value placeholder="Theme" />
        </button>
        <ui-select-content>
          @for (option of options; track option.value) {
            <ui-select-item [value]="option.value">{{
              option.label
            }}</ui-select-item>
          }
        </ui-select-content>
      </ng-container>
    </div>
    <app-pdf-preview
      class="rounded-none rounded-b-lg border"
      [base]="base()"
      name="invoice-classic"
      [height]="640"
      [theme]="theme()"
    />
  `,
})
export class ThemePreview {
  readonly base = input.required<BaseName>();

  protected readonly options = THEMES_OPTIONS;
  protected readonly selectedTheme = signal<string | undefined>("professional");
  protected readonly theme = computed(
    () => getTheme(this.selectedTheme() as RegistryThemeName)?.theme
  );
}

/** A swatch link to each theme's docs page, for `::theme-preview-grid`. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20",
  },
  imports: [RouterLink],
  selector: "app-theme-preview-grid",
  template: `
    @for (theme of themes; track theme.slug) {
      <a
        class="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
        [routerLink]="theme.href"
      >
        <div class="flex shrink-0 gap-0.5">
          @for (color of swatchColors; track color) {
            <div
              class="flex h-4 w-2.5 shrink-0 rounded-xs inset-ring-1 inset-ring-foreground/15"
              [style.background-color]="theme.colors[color]"
            ></div>
          }
        </div>
        <span class="truncate">{{ theme.name }}</span>
      </a>
    }
  `,
})
export class ThemePreviewGrid {
  protected readonly swatchColors = SWATCH_COLORS;
  protected readonly themes = THEMES.map(({ name, theme, title }) => ({
    colors: theme.colors,
    href: `${ROUTES.DOCS_THEMES}/${name}`,
    name: title,
    slug: name,
  }));
}
