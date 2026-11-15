import { Injectable } from "@angular/core";
import { defineSound } from "@web-kits/audio";
import { WebHaptics } from "web-haptics";

import { SOUNDS } from "./sound";
import type { FeedbackType } from "./sound";
import { storedSignal } from "./stored-signal";

export type { FeedbackType } from "./sound";

const HAPTIC_PRESETS: Partial<Record<FeedbackType, string>> = {
  blur: "light",
  checkbox: "light",
  click: "medium",
  copy: "selection",
  deselect: "light",
  error: "error",
  focus: "light",
  heart: "light",
  hover: "soft",
  keyPress: "light",
  notification: "nudge",
  pop: "medium",
  radio: "medium",
  scrollSnap: "selection",
  select: "selection",
  star: "medium",
  success: "success",
  tabSwitch: "selection",
  tap: "light",
  tick: "selection",
  toggleOff: "light",
  toggleOn: "light",
  warning: "warning",
};

/** Plays the sound and haptic for a UI interaction when the user enabled them. Both start off. */
@Injectable({ providedIn: "root" })
export class FeedbackService {
  readonly soundEnabled = storedSignal("sound-enabled", false);
  readonly hapticsEnabled = storedSignal("haptics-enabled", false);
  private haptics?: WebHaptics;

  play(sound?: FeedbackType, haptic = true) {
    if (!sound) {
      return;
    }
    if (this.soundEnabled()) {
      defineSound(SOUNDS[sound])();
    }
    if (haptic && this.hapticsEnabled()) {
      this.haptics ??= new WebHaptics();
      void this.haptics.trigger(HAPTIC_PRESETS[sound] ?? "light");
    }
  }

  /** The S hotkey: the toggle sound plays whatever the old setting was. */
  toggleSound() {
    if (this.soundEnabled()) {
      defineSound(SOUNDS.toggleOff)();
      this.soundEnabled.set(false);
    } else {
      this.soundEnabled.set(true);
      defineSound(SOUNDS.toggleOn)();
    }
  }

  /** The H hotkey: the haptic always fires, the sound only when sound is on. */
  toggleHaptics() {
    if (this.hapticsEnabled()) {
      this.play("toggleOff");
      this.hapticsEnabled.set(false);
    } else {
      this.hapticsEnabled.set(true);
      this.play("toggleOn");
    }
  }
}
