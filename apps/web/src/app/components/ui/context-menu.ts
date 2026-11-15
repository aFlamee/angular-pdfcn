/**
 * <ng-container uiContextMenu>
 *   <span uiContextMenuTrigger>Right-click here</span>
 *   <ui-context-menu-content *uiPortal>
 *     <button uiContextMenuItem (click)="copy()">Copy</button>
 *     <ui-context-menu-separator />
 *     <a uiContextMenuItem href="..." target="_blank">Open</a>
 *   </ui-context-menu-content>
 * </ng-container>
 *
 * Import `UiPortal` from `ui/overlay` with the parts. The menu opens at the pointer.
 * Clicking an item closes it. Arrow keys, Home, End and typeahead move between items.
 */
import { FocusKeyManager } from "@angular/cdk/a11y";
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
} from "@angular/cdk/overlay";
import type {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
} from "@angular/cdk/overlay";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import { OverlayRoot } from "@/src/app/components/ui/overlay";

/** Below and right of the pointer, flipped when it doesn't fit. */
const POSITIONS: ConnectedPosition[] = (["start", "end"] as const).flatMap(
  (x) =>
    (["top", "bottom"] as const).map((y) => ({
      originX: "start",
      originY: "top",
      overlayX: x,
      overlayY: y,
    }))
);

@Directive({
  exportAs: "uiContextMenu",
  providers: [
    { provide: OverlayRoot, useExisting: forwardRef(() => UiContextMenu) },
  ],
  selector: "[uiContextMenu]",
})
export class UiContextMenu extends OverlayRoot {
  protected readonly soundKind = "dropdown";
  panel?: HTMLElement;
  private point = { x: 0, y: 0 };
  private strategy?: FlexibleConnectedPositionStrategy;

  openAt(event: MouseEvent, trigger: HTMLElement) {
    event.preventDefault();
    this.trigger = trigger;
    this.point = { x: event.clientX, y: event.clientY };
    this.strategy?.setOrigin(this.point);
    this.ref?.updatePosition();
    this.open.set(true);
  }

  protected createOverlay() {
    const strategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      this.point
    ).withPositions(POSITIONS);
    strategy.positionChanges.subscribe(({ connectionPair }) => {
      this.panel?.style.setProperty(
        "--radix-context-menu-content-transform-origin",
        `${connectionPair.overlayX === "start" ? "left" : "right"} ${connectionPair.overlayY}`
      );
    });
    this.strategy = strategy;
    const ref = createOverlayRef(this.injector, {
      positionStrategy: strategy,
    });
    ref.outsidePointerEvents().subscribe((event) => {
      // A right-click on the trigger moves the menu instead.
      if (
        event.type === "click" ||
        !this.trigger?.contains(event.target as Node)
      ) {
        this.open.set(false);
      }
    });
    return ref;
  }
}

@Directive({
  host: { "(contextmenu)": "root.openAt($event, el)" },
  selector: "[uiContextMenuTrigger]",
})
export class UiContextMenuTrigger {
  protected readonly root = inject(UiContextMenu);
  protected readonly el =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}

@Directive({
  host: {
    "(click)": "root.open.set(false)",
    "(pointerleave)": "root.panel?.focus()",
    "(pointermove)": "focus()",
    "[class]": "classes()",
    "data-slot": "context-menu-item",
    "data-variant": "default",
    role: "menuitem",
    tabindex: "-1",
  },
  selector: "[uiContextMenuItem]",
})
export class UiContextMenuItem {
  readonly class = input("");

  readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly root = inject(UiContextMenu);
  protected readonly classes = computed(() =>
    cn(
      "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!",
      this.class()
    )
  );

  focus() {
    this.el.focus({ preventScroll: true });
  }

  getLabel() {
    return this.el.textContent?.trim() ?? "";
  }
}

@Component({
  host: {
    class: "-mx-1 my-1 block h-px bg-border",
    "data-slot": "context-menu-separator",
    role: "separator",
  },
  selector: "ui-context-menu-separator",
  template: "",
})
export class UiContextMenuSeparator {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(keydown)": "onKeydown($event)",
    "[attr.data-state]": "root.state()",
    "[class]": "classes()",
    "data-side": "bottom",
    "data-slot": "context-menu-content",
    role: "menu",
    tabindex: "-1",
  },
  selector: "ui-context-menu-content",
  template: "<ng-content />",
})
export class UiContextMenuContent {
  readonly class = input("");

  protected readonly root = inject(UiContextMenu);
  protected readonly classes = computed(() =>
    cn(
      "z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      this.class()
    )
  );

  private readonly items = contentChildren(UiContextMenuItem, {
    descendants: true,
  });
  private readonly keys = new FocusKeyManager(this.items, inject(Injector))
    .withWrap()
    .withHomeAndEnd()
    .withTypeAhead();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root.panel = el;
    inject(DestroyRef).onDestroy(() => {
      if (this.root.panel === el) {
        this.root.panel = undefined;
      }
    });
    afterNextRender(() => el.focus({ preventScroll: true }));
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
      focused?.el.click();
    } else {
      this.keys.onKeydown(event);
    }
  }
}
