/**
 * <ng-container uiDropdownMenu>
 *   <button uiButton uiDropdownMenuTrigger>Share</button>
 *   <ui-dropdown-menu-content *uiPortal align="end" [alignOffset]="-6" class="w-fit">
 *     <button uiDropdownMenuItem sound="copy" (click)="copy()">Copy link</button>
 *     <a uiDropdownMenuItem sound="click" href="..." target="_blank">Share on X</a>
 *   </ui-dropdown-menu-content>
 * </ng-container>
 *
 * Import `UiPortal` from `ui/overlay` with the parts. Clicking an item closes the menu.
 * Arrow keys, Home, End and typeahead move between items. `[(open)]` controls it.
 */
import { FocusKeyManager } from "@angular/cdk/a11y";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  contentChildren,
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
import { FeedbackService } from "@/src/app/services/feedback";
import type { FeedbackType } from "@/src/app/services/feedback";

@Directive({
  exportAs: "uiDropdownMenu",
  providers: [
    { provide: OverlayRoot, useExisting: forwardRef(() => UiDropdownMenu) },
  ],
  selector: "[uiDropdownMenu]",
})
export class UiDropdownMenu extends ConnectedOverlayRoot {
  protected readonly soundKind = "dropdown";
  protected readonly slot = "dropdown-menu-content";
}

@Directive({
  host: {
    "(keydown.arrowdown)": "openWithKeyboard($event)",
    "aria-haspopup": "menu",
  },
  selector: "[uiDropdownMenuTrigger]",
})
export class UiDropdownMenuTrigger extends OverlayTrigger {
  protected readonly root = inject(UiDropdownMenu);

  protected openWithKeyboard(event: Event) {
    event.preventDefault();
    this.root.openedByKeyboard = true;
    this.root.open.set(true);
  }
}

@Directive({
  host: {
    "(click)": "select()",
    "(pointerleave)": "root.panel?.focus()",
    "(pointermove)": "focus()",
    "[attr.data-inset]": "inset() || null",
    "[attr.data-variant]": "variant()",
    "[class]": "classes()",
    "data-slot": "dropdown-menu-item",
    role: "menuitem",
    tabindex: "-1",
  },
  selector: "[uiDropdownMenuItem]",
})
export class UiDropdownMenuItem {
  readonly inset = input(false);
  readonly variant = input<"default" | "destructive">("default");
  readonly sound = input<FeedbackType>();
  readonly haptic = input(true);
  readonly class = input("");

  readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly root = inject(UiDropdownMenu);
  private readonly feedback = inject(FeedbackService);

  protected readonly classes = computed(() =>
    cn(
      "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      this.class()
    )
  );

  focus() {
    this.el.focus({ preventScroll: true });
  }

  getLabel() {
    return this.el.textContent?.trim() ?? "";
  }

  click() {
    this.el.click();
  }

  protected select() {
    this.feedback.play(this.sound(), this.haptic());
    this.root.open.set(false);
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(keydown)": "onKeydown($event)",
    "[attr.data-side]": "root.side()",
    "[attr.data-state]": "root.state()",
    "[class]": "classes()",
    "data-slot": "dropdown-menu-content",
    role: "menu",
    tabindex: "-1",
  },
  selector: "ui-dropdown-menu-content",
  template: "<ng-content />",
})
export class UiDropdownMenuContent {
  readonly side = input<Side>("bottom");
  readonly align = input<Align>("center");
  readonly sideOffset = input(4);
  readonly alignOffset = input(0);
  readonly class = input("");

  protected readonly root = inject(UiDropdownMenu);
  protected readonly classes = computed(() =>
    cn(
      "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
      this.class()
    )
  );

  private readonly items = contentChildren(UiDropdownMenuItem, {
    descendants: true,
  });
  private readonly keys = new FocusKeyManager(this.items, inject(Injector))
    .withWrap()
    .withHomeAndEnd()
    .withTypeAhead();

  constructor() {
    connectContent(this.root, () => ({
      align: this.align(),
      alignOffset: this.alignOffset(),
      side: this.side(),
      sideOffset: this.sideOffset(),
    }));
    afterNextRender(() => {
      if (this.root.openedByKeyboard) {
        this.keys.setFirstItemActive();
      } else {
        this.root.panel?.focus();
      }
    });
  }

  protected onKeydown(event: KeyboardEvent) {
    // Hover moves focus without telling the key manager.
    const focused = this.items().find((i) => i.el === document.activeElement);
    if (focused) {
      this.keys.updateActiveItem(focused);
    }
    if (event.key === "Tab") {
      event.preventDefault();
      this.root.open.set(false);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      focused?.click();
    } else {
      this.keys.onKeydown(event);
    }
  }
}
