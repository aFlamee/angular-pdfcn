import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { LayoutTemplate, Palette, Shuffle, Type } from "lucide";

import { cn } from "@/lib/utils";
import { THEMES } from "@/registry/themes";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiInput } from "@/src/app/components/ui/input";
import {
  UiSelect,
  UiSelectContent,
  UiSelectItem,
  UiSelectTrigger,
  UiSelectValue,
} from "@/src/app/components/ui/select";
import { UiSeparator } from "@/src/app/components/ui/separator";
import {
  UiTabs,
  UiTabsContent,
  UiTabsList,
  UiTabsTrigger,
} from "@/src/app/components/ui/tabs";
import { UiTooltip } from "@/src/app/components/ui/tooltip";
import { ThemeBuilderStore } from "@/src/app/services/theme-builder";
import type {
  ColorTokenName,
  PageMargin,
  SpacingTokenName,
} from "@/src/app/services/theme-builder";

import { ThemePicker } from "./theme-picker";

const COLOR_FIELDS = [
  { description: "Primary text", key: "foreground", label: "Foreground" },
  { description: "Page background", key: "background", label: "Background" },
  { description: "Brand emphasis", key: "primary", label: "Primary" },
  {
    description: "Text on primary",
    key: "primaryForeground",
    label: "Primary foreground",
  },
  { description: "Secondary fill", key: "muted", label: "Muted" },
  {
    description: "Captions, footnotes",
    key: "mutedForeground",
    label: "Muted foreground",
  },
  { description: "Links, highlights", key: "accent", label: "Accent" },
  { description: "Dividers, table lines", key: "border", label: "Border" },
  { description: "Errors", key: "destructive", label: "Destructive" },
  { description: "Success states", key: "success", label: "Success" },
  { description: "Warning states", key: "warning", label: "Warning" },
  { description: "Info states", key: "info", label: "Info" },
] as const satisfies readonly {
  key: ColorTokenName;
  label: string;
  description: string;
}[];

const FONT_OPTIONS = [
  "Helvetica",
  "Times-Roman",
  "Courier",
  "Inter",
  "Lato",
  "Lora",
  "Merriweather",
  "Nunito",
  "Open Sans",
  "Playfair Display",
  "Source Code Pro",
  "JetBrains Mono",
] as const;

const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const MARGINS = [
  ["marginTop", "Top"],
  ["marginRight", "Right"],
  ["marginBottom", "Bottom"],
  ["marginLeft", "Left"],
] as const satisfies readonly [PageMargin, string][];

const RHYTHM = [
  ["sectionGap", "Sections"],
  ["paragraphGap", "Paragraphs"],
  ["componentGap", "Components"],
] as const satisfies readonly [SpacingTokenName, string][];

const blurOnEnter = (event: Event) =>
  (event.currentTarget as HTMLInputElement).blur();

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [UiInput],
  selector: "app-number-field",
  template: `
    <label class="grid gap-1.5 text-xs font-medium text-foreground">
      <span class="flex items-center justify-between gap-2">
        {{ label() }}
        @if (suffix()) {
          <span class="font-normal text-muted-foreground">{{ suffix() }}</span>
        }
      </span>
      <input
        uiInput
        class="h-8 tabular-nums"
        type="number"
        [max]="max()"
        [min]="min()"
        [step]="step()"
        [value]="value()"
        (blur)="onBlur($event)"
        (keydown.enter)="blurOnEnter($event)"
      />
    </label>
  `,
})
export class NumberField {
  readonly label = input.required<string>();
  readonly max = input.required<number>();
  readonly min = input.required<number>();
  readonly step = input(1);
  readonly suffix = input<string>();
  readonly value = input.required<number>();
  readonly commit = output<number>();

  protected readonly blurOnEnter = blurOnEnter;

