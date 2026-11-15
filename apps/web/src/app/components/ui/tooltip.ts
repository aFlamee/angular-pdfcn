import { Overlay } from "@angular/cdk/overlay";
import type { ConnectedPosition, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import type { OnDestroy } from "@angular/core";

export type TooltipSide = "top" | "bottom" | "left" | "right";

const POSITIONS: Record<TooltipSide, ConnectedPosition> = {
  bottom: {
    offsetY: 4,
    originX: "center",
    originY: "bottom",
    overlayX: "center",
    overlayY: "top",
  },
  left: {
    offsetX: -4,
    originX: "start",
    originY: "center",
    overlayX: "end",
    overlayY: "center",
  },
  right: {
    offsetX: 4,
    originX: "end",
    originY: "center",
    overlayX: "start",
    overlayY: "center",
  },
  top: {
    offsetY: -4,
    originX: "center",
    originY: "top",
    overlayX: "center",
    overlayY: "bottom",
  },
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.data-side]": "side()",
    class:
      "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
    "data-slot": "tooltip-content",
    role: "tooltip",
  },
  selector: "ui-tooltip-content",
  template: "{{ text() }}",
})
export class UiTooltipContent {
  readonly text = signal("");
  readonly side = signal<TooltipSide>("top");
}

/** Shows `uiTooltip` text next to the host on hover and focus. */
@Directive({
  host: {
    "(blur)": "hide()",
    "(focus)": "show()",
    "(mouseenter)": "show()",
    "(mouseleave)": "hide()",
  },
  selector: "[uiTooltip]",
})
export class UiTooltip implements OnDestroy {
  readonly uiTooltip = input.required<string>();
  readonly tooltipSide = input<TooltipSide>("top");

  private readonly overlay = inject(Overlay);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private overlayRef?: OverlayRef;
  private content?: UiTooltipContent;

  constructor() {
    effect(() => this.content?.text.set(this.uiTooltip()));
  }

  show() {
    if (this.overlayRef?.hasAttached() || !this.uiTooltip()) {
      return;
    }
    this.overlayRef ??= this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions([POSITIONS[this.tooltipSide()], POSITIONS.bottom]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    const ref = this.overlayRef.attach(new ComponentPortal(UiTooltipContent));
    this.content = ref.instance;
    this.content.text.set(this.uiTooltip());
    this.content.side.set(this.tooltipSide());
  }

  hide() {
    this.overlayRef?.detach();
    this.content = undefined;
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }
}
