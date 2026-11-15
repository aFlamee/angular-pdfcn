/**
 * vaul's bottom drawer as a dialog that slides up. No drag to dismiss.
 *
 * <ng-container uiDrawer [(open)]="open">
 *   <button uiButton uiDrawerTrigger>Open</button>
 *   <ui-drawer-content *uiPortal>
 *     <div uiDrawerHeader>
 *       <h2 uiDrawerTitle>Settings</h2>
 *       <p uiDrawerDescription>Manage site preferences</p>
 *     </div>
 *     <div class="px-4">...</div>
 *     <div uiDrawerFooter><button uiButton size="sm" uiDrawerClose>Done</button></div>
 *   </ui-drawer-content>
 * </ng-container>
 *
 * Import `UiPortal` from `ui/overlay` with the parts.
 */
import { _IdGenerator } from "@angular/cdk/a11y";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  computed,
  forwardRef,
  inject,
  input,
} from "@angular/core";

import { cn } from "@/lib/utils";
import {
  ModalOverlayRoot,
  OverlayRoot,
  OverlayTrigger,
  trapFocus,
} from "@/src/app/components/ui/overlay";

@Directive({
  exportAs: "uiDrawer",
  providers: [
    { provide: OverlayRoot, useExisting: forwardRef(() => UiDrawer) },
  ],
  selector: "[uiDrawer]",
})
export class UiDrawer extends ModalOverlayRoot {
  protected readonly soundKind = "drawer";
  protected readonly backdrop = {
    classes:
      "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
    slot: "drawer-overlay",
  };
}

@Directive({
  host: { "aria-haspopup": "dialog" },
  selector: "[uiDrawerTrigger]",
})
export class UiDrawerTrigger extends OverlayTrigger {
  protected readonly root = inject(UiDrawer);
}

@Directive({
  host: { "(click)": "root.open.set(false)" },
  selector: "[uiDrawerClose]",
})
export class UiDrawerClose {
  protected readonly root = inject(UiDrawer);
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(keydown.escape)": "root.open.set(false)",
    "[attr.aria-describedby]": "root.descriptionId()",
    "[attr.aria-labelledby]": "root.titleId()",
    "[attr.data-state]": "root.state()",
    "[class]": "classes()",
    "data-slot": "drawer-content",
    "data-vaul-drawer-direction": "bottom",
    role: "dialog",
    tabindex: "-1",
  },
  selector: "ui-drawer-content",
  template: `
    <div
      class="mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
    ></div>
    <ng-content />
  `,
})
export class UiDrawerContent {
  readonly class = input("");

  protected readonly root = inject(UiDrawer);
  protected readonly classes = computed(() =>
    cn(
      "group/drawer-content fixed z-50 flex h-auto flex-col bg-background",
      "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
      // vaul animates with its own styles. These replace them.
      "duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
      this.class()
    )
  );

  constructor() {
    trapFocus();
  }
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "drawer-header" },
  selector: "[uiDrawerHeader]",
})
export class UiDrawerHeader {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
      this.class()
    )
  );
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "drawer-footer" },
  selector: "[uiDrawerFooter]",
})
export class UiDrawerFooter {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("mt-auto flex flex-col gap-2 p-4", this.class())
  );
}

@Directive({
  host: { "[class]": "classes()", "[id]": "id", "data-slot": "drawer-title" },
  selector: "[uiDrawerTitle]",
})
export class UiDrawerTitle {
  readonly class = input("");
  protected readonly id = inject(_IdGenerator).getId("ui-drawer-title-");
  protected readonly classes = computed(() =>
    cn("font-semibold text-foreground", this.class())
  );

  constructor() {
    const root = inject(UiDrawer);
    root.titleId.set(this.id);
    inject(DestroyRef).onDestroy(() => root.titleId.set(null));
  }
}

@Directive({
  host: {
    "[class]": "classes()",
    "[id]": "id",
    "data-slot": "drawer-description",
  },
  selector: "[uiDrawerDescription]",
})
export class UiDrawerDescription {
  readonly class = input("");
  protected readonly id = inject(_IdGenerator).getId("ui-drawer-description-");
  protected readonly classes = computed(() =>
    cn("text-sm text-muted-foreground", this.class())
  );

  constructor() {
    const root = inject(UiDrawer);
    root.descriptionId.set(this.id);
    inject(DestroyRef).onDestroy(() => root.descriptionId.set(null));
  }
}
