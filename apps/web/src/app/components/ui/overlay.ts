/**
 * Shared base for dialog, drawer, popover, dropdown menu and select. Not used directly.
 *
 * A root directive owns `open`. The content is a template, marked with `*uiPortal`
 * (select marks its own). The root attaches it to a CDK overlay in the browser
 * while open, plays the content's `data-state=closed` animation, then disposes it.
 */
import { FocusTrapFactory, InteractivityChecker } from "@angular/cdk/a11y";
import {
  createBlockScrollStrategy,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from "@angular/cdk/overlay";
import type {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  OverlayRef,
} from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import type { Portal } from "@angular/cdk/portal";
import { isPlatformBrowser } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from "@angular/core";
import type { OnInit } from "@angular/core";

import { FeedbackService } from "@/src/app/services/feedback";

export type Side = "top" | "bottom";
export type Align = "start" | "center" | "end";
export type OverlayState = "open" | "closed";

export interface Placement {
  align: Align;
  alignOffset: number;
  side: Side;
  sideOffset: number;
}

const finiteAnimations = (elements: (Element | null)[]) =>
  elements
    .flatMap((el) => el?.getAnimations({ subtree: true }) ?? [])
    .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);

@Directive()
export abstract class OverlayRoot {
  readonly open = model(false);
  /** Plays the kind's open and close sounds when `open` changes. */
  readonly sounds = input(false, { transform: booleanAttribute });
  protected abstract readonly soundKind: "modal" | "dropdown" | "drawer";
  /** `open` as the content's `data-state`, which stays `open` until the overlay shows. */
  readonly state = signal<OverlayState>("closed");
  /** The template to show, set by `*uiPortal` or select's content. */
  readonly content = signal<Portal<unknown> | null>(null);
  /** Positions connected content and gets focus back on close. */
  trigger?: HTMLElement;
  /** Whether the last trigger click came from the keyboard. */
  openedByKeyboard = false;

  protected readonly injector = inject(Injector);
  protected ref?: OverlayRef;
  private focusBeforeOpen?: HTMLElement;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    effect(() => {
      const portal = this.content();
      if (this.open() && portal) {
        untracked(() => this.show(portal));
      } else {
        untracked(() => this.hide());
      }
    });
    const feedback = inject(FeedbackService);
    let wasOpen = this.open();
    effect(() => {
      const open = this.open();
      if (open !== wasOpen && untracked(this.sounds)) {
        feedback.play(`${this.soundKind}${open ? "Open" : "Close"}`, false);
      }
      wasOpen = open;
    });
    inject(DestroyRef).onDestroy(() => this.ref?.dispose());
  }

  toggle() {
    this.open.update((open) => !open);
  }

  protected abstract createOverlay(): OverlayRef;

  private show(portal: Portal<unknown>) {
    this.state.set("open");
    if (this.ref) {
      // Reopened during the exit animation.
      return;
    }
    const active = document.activeElement;
    this.focusBeforeOpen = active instanceof HTMLElement ? active : undefined;
    const ref = this.createOverlay();
    ref.keydownEvents().subscribe((event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.open.set(false);
      }
    });
    ref.attach(portal);
    this.ref = ref;
  }

  private hide() {
    const { ref } = this;
    if (!ref || this.state() === "closed") {
      return;
    }
    this.state.set("closed");
    const active = document.activeElement;
    if (
      !active ||
      active === document.body ||
      ref.hostElement.contains(active)
    ) {
      (this.trigger ?? this.focusBeforeOpen)?.focus({ preventScroll: true });
    }
    afterNextRender(
      async () => {
        const animations = finiteAnimations([
          ref.hostElement,
          ref.backdropElement,
        ]);
        await Promise.allSettled(animations.map((a) => a.finished));
        if (this.ref === ref && this.state() === "closed") {
          ref.dispose();
          this.ref = undefined;
        }
      },
      { injector: this.injector }
    );
  }
}

/** Marks the template a dialog, drawer, popover or dropdown menu shows while open. */
@Directive({ selector: "[uiPortal]" })
export class UiPortal {
  constructor() {
    const root = inject(OverlayRoot);
    root.content.set(
      new TemplatePortal(inject(TemplateRef), inject(ViewContainerRef))
    );
    inject(DestroyRef).onDestroy(() => root.content.set(null));
  }
}

/** Traps focus in the host and focuses its first tabbable element once rendered. */
export const trapFocus = () => {
  const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const trap = inject(FocusTrapFactory).create(el);
  afterNextRender(() => trap.focusInitialElementWhenReady());
  inject(DestroyRef).onDestroy(() => trap.destroy());
};

/** A centered modal with a backdrop, focus trap and scroll lock. */
@Directive()
export abstract class ModalOverlayRoot extends OverlayRoot {
  /** Ids the content's `aria-labelledby` and `aria-describedby` point to. */
  readonly titleId = signal<string | null>(null);
  readonly descriptionId = signal<string | null>(null);
  /** The backdrop's `data-slot` and classes, which the reference renders as the overlay. */
  protected abstract readonly backdrop: { classes: string; slot: string };

  constructor() {
    super();
    effect(() => {
      const state = this.state();
      const backdrop = this.ref?.backdropElement;
      if (backdrop) {
        backdrop.dataset["state"] = state;
      }
    });
  }

