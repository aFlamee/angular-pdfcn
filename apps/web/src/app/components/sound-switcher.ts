import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import { Volume2, VolumeX } from "lucide";

import {
  SWITCHER_GROUP_CLS,
  SWITCHER_OPTION_CLS,
} from "@/src/app/components/mode-switcher";
import { UiIcon } from "@/src/app/components/ui/icon";
import { FeedbackService } from "@/src/app/services/feedback";

const OPTIONS = [
  { icon: Volume2, label: "on", value: true },
  { icon: VolumeX, label: "off", value: false },
] as const;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  selector: "app-sound-switcher",
  template: `
    @if (mounted()) {
      <div [class]="SWITCHER_GROUP_CLS" role="radiogroup" aria-label="Sound">
        @for (option of options; track option.label) {
          <button
            type="button"
            [class]="SWITCHER_OPTION_CLS"
            role="radio"
            [attr.data-active]="feedback.soundEnabled() === option.value"
            [attr.aria-checked]="feedback.soundEnabled() === option.value"
            [attr.aria-label]="'Switch sound ' + option.label"
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
export class SoundSwitcher {
  protected readonly SWITCHER_GROUP_CLS = SWITCHER_GROUP_CLS;
  protected readonly SWITCHER_OPTION_CLS = SWITCHER_OPTION_CLS;
  protected readonly options = OPTIONS;
  protected readonly feedback = inject(FeedbackService);
  protected readonly mounted = signal(false);

  constructor() {
    afterNextRender(() => this.mounted.set(true));
  }

  protected select(value: boolean) {
    if (value === this.feedback.soundEnabled()) {
      return;
    }
    this.feedback.play(value ? "toggleOn" : "toggleOff");
    this.feedback.soundEnabled.set(value);
  }
}
