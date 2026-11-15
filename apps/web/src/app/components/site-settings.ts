import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { Settings } from "lucide";

import { HapticsSwitcher } from "@/src/app/components/haptics-switcher";
import { isHotkey } from "@/src/app/components/hotkey";
import { ModeSwitcher } from "@/src/app/components/mode-switcher";
import { SoundSwitcher } from "@/src/app/components/sound-switcher";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiDrawer,
  UiDrawerClose,
  UiDrawerContent,
  UiDrawerDescription,
  UiDrawerFooter,
  UiDrawerHeader,
  UiDrawerTitle,
  UiDrawerTrigger,
} from "@/src/app/components/ui/drawer";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiKbd } from "@/src/app/components/ui/kbd";
import { UiPortal } from "@/src/app/components/ui/overlay";
import {
  UiPopover,
  UiPopoverContent,
  UiPopoverTrigger,
} from "@/src/app/components/ui/popover";
import { FeedbackService } from "@/src/app/services/feedback";
import { MediaQueryService } from "@/src/app/services/media-query";
import { ThemeService } from "@/src/app/services/theme";

/** Theme, sound and haptics settings: a popover, or a drawer on mobile. D, S and H toggle them. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown)": "onKeydown($event)", class: "contents" },
  imports: [
    HapticsSwitcher,
    ModeSwitcher,
    NgTemplateOutlet,
    SoundSwitcher,
    UiButton,
    UiDrawer,
    UiDrawerClose,
    UiDrawerContent,
    UiDrawerDescription,
    UiDrawerFooter,
    UiDrawerHeader,
    UiDrawerTitle,
    UiDrawerTrigger,
    UiIcon,
    UiKbd,
    UiPopover,
    UiPopoverContent,
    UiPopoverTrigger,
    UiPortal,
  ],
  selector: "app-site-settings",
  template: `
    <ng-template #content>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="w-12 text-sm">Theme</span>
            @if (!isMobile()) {
              <kbd uiKbd>D</kbd>
            }
          </div>
          <app-mode-switcher />
        </div>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="w-12 text-sm">Sound</span>
            @if (!isMobile()) {
              <kbd uiKbd>S</kbd>
            }
          </div>
          <app-sound-switcher />
        </div>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="w-12 text-sm">Haptics</span>
            @if (!isMobile()) {
              <kbd uiKbd>H</kbd>
            }
          </div>
          <app-haptics-switcher />
        </div>
      </div>
    </ng-template>
    @if (isMobile()) {
      <ng-container uiDrawer sounds [(open)]="open">
        <button
          uiButton
          uiDrawerTrigger
          type="button"
          variant="ghost"
          size="icon"
          class="group/settings extend-touch-target size-8"
          aria-label="Settings"
        >
          <svg [uiIcon]="Settings"></svg>
        </button>
        <ui-drawer-content *uiPortal>
          <div uiDrawerHeader>
            <h2 uiDrawerTitle>Settings</h2>
            <p uiDrawerDescription>Manage site preferences</p>
          </div>
          <div class="px-4"><ng-container *ngTemplateOutlet="content" /></div>
          <div uiDrawerFooter>
            <button uiButton uiDrawerClose type="button" size="sm">Done</button>
          </div>
        </ui-drawer-content>
      </ng-container>
    } @else {
      <ng-container uiPopover [(open)]="open">
        <button
          uiButton
          uiPopoverTrigger
          type="button"
          variant="ghost"
          size="icon"
          class="group/settings extend-touch-target size-8"
          aria-label="Settings"
        >
          <svg [uiIcon]="Settings"></svg>
        </button>
        <ui-popover-content
          *uiPortal
          align="end"
          class="w-56 p-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-100 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-100 dark:bg-black"
          [autoFocus]="false"
        >
          <ng-container *ngTemplateOutlet="content" />
        </ui-popover-content>
      </ng-container>
    }
  `,
})
export class SiteSettings {
  protected readonly Settings = Settings;
  protected readonly open = signal(false);
  protected readonly isMobile = inject(MediaQueryService).isMobile;
  private readonly feedback = inject(FeedbackService);
  private readonly theme = inject(ThemeService);

  protected onKeydown(event: KeyboardEvent) {
    const toggles: Record<string, () => void> = {
      d: () => this.toggleTheme(),
      h: () => this.feedback.toggleHaptics(),
      s: () => this.feedback.toggleSound(),
    };
    const key = Object.keys(toggles).find((k) => isHotkey(event, k));
    if (key) {
      event.preventDefault();
      toggles[key]();
    }
  }

  private toggleTheme() {
    const next = this.theme.resolvedTheme() === "dark" ? "light" : "dark";
    this.feedback.play(next === "dark" ? "toggleOff" : "toggleOn");
    this.theme.setTheme(next);
  }
}