  protected createOverlay() {
    const ref = createOverlayRef(this.injector, {
      backdropClass: this.backdrop.classes.split(" "),
      disableAnimations: true,
      hasBackdrop: true,
      scrollStrategy: createBlockScrollStrategy(this.injector),
    });
    ref.backdropClick().subscribe(() => this.open.set(false));
    ref.attachments().subscribe(() => {
      const backdrop = ref.backdropElement;
      if (backdrop) {
        backdrop.dataset["slot"] = this.backdrop.slot;
        backdrop.dataset["state"] = this.state();
      }
    });
    return ref;
  }
}

const toPosition = (p: Placement, side: Side): ConnectedPosition => ({
  offsetX: p.alignOffset,
  offsetY: side === "bottom" ? p.sideOffset : -p.sideOffset,
  originX: p.align,
  originY: side,
  overlayX: p.align,
  overlayY: side === "bottom" ? "top" : "bottom",
});

const ORIGIN_X: Record<Align, string> = {
  center: "50%",
  end: "100%",
  start: "0%",
};

/** Content placed next to the trigger, like Radix's popper. */
@Directive()
export abstract class ConnectedOverlayRoot extends OverlayRoot {
  /** Positions the content instead of the trigger when set. */
  anchor?: HTMLElement;
  /** The content element, which receives the `--radix-*` size variables. */
  panel?: HTMLElement;
  /** The side the content ended up on, after flipping. */
  readonly side = signal<Side>("bottom");

  /** Prefix of the `--radix-<slot>-*` variables the content's classes read. */
  protected abstract readonly slot: string;
  private strategy?: FlexibleConnectedPositionStrategy;
  private placement: Placement = {
    align: "center",
    alignOffset: 0,
    side: "bottom",
    sideOffset: 4,
  };

  private readonly checker = inject(InteractivityChecker);

  /** Called by the content with its `side`, `align` and offset inputs. */
  place(placement: Placement) {
    this.placement = placement;
    this.side.set(placement.side);
    this.strategy?.withPositions(this.positions());
    this.ref?.updatePosition();
  }

  /** Focuses the first tabbable element in the content, or the content itself. */
  focusFirstTabbable() {
    const { panel } = this;
    const first = [...(panel?.querySelectorAll<HTMLElement>("*") ?? [])].find(
      (el) => this.checker.isFocusable(el) && this.checker.isTabbable(el)
    );
    (first ?? panel)?.focus({ preventScroll: true });
  }

  protected createOverlay() {
    const origin = this.anchor ?? this.trigger;
    if (!origin) {
      throw new Error("Connected content needs a trigger or an anchor.");
    }
    const strategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      origin
    ).withPositions(this.positions());
    this.strategy = strategy;
    strategy.positionChanges.subscribe(({ connectionPair }) => {
      this.side.set(connectionPair.originY === "bottom" ? "bottom" : "top");
      this.measure(origin);
    });
    const ref = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    ref.outsidePointerEvents().subscribe((event) => {
      if (!this.trigger?.contains(event.target as Node)) {
        this.open.set(false);
      }
    });
    return ref;
  }

  private positions() {
    const { side } = this.placement;
    return [
      toPosition(this.placement, side),
      toPosition(this.placement, side === "bottom" ? "top" : "bottom"),
    ];
  }

  /** Sets the size and origin variables Radix gives popper content. */
  private measure(origin: HTMLElement) {
    if (!this.panel) {
      return;
    }
    const rect = origin.getBoundingClientRect();
    const { align, sideOffset } = this.placement;
    const side = this.side();
    const availableWidth: Record<Align, number> = {
      center: window.innerWidth,
      end: rect.right,
      start: window.innerWidth - rect.left,
    };
    const availableHeight =
      side === "bottom"
        ? window.innerHeight - rect.bottom - sideOffset
        : rect.top - sideOffset;
    const vars = {
      "available-height": `${availableHeight}px`,
      "available-width": `${availableWidth[align]}px`,
      "transform-origin": `${ORIGIN_X[align]} ${side === "bottom" ? "0%" : "100%"}`,
    };
    const { style } = this.panel;
    for (const [name, value] of Object.entries(vars)) {
      style.setProperty(`--radix-popper-${name}`, value);
      style.setProperty(`--radix-${this.slot}-${name}`, value);
    }
    style.setProperty("--radix-popper-anchor-width", `${rect.width}px`);
    style.setProperty("--radix-popper-anchor-height", `${rect.height}px`);
  }
}

/** Registers the host as its root's panel and places it with the content's inputs. */
export const connectContent = (
  root: ConnectedOverlayRoot,
  placement: () => Placement
) => {
  const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  root.panel = el;
  effect(() => root.place(placement()));
  inject(DestroyRef).onDestroy(() => {
    if (root.panel === el) {
      root.panel = undefined;
    }
  });
};

/** Opens its root on click and mirrors its state. Subclasses inject their root. */
@Directive({
  host: {
    "(click)": "onClick($event)",
    "[attr.aria-expanded]": "root.open()",
    "[attr.data-state]": "root.open() ? 'open' : 'closed'",
  },
})
export abstract class OverlayTrigger implements OnInit {
  protected abstract readonly root: OverlayRoot;
  protected readonly el =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  ngOnInit() {
    this.root.trigger = this.el;
  }

  protected onClick(event: MouseEvent) {
    this.root.openedByKeyboard = event.detail === 0;
    this.root.toggle();
  }
}
