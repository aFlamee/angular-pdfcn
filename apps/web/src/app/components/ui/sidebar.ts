/**
 * shadcn's Sidebar with `collapsible="none"`, the only mode the site uses.
 *
 * <div uiSidebar class="...">
 *   <div uiSidebarContent>
 *     <div uiSidebarGroup>
 *       <div uiSidebarGroupLabel>Sections</div>
 *       <div uiSidebarGroupContent>
 *         <ul uiSidebarMenu>
 *           <li uiSidebarMenuItem>
 *             <a uiSidebarMenuButton [isActive]="true" routerLink="/docs">Introduction</a>
 *           </li>
 *         </ul>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 */
import { Directive, computed, inject, input } from "@angular/core";

import { cn } from "@/lib/utils";
import { FeedbackService } from "@/src/app/services/feedback";
import type { FeedbackType } from "@/src/app/services/feedback";

@Directive({
  host: { "[class]": "classes()", "data-slot": "sidebar" },
  selector: "[uiSidebar]",
})
export class UiSidebar {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
      this.class()
    )
  );
}

@Directive({
  host: {
    "[class]": "classes()",
    "data-sidebar": "content",
    "data-slot": "sidebar-content",
  },
  selector: "[uiSidebarContent]",
})
export class UiSidebarContent {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
      this.class()
    )
  );
}

@Directive({
  host: {
    "[class]": "classes()",
    "data-sidebar": "group",
    "data-slot": "sidebar-group",
  },
  selector: "[uiSidebarGroup]",
})
export class UiSidebarGroup {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn("relative flex w-full min-w-0 flex-col p-2", this.class())
  );
}

@Directive({
  host: {
    "[class]": "classes()",
    "data-sidebar": "group-label",
    "data-slot": "sidebar-group-label",
  },
  selector: "[uiSidebarGroupLabel]",
})
export class UiSidebarGroupLabel {
  readonly class = input("");
  protected readonly classes = computed(() =>
    cn(
      "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
      this.class()
    )
  );
}

@Directive({
  host: {
    class: "w-full text-sm",
    "data-sidebar": "group-content",
    "data-slot": "sidebar-group-content",
  },
  selector: "[uiSidebarGroupContent]",
})
export class UiSidebarGroupContent {}

@Directive({
  host: {
    class: "flex w-full min-w-0 flex-col gap-1",
    "data-sidebar": "menu",
    "data-slot": "sidebar-menu",
  },
  selector: "ul[uiSidebarMenu]",
})
export class UiSidebarMenu {}

@Directive({
  host: {
    class: "group/menu-item relative",
    "data-sidebar": "menu-item",
    "data-slot": "sidebar-menu-item",
  },
  selector: "li[uiSidebarMenuItem]",
})
export class UiSidebarMenuItem {}

/** The default variant and size of shadcn's `sidebarMenuButtonVariants`. */
@Directive({
  host: {
    "(click)": "feedback.play(sound(), haptic())",
    "[attr.data-active]": "isActive()",
    "[class]": "classes()",
    "data-sidebar": "menu-button",
    "data-size": "default",
    "data-slot": "sidebar-menu-button",
  },
  selector: "a[uiSidebarMenuButton], button[uiSidebarMenuButton]",
})
export class UiSidebarMenuButton {
  readonly isActive = input(false);
  readonly sound = input<FeedbackType>();
  readonly haptic = input(true);
  readonly class = input("");

  protected readonly feedback = inject(FeedbackService);
  protected readonly classes = computed(() =>
    cn(
      "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
      "h-8 text-sm",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      this.class()
    )
  );
}
