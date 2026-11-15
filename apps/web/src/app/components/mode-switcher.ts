import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import { Monitor, Moon, Sun } from "lucide";
import type { IconNode } from "lucide";

import { UiIcon } from "@/src/app/components/ui/icon";
import { FeedbackService } from "@/src/app/services/feedback";
import { ThemeService } from "@/src/app/services/theme";
import type { ThemeSetting } from "@/src/app/services/theme";

export const SWITCHER_GROUP_CLS =
  "inline-flex items-center rounded-full bg-background inset-ring-1 inset-ring-border";
export const SWITCHER_OPTION_CLS =
  "relative flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[color,box-shadow] hover:text-foreground data-[active=true]:text-foreground data-[active=true]:inset-ring-1 data-[active=true]:inset-ring-border [&_svg]:size-4";

const THEME_OPTIONS: { icon: IconNode; value: ThemeSetting }[] = [
  { icon: Monitor, value: "system" },
  { icon: Sun, value: "light" },
  { icon: Moon, value: "dark" },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  selector: "app-mode-switcher",
  template: `
    @if (mounted()) {
      <div [class]="SWITCHER_GROUP_CLS" role="radiogroup" aria-label="Theme">
        @for (option of options; track option.value) {
          <button
            type="button"
            [class]="SWITCHER_OPTION_CLS"
            role="radio"
            [attr.data-active]="theme.theme() === option.value"
            [attr.aria-checked]="theme.theme() === option.value"
            [attr.aria-label]="'Switch to ' + option.value + ' theme'"
            (click)="select(option.value)"
          >
            <svg [uiIcon]="option.icon"></svg>
          </button>
        }
      </div>
    } @else {
      <div class="flex h-8 w-24"></div>
    }
  `,
})
export class ModeSwitcher {
  protected readonly SWITCHER_GROUP_CLS = SWITCHER_GROUP_CLS;
  protected readonly SWITCHER_OPTION_CLS = SWITCHER_OPTION_CLS;
  protected readonly options = THEME_OPTIONS;
  protected readonly theme = inject(ThemeService);
  protected readonly mounted = signal(false);
  private readonly feedback = inject(FeedbackService);

  constructor() {
    afterNextRender(() => this.mounted.set(true));
  }

  protected select(value: ThemeSetting) {
    this.feedback.play(value === "dark" ? "toggleOff" : "toggleOn");
    this.theme.setTheme(value);
  }
}
