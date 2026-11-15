/**
 * <ui-card class="gap-0 py-0">
 *   <ui-card-header>
 *     <ui-card-title>Documents</ui-card-title>
 *     <ui-card-description>...</ui-card-description>
 *     <ui-card-action>...</ui-card-action>
 *   </ui-card-header>
 *   <ui-card-content>...</ui-card-content>
 *   <ui-card-footer>...</ui-card-footer>
 * </ui-card>
 *
 * Parts whose classes set no display add `block`, so the custom elements lay out like divs.
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

import { cn } from "@/lib/utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "data-slot": "card" },
  selector: "ui-card",
  template: "<ng-content />",
})
export class UiCard {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
      this.class()
    )
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "data-slot": "card-header" },
  selector: "ui-card-header",
  template: "<ng-content />",
})
export class UiCardHeader {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
      this.class()
    )
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "data-slot": "card-title" },
  selector: "ui-card-title",
  template: "<ng-content />",
})
export class UiCardTitle {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("block leading-none font-semibold", this.class())
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "data-slot": "card-description" },
  selector: "ui-card-description",
  template: "<ng-content />",
})
export class UiCardDescription {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("block text-sm text-muted-foreground", this.class())
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "data-slot": "card-action" },
  selector: "ui-card-action",
  template: "<ng-content />",
})
export class UiCardAction {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "block col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      this.class()
    )
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "data-slot": "card-content" },
  selector: "ui-card-content",
  template: "<ng-content />",
})
export class UiCardContent {
  readonly class = input("");
  protected readonly classes = computed(() => cn("block px-6", this.class()));
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()", "data-slot": "card-footer" },
  selector: "ui-card-footer",
  template: "<ng-content />",
})
export class UiCardFooter {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("flex items-center px-6 [.border-t]:pt-6", this.class())
  );
}