  protected onBlur(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const parsed = Number(target.value);
    if (!Number.isFinite(parsed)) {
      target.value = String(this.value());
      return;
    }

    const nextValue = Math.min(this.max(), Math.max(this.min(), parsed));
    target.value = String(nextValue);
    this.commit.emit(nextValue);
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex items-center gap-3" },
  imports: [UiInput],
  selector: "app-color-field",
  template: `
    <div class="min-w-0 flex-1">
      <span class="block truncate text-xs font-medium">{{ label() }}</span>
      <span class="block truncate text-[10px] text-muted-foreground">
        {{ description() }}
      </span>
    </div>
    <input
      uiInput
      class="size-8 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0.5 shadow-none"
      type="color"
      [attr.aria-label]="'Choose ' + label().toLowerCase() + ' color'"
      [value]="value()"
      (input)="commit.emit($any($event.currentTarget).value)"
    />
    <input
      uiInput
      class="h-8 w-[5.5rem] shrink-0 px-2 font-mono text-[11px] uppercase"
      maxlength="7"
      spellcheck="false"
      [attr.aria-label]="label() + ' hex value'"
      [value]="value()"
      (blur)="onBlur($event)"
      (keydown.enter)="blurOnEnter($event)"
    />
  `,
})
export class ColorField {
  readonly description = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly commit = output<string>();

  protected readonly blurOnEnter = blurOnEnter;

  protected onBlur(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const nextValue = target.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(nextValue)) {
      this.commit.emit(nextValue.toLowerCase());
    } else {
      target.value = this.value();
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  selector: "app-theme-controls-section",
  template: `
    <div class="mb-3 space-y-0.5">
      <h3 class="text-sm font-semibold">{{ title() }}</h3>
      <p class="text-xs text-muted-foreground">{{ description() }}</p>
    </div>
    <ng-content />
  `,
})
export class ThemeControlsSection {
  readonly description = input.required<string>();
  readonly title = input.required<string>();
}

