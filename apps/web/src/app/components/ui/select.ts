/**
 * <ng-container uiSelect [(value)]="theme">
 *   <button uiSelectTrigger size="sm" class="w-35" aria-label="Theme">
 *     <ui-select-value placeholder="Theme" />
 *   </button>
 *   <ui-select-content align="end">
 *     @for (t of themes; track t.value) {
 *       <ui-select-item [value]="t.value">{{ t.label }}</ui-select-item>
 *     }
 *   </ui-select-content>
 * </ng-container>
 *
 * No `*uiPortal` here: the items always exist, so `ui-select-value` shows the selected
 * item's text on the server too. Use `[value]` with `(valueChange)` or leave it uncontrolled.
 */
import { FocusKeyManager } from "@angular/cdk/a11y";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  ViewContainerRef,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  viewChild,
} from "@angular/core";
import type { TemplateRef } from "@angular/core";
import { Check, ChevronDown } from "lucide";

import { cn } from "@/lib/utils";
import { UiIcon } from "@/src/app/components/ui/icon";
import {
  ConnectedOverlayRoot,
  OverlayRoot,
  OverlayTrigger,
} from "@/src/app/components/ui/overlay";
import type { Align, Side } from "@/src/app/components/ui/overlay";

@Directive({
  exportAs: "uiSelect",
  providers: [
    { provide: OverlayRoot, useExisting: forwardRef(() => UiSelect) },
  ],
  selector: "[uiSelect]",
})
export class UiSelect extends ConnectedOverlayRoot {
  protected readonly soundKind = "dropdown";
  readonly value = model<string>();

  // oxlint-disable-next-line no-use-before-define -- Items and their root reference each other.
  readonly items = contentChildren(UiSelectItem, {
    descendants: true,
  });

  protected readonly slot = "select-content";

  /** The selected item's text, read from the DOM like Radix's `SelectValue`. */
  label() {
    const value = this.value();
    return this.items()
      .find((item) => item.value() === value)
      ?.text();
  }

  choose(value: string) {
    this.value.set(value);
    this.open.set(false);
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(keydown.arrowdown)": "openWithKeyboard($event)",
    "(keydown.arrowup)": "openWithKeyboard($event)",
    "[attr.data-placeholder]": "root.value() === undefined ? '' : null",
    "[attr.data-size]": "size()",
    "[class]": "classes()",
    "aria-autocomplete": "none",
    "data-slot": "select-trigger",
    role: "combobox",
    type: "button",
  },
  imports: [UiIcon],
  selector: "button[uiSelectTrigger]",
  template: `
    <ng-content />
    <svg [uiIcon]="ChevronDown" class="size-4 opacity-50"></svg>
  `,
})
export class UiSelectTrigger extends OverlayTrigger {
  readonly size = input<"sm" | "default">("default");
  readonly class = input("");

  protected readonly root = inject(UiSelect);
  protected readonly ChevronDown = ChevronDown;
  protected readonly classes = computed(() =>
    cn(
      "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
      this.class()
    )
  );

  protected openWithKeyboard(event: Event) {
    event.preventDefault();
    this.root.openedByKeyboard = true;
    this.root.open.set(true);
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "select-value", style: "pointer-events: none" },
  selector: "ui-select-value",
  template: "{{ root.label() ?? placeholder() }}",
})
export class UiSelectValue {
  readonly placeholder = input("");
  protected readonly root = inject(UiSelect);
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { hidden: "" },
  selector: "ui-select-content",
  template: `
    <ng-template #portal>
      <div
        #panel
        data-slot="select-content"
        role="listbox"
        style="min-width: var(--radix-popper-anchor-width)"
        tabindex="-1"
        [attr.data-side]="root.side()"
        [attr.data-state]="root.state()"
        [class]="classes()"
        (keydown)="onKeydown($event)"
      >
        <div class="p-1" role="presentation">
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UiSelectContent {
  readonly side = input<Side>("bottom");
  readonly align = input<Align>("center");
  readonly sideOffset = input(4);
  readonly class = input("");

  protected readonly root = inject(UiSelect);
  protected readonly classes = computed(() =>
    cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      this.class()
    )
  );

  private readonly keys = new FocusKeyManager(this.root.items, inject(Injector))
    .withHomeAndEnd()
    .withTypeAhead();
  private readonly portal = viewChild.required<TemplateRef<unknown>>("portal");
  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");

  constructor() {
    const vcr = inject(ViewContainerRef);
    const injector = inject(Injector);
    effect(() => this.root.content.set(new TemplatePortal(this.portal(), vcr)));
    effect(() => {
      const panel = this.panel()?.nativeElement;
      this.root.panel = panel;
      if (panel) {
        afterNextRender(() => this.focusSelected(), { injector });
      }
    });
    effect(() =>
      this.root.place({
        align: this.align(),
        alignOffset: 0,
        side: this.side(),
        sideOffset: this.sideOffset(),
      })
    );
  }

  protected onKeydown(event: KeyboardEvent) {
    // Hover moves focus without telling the key manager.
    const focused = this.root
      .items()
      .find((item) => item.el === document.activeElement);
    if (focused) {
      this.keys.updateActiveItem(focused);
    }
    if (event.key === "Tab") {
      event.preventDefault();
    } else if ((event.key === "Enter" || event.key === " ") && focused) {
      event.preventDefault();
      this.root.choose(focused.value());
    } else {
      this.keys.onKeydown(event);
    }
  }

  private focusSelected() {
    const value = this.root.value();
    const selected = this.root.items().find((item) => item.value() === value);
    if (selected) {
      this.keys.setActiveItem(selected);
    } else {
      this.keys.setFirstItemActive();
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(click)": "root.choose(value())",
    "(pointermove)": "focus()",
    "[attr.aria-selected]": "selected()",
    "[attr.data-state]": "selected() ? 'checked' : 'unchecked'",
    "[class]": "classes()",
    "data-slot": "select-item",
    role: "option",
    tabindex: "-1",
  },
  imports: [UiIcon],
  selector: "ui-select-item",
  template: `
    <span
      data-slot="select-item-indicator"
      class="absolute right-2 flex size-3.5 items-center justify-center"
    >
      @if (selected()) {
        <svg [uiIcon]="Check" class="size-4"></svg>
      }
    </span>
    <span #text><ng-content /></span>
  `,
})
export class UiSelectItem {
  readonly value = input.required<string>();
  readonly class = input("");

  readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly root = inject(UiSelect);
  protected readonly Check = Check;
  protected readonly selected = computed(
    () => this.root.value() === this.value()
  );
  protected readonly classes = computed(() =>
    cn(
      "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
      this.class()
    )
  );

  private readonly textEl = viewChild.required<ElementRef<HTMLElement>>("text");

  text() {
    return this.textEl().nativeElement.textContent?.trim() ?? "";
  }

  focus() {
    this.el.focus({ preventScroll: true });
  }

  getLabel() {
    return this.text();
  }
}
