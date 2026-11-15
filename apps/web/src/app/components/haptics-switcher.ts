import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import { Vibrate, VibrateOff } from "lucide";

import {
  SWITCHER_GROUP_CLS,
  SWITCHER_OPTION_CLS,
} from "@/src/app/components/mode-switcher";
import { UiIcon } from "@/src/app/components/ui/icon";
import { FeedbackService } from "@/src/app/services/feedback";

const OPTIONS = [
  { icon: Vibrate, label: "on", value: true },
  { icon: VibrateOff, label: "off", value: false },
] as const;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  selector: "app-haptics-switcher",
  template: `
    @if (mounted()) {
      <div [class]="SWITCHER_GROUP_CLS" role="radiogroup" aria-label="Haptics">
        @for (option of options; track option.label) {
          <button
            type="button"
            [class]="SWITCHER_OPTION_CLS"
            role="radio"
            [attr.data-active]="feedback.hapticsEnabled() === option.value"
            [attr.aria-checked]="feedback.hapticsEnabled() === option.value"
            [attr.aria-label]="'Switch haptics ' + option.label"
            (click)="select(option.value)"
          >
            <svg [uiIcon]="option.icon"></svg>
          </button>
        }
      </div>
    } @else {
      <div class="flex h-8 w-20"></div>
    }
  `,
})
export class HapticsSwitcher {
  protected readonly SWITCHER_GROUP_CLS = SWITCHER_GROUP_CLS;
  protected readonly SWITCHER_OPTION_CLS = SWITCHER_OPTION_CLS;
  protected readonly options = OPTIONS;
  protected readonly feedback = inject(FeedbackService);
  protected readonly mounted = signal(false);

  constructor() {
    afterNextRender(() => this.mounted.set(true));
  }

  protected select(value: boolean) {
    if (value === this.feedback.hapticsEnabled()) {
      return;
    }
    this.feedback.play(value ? "toggleOn" : "toggleOff");
    this.feedback.hapticsEnabled.set(value);
  }
}
