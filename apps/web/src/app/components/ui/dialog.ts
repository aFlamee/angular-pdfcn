/**
 * <ng-container uiDialog [(open)]="open" #dialog="uiDialog">
 *   <button uiButton uiDialogTrigger>Open</button>
 *   <ui-dialog-content *uiPortal class="sm:max-w-lg" [showCloseButton]="true">
 *     <div uiDialogHeader>
 *       <h2 uiDialogTitle>Title</h2>
 *       <p uiDialogDescription>Description</p>
 *     </div>
 *     <div uiDialogFooter><button uiButton uiDialogClose>Done</button></div>
 *   </ui-dialog-content>
 * </ng-container>
 *
 * Import `UiPortal` from `ui/overlay` with the parts. Leave out `[(open)]` for an uncontrolled dialog.
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
import { X } from "lucide";

import { cn } from "@/lib/utils";
import { UiIcon } from "@/src/app/components/ui/icon";
import {
  ModalOverlayRoot,
  OverlayRoot,
  OverlayTrigger,
  trapFocus,
} from "@/src/app/components/ui/overlay";

@Directive({
  exportAs: "uiDialog",
  providers: [
    { provide: OverlayRoot, useExisting: forwardRef(() => UiDialog) },
  ],
  selector: "[uiDialog]",
})
export class UiDialog extends ModalOverlayRoot {
  protected readonly soundKind = "modal";
  protected readonly backdrop = {
    classes:
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
    slot: "dialog-overlay",
  };
}

@Directive({
  host: { "aria-haspopup": "dialog" },
  selector: "[uiDialogTrigger]",
})
export class UiDialogTrigger extends OverlayTrigger {
  protected readonly root = inject(UiDialog);
}

@Directive({
  host: { "(click)": "root.open.set(false)" },
  selector: "[uiDialogClose]",
})
export class UiDialogClose {
  protected readonly root = inject(UiDialog);
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(keydown.escape)": "root.open.set(false)",
    "[attr.aria-describedby]": "root.descriptionId()",
    "[attr.aria-labelledby]": "root.titleId()",
    "[attr.data-state]": "root.state()",
    "[class]": "classes()",
    "data-slot": "dialog-content",
    role: "dialog",
    tabindex: "-1",
  },
  imports: [UiIcon],
  selector: "ui-dialog-content",
  template: `
    <ng-content />
    @if (showCloseButton()) {
      <button
        type="button"
        data-slot="dialog-close"
        class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        (click)="root.open.set(false)"
      >
        <svg [uiIcon]="X"></svg>
        <span class="sr-only">Close</span>
      </button>
    }
  `,
})
export class UiDialogContent {
  readonly showCloseButton = input(true);
  readonly class = input("");

  protected readonly root = inject(UiDialog);
  protected readonly X = X;
  protected readonly classes = computed(() =>
    cn(
      "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
      this.class()
    )
  );

  constructor() {
    trapFocus();
  }
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "dialog-header" },
  selector: "[uiDialogHeader]",
})
export class UiDialogHeader {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("flex flex-col gap-2 text-center sm:text-left", this.class())
  );
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "dialog-footer" },
  selector: "[uiDialogFooter]",
})
export class UiDialogFooter {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", this.class())
  );
}

@Directive({
  host: { "[class]": "classes()", "[id]": "id", "data-slot": "dialog-title" },
  selector: "[uiDialogTitle]",
})
export class UiDialogTitle {
  readonly class = input("");
  protected readonly id = inject(_IdGenerator).getId("ui-dialog-title-");
  protected readonly classes = computed(() =>
    cn("text-lg leading-none font-semibold", this.class())
  );

  constructor() {
    const root = inject(UiDialog);
    root.titleId.set(this.id);
    inject(DestroyRef).onDestroy(() => root.titleId.set(null));
  }
}

@Directive({
  host: {
    "[class]": "classes()",
    "[id]": "id",
    "data-slot": "dialog-description",
  },
  selector: "[uiDialogDescription]",
})
export class UiDialogDescription {
  readonly class = input("");
  protected readonly id = inject(_IdGenerator).getId("ui-dialog-description-");
  protected readonly classes = computed(() =>
    cn("text-muted-foreground text-sm", this.class())
  );

  constructor() {
    const root = inject(UiDialog);
    root.descriptionId.set(this.id);
    inject(DestroyRef).onDestroy(() => root.descriptionId.set(null));
  }
}