/** The builder's export name, preset, colors, typography, and layout fields. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()" },
  imports: [
    ColorField,
    NumberField,
    ThemeControlsSection,
    ThemePicker,
    UiButton,
    UiIcon,
    UiInput,
    UiSelect,
    UiSelectContent,
    UiSelectItem,
    UiSelectTrigger,
    UiSelectValue,
    UiSeparator,
    UiTabs,
    UiTabsContent,
    UiTabsList,
    UiTabsTrigger,
    UiTooltip,
  ],
  selector: "app-theme-controls",
  template: `
    <div class="space-y-3 border-b px-6 pb-4">
      <label
        class="grid gap-1.5 text-xs font-medium"
        [for]="idPrefix() + '-theme-name'"
      >
        Export name
        <input
          uiInput
          class="h-8"
          maxlength="48"
          [id]="idPrefix() + '-theme-name'"
          [value]="theme().name"
          (blur)="commitName($event)"
          (keydown.enter)="blurOnEnter($event)"
        />
      </label>

      <div class="flex items-center gap-1.5">
        <app-theme-picker
          [selectedTheme]="store.basePreset()"
          (themeSelect)="store.loadPreset($event)"
        />
        <button
          uiButton
          aria-label="Pick a random preset"
          size="icon-sm"
          variant="outline"
          uiTooltip="Random preset"
          (click)="loadRandomPreset()"
        >
          <svg [uiIcon]="Shuffle"></svg>
        </button>
      </div>
    </div>

    <ui-tabs value="colors" class="gap-4 px-6">
      <ui-tabs-list class="grid w-full grid-cols-3 gap-1">
        <button uiTabsTrigger value="colors">
          <svg [uiIcon]="Palette"></svg>
          Colors
        </button>
        <button uiTabsTrigger value="typography">
          <svg [uiIcon]="Type"></svg>
          Typography
        </button>
        <button uiTabsTrigger value="layout">
          <svg [uiIcon]="LayoutTemplate"></svg>
          Layout
        </button>
      </ui-tabs-list>

      <ui-tabs-content value="colors">
        @for (field of colorFields; track field.key; let first = $first) {
          @if (!first) {
            <ui-separator class="my-3" />
          }
          <app-color-field
            [description]="field.description"
            [label]="field.label"
            [value]="theme().colors[field.key]"
            (commit)="store.setColor(field.key, $event)"
          />
        }
      </ui-tabs-content>

      <ui-tabs-content value="typography">
        <app-theme-controls-section
          description="Base type used across paragraphs and tables."
          title="Body"
        >
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label
              class="grid gap-1.5 text-xs font-medium sm:col-span-2 lg:col-span-1 xl:col-span-2"
              [for]="idPrefix() + '-body-font'"
            >
              Font family
              <ng-container
                uiSelect
                [value]="theme().typography.body.fontFamily"
                (valueChange)="store.setBodyFontFamily($event!)"
              >
                <button
                  uiSelectTrigger
                  class="w-full"
                  size="sm"
                  [id]="idPrefix() + '-body-font'"
                >
                  <ui-select-value />
                </button>
                <ui-select-content>
                  @for (font of fonts; track font) {
                    <ui-select-item [value]="font">{{ font }}</ui-select-item>
                  }
                </ui-select-content>
              </ng-container>
            </label>
            <app-number-field
              label="Font size"
              suffix="pt"
              [max]="18"
              [min]="8"
              [value]="theme().typography.body.fontSize"
              (commit)="store.setBodyFontSize($event)"
            />
            <app-number-field
              label="Line height"
              [max]="2.2"
              [min]="1"
              [step]="0.05"
              [value]="theme().typography.body.lineHeight"
              (commit)="store.setBodyLineHeight($event)"
            />
          </div>
        </app-theme-controls-section>

        <ui-separator class="my-4" />

        <app-theme-controls-section
          description="Display type, weight, and scale."
          title="Headings"
        >
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label
              class="grid gap-1.5 text-xs font-medium sm:col-span-2 lg:col-span-1 xl:col-span-2"
              [for]="idPrefix() + '-heading-font'"
            >
              Font family
              <ng-container
                uiSelect
                [value]="theme().typography.heading.fontFamily"
                (valueChange)="store.setHeadingFontFamily($event!)"
              >
                <button
                  uiSelectTrigger
                  class="w-full"
                  size="sm"
                  [id]="idPrefix() + '-heading-font'"
                >
                  <ui-select-value />
                </button>
                <ui-select-content>
                  @for (font of fonts; track font) {
                    <ui-select-item [value]="font">{{ font }}</ui-select-item>
                  }
                </ui-select-content>
              </ng-container>
            </label>
            <label
              class="grid gap-1.5 text-xs font-medium"
              [for]="idPrefix() + '-heading-weight'"
            >
              Weight
              <ng-container
                uiSelect
                [value]="String(theme().typography.heading.fontWeight)"
                (valueChange)="store.setHeadingFontWeight(Number($event))"
              >
                <button
                  uiSelectTrigger
                  class="w-full"
                  size="sm"
                  [id]="idPrefix() + '-heading-weight'"
                >
                  <ui-select-value />
                </button>
                <ui-select-content>
                  @for (weight of weights; track weight) {
                    <ui-select-item [value]="weight">{{
                      weight
                    }}</ui-select-item>
                  }
                </ui-select-content>
              </ng-container>
            </label>
            <app-number-field
              label="Line height"
              [max]="2"
              [min]="1"
              [step]="0.05"
              [value]="theme().typography.heading.lineHeight"
              (commit)="store.setHeadingLineHeight($event)"
            />
            @for (level of headingLevels; track level) {
              <app-number-field
                suffix="pt"
                [label]="level.toUpperCase()"
                [max]="64"
                [min]="8"
                [value]="theme().typography.heading.fontSize[level]"
                (commit)="store.setHeadingFontSize(level, $event)"
              />
            }
          </div>
        </app-theme-controls-section>
      </ui-tabs-content>

      <ui-tabs-content value="layout">
        <app-theme-controls-section
          description="Paper format and reading direction."
          title="Page"
        >
          <div class="grid grid-cols-2 gap-3">
            <label
              class="grid gap-1.5 text-xs font-medium"
              [for]="idPrefix() + '-page-size'"
            >
              Size
              <ng-container
                uiSelect
                [value]="theme().page.size"
                (valueChange)="store.setPageSize($any($event))"
              >
                <button
                  uiSelectTrigger
                  class="w-full"
                  size="sm"
                  [id]="idPrefix() + '-page-size'"
                >
                  <ui-select-value />
                </button>
                <ui-select-content>
                  <ui-select-item value="A4">A4</ui-select-item>
                  <ui-select-item value="LETTER">Letter</ui-select-item>
                  <ui-select-item value="LEGAL">Legal</ui-select-item>
                </ui-select-content>
              </ng-container>
            </label>
            <label
              class="grid gap-1.5 text-xs font-medium"
              [for]="idPrefix() + '-page-orientation'"
            >
              Orientation
              <ng-container
                uiSelect
                [value]="theme().page.orientation"
                (valueChange)="store.setPageOrientation($any($event))"
              >
                <button
                  uiSelectTrigger
                  class="w-full capitalize"
                  size="sm"
                  [id]="idPrefix() + '-page-orientation'"
                >
                  <ui-select-value />
                </button>
                <ui-select-content>
                  <ui-select-item value="portrait">Portrait</ui-select-item>
                  <ui-select-item value="landscape">Landscape</ui-select-item>
                </ui-select-content>
              </ng-container>
            </label>
          </div>
        </app-theme-controls-section>

        <ui-separator class="my-4" />

        <app-theme-controls-section
          description="Space between content and every page edge."
          title="Margins"
        >
          <div class="grid grid-cols-2 gap-3">
            @for (margin of margins; track margin[0]) {
              <app-number-field
                suffix="pt"
                [label]="margin[1]"
                [max]="120"
                [min]="0"
                [value]="theme().spacing.page[margin[0]]"
                (commit)="store.setPageMargin(margin[0], $event)"
              />
            }
          </div>
        </app-theme-controls-section>

        <ui-separator class="my-4" />

        <app-theme-controls-section
          description="Vertical spacing between document elements."
          title="Rhythm"
        >
          <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            @for (gap of rhythm; track gap[0]) {
              <app-number-field
                suffix="pt"
                [label]="gap[1]"
                [max]="80"
                [min]="0"
                [value]="theme().spacing[gap[0]]"
                (commit)="store.setSpacing(gap[0], $event)"
              />
            }
          </div>
        </app-theme-controls-section>
      </ui-tabs-content>
    </ui-tabs>
  `,
})
export class ThemeControls {
  /** Keeps ids unique when the desktop and mobile panels both render. */
  readonly idPrefix = input.required<string>();
  readonly class = input("");

  protected readonly store = inject(ThemeBuilderStore);
  protected readonly theme = this.store.theme;
  protected readonly classes = computed(() =>
    cn("block space-y-4 py-4", this.class())
  );

  protected readonly LayoutTemplate = LayoutTemplate;
  protected readonly Palette = Palette;
  protected readonly Shuffle = Shuffle;
  protected readonly Type = Type;
  protected readonly colorFields = COLOR_FIELDS;
  protected readonly fonts = FONT_OPTIONS;
  protected readonly headingLevels = HEADING_LEVELS;
  protected readonly margins = MARGINS;
  protected readonly rhythm = RHYTHM;
  protected readonly weights = ["400", "500", "600", "700"];
  protected readonly blurOnEnter = blurOnEnter;
  protected readonly String = String;
  protected readonly Number = Number;

  protected commitName(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const nextName = target.value.trim();
    if (nextName) {
      this.store.setName(nextName);
    } else {
      target.value = this.theme().name;
    }
  }

  protected loadRandomPreset() {
    const basePreset = this.store.basePreset();
    const others = THEMES.filter(({ name }) => name !== basePreset);
    const next = others[Math.floor(Math.random() * others.length)];
    if (next) {
      this.store.loadPreset(next.name);
    }
  }
}
