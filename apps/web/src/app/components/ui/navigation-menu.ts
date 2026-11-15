/**
 * Radix's NavigationMenu with `viewport={false}` and no open delay: content renders in its item.
 *
 * <nav uiNavigationMenu [(value)]="value">
 *   <ul uiNavigationMenuList>
 *     <li uiNavigationMenuItem value="labs">
 *       <button uiNavigationMenuTrigger>Labs</button>
 *       @if (value() === "labs") {
 *         <div uiNavigationMenuContent>
 *           <a uiNavigationMenuLink href="...">Link</a>
 *         </div>
 *       }
 *     </li>
 *   </ul>
 * </nav>
 *
 * Hovering a trigger with a mouse opens its item. Leaving the trigger and content closes it.
 * Clicking the trigger toggles it, Escape and clicking a link close it.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  computed,
  inject,
  input,
  model,
} from "@angular/core";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide";

import { cn } from "@/lib/utils";
import { UiIcon } from "@/src/app/components/ui/icon";

export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
);

/** Radix's close delay after the pointer leaves. */
const CLOSE_DELAY = 150;

@Directive({
  host: {
    "(keydown.escape)": "escape()",
    "[class]": "classes()",
    "data-slot": "navigation-menu",
    "data-viewport": "false",
  },
  selector: "nav[uiNavigationMenu]",
})
export class UiNavigationMenu {
  /** The open item's value, or empty. */
  readonly value = model("");
  readonly class = input("");

  /** The open item's trigger, which gets focus back on Escape. */
  trigger?: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly classes = computed(() =>
    cn(
      "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
      this.class()
    )
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  show(value: string) {
    clearTimeout(this.timer);
    this.value.set(value);
  }

  scheduleClose() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.value.set(""), CLOSE_DELAY);
  }

  cancelClose() {
    clearTimeout(this.timer);
  }

  protected escape() {
    if (this.value()) {
      this.value.set("");
      this.trigger?.focus();
    }
  }
}

@Directive({
  host: {
    "[class]": "classes()",
    "data-slot": "navigation-menu-list",
  },
  selector: "ul[uiNavigationMenuList]",
})
export class UiNavigationMenuList {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "group flex flex-1 list-none items-center justify-center gap-1",
      this.class()
    )
  );
}

@Directive({
  host: { class: "relative", "data-slot": "navigation-menu-item" },
  selector: "li[uiNavigationMenuItem]",
})
export class UiNavigationMenuItem {
  readonly value = input.required<string>();
}

const isMouse = (event: PointerEvent) => event.pointerType === "mouse";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(click)": "toggle()",
    "(pointerenter)": "enter($event)",
    "(pointerleave)": "leave($event)",
    "[attr.aria-expanded]": "open()",
    "[attr.data-state]": "open() ? 'open' : 'closed'",
    "[class]": "classes()",
    "data-slot": "navigation-menu-trigger",
    type: "button",
  },
  imports: [UiIcon],
  selector: "button[uiNavigationMenuTrigger]",
  template: `<ng-content />
    <svg
      [uiIcon]="ChevronDown"
      class="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
      stroke-width="2.5"
    ></svg>`,
})
export class UiNavigationMenuTrigger {
  readonly class = input("");

  protected readonly ChevronDown = ChevronDown;
  private readonly menu = inject(UiNavigationMenu);
  private readonly item = inject(UiNavigationMenuItem);
  private readonly el =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly open = computed(
    () => this.menu.value() === this.item.value()
  );
  protected readonly classes = computed(() =>
    cn(navigationMenuTriggerStyle(), "group", this.class())
  );

  protected toggle() {
    this.menu.trigger = this.el;
    this.menu.cancelClose();
    this.menu.value.set(this.open() ? "" : this.item.value());
  }

  protected enter(event: PointerEvent) {
    if (isMouse(event)) {
      this.menu.trigger = this.el;
      this.menu.show(this.item.value());
    }
  }

  protected leave(event: PointerEvent) {
    if (isMouse(event)) {
      this.menu.scheduleClose();
    }
  }
}

@Directive({
  host: {
    "(pointerenter)": "enter($event)",
    "(pointerleave)": "leave($event)",
    "[class]": "classes()",
    "data-slot": "navigation-menu-content",
    "data-state": "open",
  },
  selector: "[uiNavigationMenuContent]",
})
export class UiNavigationMenuContent {
  readonly class = input("");

  private readonly menu = inject(UiNavigationMenu);
  protected readonly classes = computed(() =>
    cn(
      "top-0 left-0 w-full p-2 pr-2.5 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out md:absolute md:w-auto",
      "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-none group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-none **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
      this.class()
    )
  );

  protected enter(event: PointerEvent) {
    if (isMouse(event)) {
      this.menu.cancelClose();
    }
  }

  protected leave(event: PointerEvent) {
    if (isMouse(event)) {
      this.menu.scheduleClose();
    }
  }
}

@Directive({
  host: {
    "(click)": "menu.value.set('')",
    "[class]": "classes()",
    "data-slot": "navigation-menu-link",
  },
  selector: "a[uiNavigationMenuLink]",
})
export class UiNavigationMenuLink {
  readonly class = input("");

  protected readonly menu = inject(UiNavigationMenu);
  protected readonly classes = computed(() =>
    cn(
      "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent [&_svg:not([class*='size-'])]:size-4",
      this.class()
    )
  );
}
