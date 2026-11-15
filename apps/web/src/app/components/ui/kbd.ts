/**
 * <kbd uiKbd>⌘</kbd>
 * <kbd uiKbdGroup><kbd uiKbd>Ctrl</kbd><kbd uiKbd>K</kbd></kbd>
 */
import { Directive, computed, input } from "@angular/core";

import { cn } from "@/lib/utils";

@Directive({
  host: { "[class]": "classes()", "data-slot": "kbd" },
  selector: "kbd[uiKbd]",
})
export class UiKbd {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs/none font-normal text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3",
      "bg-black/5 shadow-[inset_0_-1px_2px] shadow-black/10 dark:bg-white/10 dark:shadow-white/10",
      "in-data-[slot=tooltip-content]:bg-white/20 in-data-[slot=tooltip-content]:text-background in-data-[slot=tooltip-content]:shadow-white/20 dark:in-data-[slot=tooltip-content]:bg-black/10 dark:in-data-[slot=tooltip-content]:shadow-black/10",
      this.class()
    )
  );
}

@Directive({
  host: { "[class]": "classes()", "data-slot": "kbd-group" },
  selector: "kbd[uiKbdGroup]",
})
export class UiKbdGroup {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("inline-flex items-center gap-1", this.class())
  );
}
