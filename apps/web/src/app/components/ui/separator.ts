import { Component, computed, input } from "@angular/core";

import { cn } from "@/lib/utils";

@Component({
  host: {
    "[attr.data-orientation]": "orientation()",
    "[class]": "classes()",
    "data-slot": "separator",
    role: "none",
  },
  selector: "ui-separator",
  template: "",
})
export class UiSeparator {
  readonly orientation = input<"horizontal" | "vertical">("horizontal");
  readonly class = input<string>("");

  protected readonly classes = computed(() =>
    cn(
      "bg-border block shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
      this.class()
    )
  );
}
