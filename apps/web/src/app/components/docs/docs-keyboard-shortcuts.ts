import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";

import { isHotkey } from "@/src/app/components/hotkey";
import { FeedbackService } from "@/src/app/services/feedback";

/** The arrow keys open the previous and next docs page. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown)": "onKeydown($event)" },
  selector: "docs-keyboard-shortcuts",
  template: "",
})
export class DocsKeyboardShortcuts {
  readonly previous = input.required<string | undefined>();
  readonly next = input.required<string | undefined>();

  private readonly router = inject(Router);
  private readonly feedback = inject(FeedbackService);

  protected onKeydown(event: KeyboardEvent) {
    const key = ["ArrowLeft", "ArrowRight"].find((k) => isHotkey(event, k));
    if (!key) {
      return;
    }
    event.preventDefault();
    const href = key === "ArrowRight" ? this.next() : this.previous();
    if (href) {
      this.feedback.play("click");
      void this.router.navigateByUrl(href);
    }
  }
}
