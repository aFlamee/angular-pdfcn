/**
 * <ui-text-flip class="text-foreground" [items]="names" [interval]="1.5" [(index)]="index" />
 *
 * Shows one item at a time. Every `interval` seconds the item slides down and out,
 * then the next slides in from above. The server renders the first item.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  signal,
} from "@angular/core";

import { cn } from "@/lib/utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  selector: "ui-text-flip",
  template: `
    @for (item of [items()[index()]]; track index()) {
      <span [class]="classes()" (animationend)="next()">{{ item }}</span>
    }
  `,
})
export class UiTextFlip {
  readonly items = input.required<readonly string[]>();
  readonly interval = input(2);
  readonly class = input("");
  readonly index = model(0);

  private readonly leaving = signal(false);
  private readonly started = signal(false);

  protected readonly classes = computed(() =>
    cn(
      "inline-block duration-300",
      this.leaving()
        ? "animate-out fade-out-0 slide-out-to-bottom-3 fill-mode-forwards"
        : this.started() && "animate-in fade-in-0 slide-in-from-top-3",
      this.class()
    )
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => {
        this.started.set(true);
        this.leaving.set(true);
      }, this.interval() * 1000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  protected next() {
    if (this.leaving()) {
      this.leaving.set(false);
      this.index.set((this.index() + 1) % this.items().length);
    }
  }
}
