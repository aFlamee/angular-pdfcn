/**
 * <ui-tabs value="colors" class="gap-4">              <!-- uncontrolled, starts on "colors" -->
 * <ui-tabs [(value)]="tab">                            <!-- or controlled -->
 *   <ui-tabs-list class="grid w-full grid-cols-3">
 *     <button uiTabsTrigger value="colors" sound="tabSwitch">Colors</button>
 *   </ui-tabs-list>
 *   <ui-tabs-content value="colors">...</ui-tabs-content>
 * </ui-tabs>
 *
 * Arrow keys, Home and End move between triggers and select them. Inactive content stays
 * rendered with `hidden`.
 */
import { FocusKeyManager, _IdGenerator } from "@angular/cdk/a11y";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from "@angular/core";

import { cn } from "@/lib/utils";
import { FeedbackService } from "@/src/app/services/feedback";
import type { FeedbackType } from "@/src/app/services/feedback";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
    "data-orientation": "horizontal",
    "data-slot": "tabs",
  },
  selector: "ui-tabs",
  template: "<ng-content />",
})
export class UiTabs {
  readonly value = model<string>();
  readonly class = input("");

  readonly id = inject(_IdGenerator).getId("ui-tabs-");
  protected readonly classes = computed(() =>
    cn("flex flex-col gap-2", this.class())
  );
}

@Directive({
  host: {
    "(click)": "onClick()",
    "[attr.aria-controls]": "panelId()",
    "[attr.aria-selected]": "active()",
    "[attr.data-state]": "active() ? 'active' : 'inactive'",
    "[attr.tabindex]": "active() ? 0 : -1",
    "[class]": "classes()",
    "[id]": "triggerId()",
    "data-orientation": "horizontal",
    "data-slot": "tabs-trigger",
    role: "tab",
    type: "button",
  },
  selector: "button[uiTabsTrigger]",
})
export class UiTabsTrigger {
  readonly value = input.required<string>();
  readonly sound = input<FeedbackType>();
  readonly haptic = input(true);
  readonly class = input("");

  readonly el = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  protected readonly tabs = inject(UiTabs);
  private readonly feedback = inject(FeedbackService);

  protected readonly active = computed(
    () => this.tabs.value() === this.value()
  );
  protected readonly triggerId = computed(
    () => `${this.tabs.id}-trigger-${this.value()}`
  );
  protected readonly panelId = computed(
    () => `${this.tabs.id}-content-${this.value()}`
  );
  protected readonly classes = computed(() =>
    cn(
      "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      this.class()
    )
  );

  focus() {
    this.el.focus();
  }

  getLabel() {
    return this.el.textContent?.trim() ?? "";
  }

  select() {
    this.tabs.value.set(this.value());
  }

  protected onClick() {
    this.feedback.play(this.sound(), this.haptic());
    this.select();
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(keydown)": "onKeydown($event)",
    "[class]": "classes()",
    "aria-orientation": "horizontal",
    "data-orientation": "horizontal",
    "data-slot": "tabs-list",
    role: "tablist",
  },
  selector: "ui-tabs-list",
  template: "<ng-content />",
})
export class UiTabsList {
  readonly class = input("");

  protected readonly classes = computed(() =>
    cn(
      "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
      this.class()
    )
  );

  private readonly triggers = contentChildren(UiTabsTrigger, {
    descendants: true,
  });
  private readonly keys = new FocusKeyManager(this.triggers, inject(Injector))
    .withHorizontalOrientation("ltr")
    .withWrap()
    .withHomeAndEnd()
    .skipPredicate((trigger) => trigger.el.disabled);

  protected onKeydown(event: KeyboardEvent) {
    const focused = this.triggers().find(
      (trigger) => trigger.el === document.activeElement
    );
    if (!focused) {
      return;
    }
    this.keys.updateActiveItem(focused);
    this.keys.onKeydown(event);
    if (this.keys.activeItem !== focused) {
      this.keys.activeItem?.select();
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.aria-labelledby]": "tabs.id + '-trigger-' + value()",
    "[attr.data-state]": "active() ? 'active' : 'inactive'",
    "[attr.hidden]": "active() ? null : ''",
    "[class]": "classes()",
    "[id]": "tabs.id + '-content-' + value()",
    "data-orientation": "horizontal",
    "data-slot": "tabs-content",
    role: "tabpanel",
    tabindex: "0",
  },
  selector: "ui-tabs-content",
  template: "<ng-content />",
})
export class UiTabsContent {
  readonly value = input.required<string>();
  readonly class = input("");

  protected readonly tabs = inject(UiTabs);
  protected readonly active = computed(
    () => this.tabs.value() === this.value()
  );
  // `block` makes the custom element behave like the reference's div.
  protected readonly classes = computed(() =>
    cn("block flex-1 outline-none", this.class())
  );
}
