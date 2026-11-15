import { Clipboard } from "@angular/cdk/clipboard";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Check, Copy } from "lucide";

import { cn } from "@/lib/utils";
import { UiButton } from "@/src/app/components/ui/button";
import type { ButtonVariants } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiTooltip } from "@/src/app/components/ui/tooltip";

/** Copies `value` and shows a check for a second. Projected content turns it into a labelled button. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [UiButton, UiIcon, UiTooltip],
  selector: "app-copy-button",
  template: `
    <button
      uiButton
      type="button"
      data-slot="copy-button"
      sound="copy"
      [size]="labelled() ? 'sm' : 'icon'"
      [variant]="variant()"
      [class]="classes()"
      [uiTooltip]="
        showTooltip() ? (copied() ? 'Copied' : 'Copy to Clipboard') : ''
      "
      (click)="copy()"
    >
      <span class="sr-only">Copy</span>
      @if (copied()) {
        <svg
          [uiIcon]="Check"
          stroke-width="3"
          class="animate-in fade-in-0 zoom-in-75 duration-150"
        ></svg>
      } @else {
        <svg
          [uiIcon]="Copy"
          class="animate-in fade-in-0 zoom-in-75 duration-150"
        ></svg>
      }
      <ng-content />
    </button>
  `,
})
export class CopyButton {
  readonly value = input.required<string | (() => string | Promise<string>)>();
  readonly variant = input<ButtonVariants["variant"]>("ghost");
  readonly class = input("");
  readonly labelled = input(false);
  readonly showTooltip = input(true);

  protected readonly Check = Check;
  protected readonly Copy = Copy;
  protected readonly copied = signal(false);
  private readonly clipboard = inject(Clipboard);
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly classes = computed(() =>
    cn(
      this.labelled()
        ? ""
        : "bg-code absolute top-3 right-2 z-10 size-7 hover:opacity-100 focus-visible:opacity-100",
      this.class()
    )
  );

  protected async copy() {
    const value = this.value();
    const text = typeof value === "function" ? await value() : value;
    if (text && this.clipboard.copy(text)) {
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1000);
    }
  }
}
