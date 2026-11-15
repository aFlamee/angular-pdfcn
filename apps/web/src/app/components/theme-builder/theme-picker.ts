import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { Check, ChevronsUpDown } from "lucide";

import { THEMES } from "@/registry/themes";
import type { ThemePresetName } from "@/registry/themes";
import type { ColorTokens } from "@/registry/types/pdf-themes";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiCommand,
  UiCommandEmpty,
  UiCommandGroup,
  UiCommandInput,
  UiCommandItem,
  UiCommandList,
} from "@/src/app/components/ui/command";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiPortal } from "@/src/app/components/ui/overlay";
import {
  UiPopover,
  UiPopoverContent,
  UiPopoverTrigger,
} from "@/src/app/components/ui/popover";

const THEME_PALETTE_KEYS = [
  "primary",
  "accent",
  "muted",
  "background",
] as const;

type ThemeColors = Pick<ColorTokens, (typeof THEME_PALETTE_KEYS)[number]>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex shrink-0 gap-1" },
  selector: "app-theme-palette",
  template: `
    @for (key of keys; track key) {
      <div
        class="h-4 w-2.5 shrink-0 rounded-xs ring-1 ring-foreground/10"
        [style.background-color]="colors()?.[key] ?? 'var(--' + key + ')'"
      ></div>
    }
  `,
})
export class ThemePalette {
  readonly colors = input<ThemeColors>();
  protected readonly keys = THEME_PALETTE_KEYS;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    ThemePalette,
    UiButton,
    UiCommand,
    UiCommandEmpty,
    UiCommandGroup,
    UiCommandInput,
    UiCommandItem,
    UiCommandList,
    UiIcon,
    UiPopover,
    UiPopoverContent,
    UiPopoverTrigger,
    UiPortal,
  ],
  selector: "app-theme-picker",
  template: `
    <ng-container uiPopover [(open)]="open">
      <button
        uiButton
        uiPopoverTrigger
        variant="outline"
        size="sm"
        class="flex-1 justify-start gap-2 px-2"
        aria-label="Select theme"
      >
        <app-theme-palette [colors]="selectedThemeData()?.theme?.colors" />
        <span class="flex-1 text-left">{{ selectedThemeData()?.title }}</span>
        <svg [uiIcon]="ChevronsUpDown" class="opacity-50"></svg>
      </button>
      <ui-popover-content *uiPortal class="w-[320px] p-0" align="start">
        <ui-command>
          <ui-command-input placeholder="Search theme..." />
          <ui-command-list>
            <ui-command-empty>No theme found.</ui-command-empty>
            <ui-command-group>
              @for (item of themes; track item.name) {
                <ui-command-item
                  [value]="item.name"
                  (select)="select(item.name)"
                >
                  <app-theme-palette [colors]="item.theme.colors" />
                  <span class="flex-1">{{ item.title }}</span>
                  @if (selectedTheme() === item.name) {
                    <svg [uiIcon]="Check" class="size-4 shrink-0"></svg>
                  }
                </ui-command-item>
              }
            </ui-command-group>
          </ui-command-list>
        </ui-command>
      </ui-popover-content>
    </ng-container>
  `,
})
export class ThemePicker {
  readonly selectedTheme = input.required<ThemePresetName>();
  readonly themeSelect = output<ThemePresetName>();

  protected readonly Check = Check;
  protected readonly ChevronsUpDown = ChevronsUpDown;
  protected readonly themes = THEMES;
  protected readonly open = signal(false);
  protected readonly selectedThemeData = computed(() =>
    THEMES.find((t) => t.name === this.selectedTheme())
  );

  protected select(name: ThemePresetName) {
    this.themeSelect.emit(name);
    this.open.set(false);
  }
}
