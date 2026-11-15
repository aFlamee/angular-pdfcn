/**
 * <ng-container uiPopover [(open)]="open">
 *   <button uiButton uiPopoverTrigger>Open</button>
 *   <ui-popover-content *uiPortal align="end" [sideOffset]="8" class="w-56 p-2" [autoFocus]="false">
 *     ...
 *   </ui-popover-content>
 * </ng-container>
 *
 * Import `UiPortal` from `ui/overlay` with the parts. Put `uiPopoverAnchor` on an element
 * inside the root to position the content against it instead of the trigger.
 * The content sets `--radix-popper-available-height` and `-width` like Radix.
 */
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
} from "@angular/core";

import { cn } from "@/lib/utils";
import {
  ConnectedOverlayRoot,
  OverlayRoot,
  OverlayTrigger,
  connectContent,
} from "@/src/app/components/ui/overlay";
import type { Align, Side } from "@/src/app/components/ui/overlay";

@Directive({
  exportAs: "uiPopover",
  providers: [
    { provide: OverlayRoot, useExisting: forwardRef(() => UiPopover) },
  ],
  selector: "[uiPopover]",
})
export class UiPopover extends ConnectedOverlayRoot {
  protected readonly soundKind = "dropdown";
  protected readonly slot = "popover-content";
}

@Directive({
  host: { "aria-haspopup": "dialog" },
  selector: "[uiPopoverTrigger]",
})
export class UiPopoverTrigger extends OverlayTrigger {
  protected readonly root = inject(UiPopover);
}

@Directive({ selector: "[uiPopoverAnchor]" })
export class UiPopoverAnchor {
  constructor() {
    inject(UiPopover).anchor =
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.data-side]": "root.side()",
    "[attr.data-state]": "root.state()",
    "[class]": "classes()",
    "data-slot": "popover-content",
    role: "dialog",
    tabindex: "-1",
  },
  selector: "ui-popover-content",
  template: "<ng-content />",
})
export class UiPopoverContent {
  readonly side = input<Side>("bottom");
  readonly align = input<Align>("center");
  readonly sideOffset = input(4);
  readonly alignOffset = input(0);
  /** Focuses the first tabbable element on open, like Radix's `onOpenAutoFocus`. */
  readonly autoFocus = input(true);
  readonly class = input("");

  protected readonly root = inject(UiPopover);
  protected readonly classes = computed(() =>
    cn(
      "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
      this.class()
    )
  );

  constructor() {
    connectContent(this.root, () => ({
      align: this.align(),
      alignOffset: this.alignOffset(),
      side: this.side(),
      sideOffset: this.sideOffset(),
    }));
    afterNextRender(() => {
      if (this.autoFocus()) {
        this.root.focusFirstTabbable();
      }
    });
  }
}
