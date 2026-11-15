/**
 * <div uiEmpty class="w-full max-w-md gap-6 p-0">
 *   <div uiEmptyHeader>
 *     <div uiEmptyMedia variant="icon">...</div>
 *     <div uiEmptyTitle>Nothing here</div>
 *     <div uiEmptyDescription>...</div>
 *   </div>
 *   <div uiEmptyContent>...</div>
 * </div>
 */
import { Directive, computed, input } from "@angular/core";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

@Directive({
  host: { "[class]": "classes()", "data-slot": "empty" },
  selector: "[uiEmpty]",
})
export class UiEmpty {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
      this.class()
    )
  );
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "empty-header" },
  selector: "[uiEmptyHeader]",
})
export class UiEmptyHeader {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("flex max-w-sm flex-col items-center gap-2 text-center", this.class())
  );
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
      },
    },
  }
);

@Directive({
  host: {
    "[attr.data-variant]": "variant()",
    "[class]": "classes()",
    "data-slot": "empty-icon",
  },
  selector: "[uiEmptyMedia]",
})
export class UiEmptyMedia {
  readonly variant =
    input<VariantProps<typeof emptyMediaVariants>["variant"]>("default");
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(emptyMediaVariants({ className: this.class(), variant: this.variant() }))
  );
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "empty-title" },
  selector: "[uiEmptyTitle]",
})
export class UiEmptyTitle {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("text-lg font-medium tracking-tight", this.class())
  );
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "empty-description" },
  selector: "[uiEmptyDescription]",
})
export class UiEmptyDescription {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
      this.class()
    )
  );
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "empty-content" },
  selector: "[uiEmptyContent]",
})
export class UiEmptyContent {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
      this.class()
    )
  );
}
