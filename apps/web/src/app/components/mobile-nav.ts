import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { TOP_LEVEL_SECTIONS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import type { DocsTree } from "@/lib/content/types";
import { getCurrentBase, getTreeGroups } from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { injectPathname, isFileUrl } from "@/src/app/components/app-routes";
import type { NavItem } from "@/src/app/components/main-nav";
import { UiButton } from "@/src/app/components/ui/button";
import { UiPortal } from "@/src/app/components/ui/overlay";
import {
  UiPopover,
  UiPopoverContent,
  UiPopoverTrigger,
} from "@/src/app/components/ui/popover";
import { FeedbackService } from "@/src/app/services/feedback";

/** The hamburger menu below lg: the nav items, the docs sections, and the page tree. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    UiButton,
    UiPopover,
    UiPopoverContent,
    UiPopoverTrigger,
    UiPortal,
  ],
  selector: "app-mobile-nav",
  template: `
    <ng-template #link let-href="href" let-name="name">
      @if (isFileUrl(href)) {
        <a [href]="href" class="text-2xl font-medium" (click)="close()">{{
          name
        }}</a>
      } @else {
        <a [routerLink]="href" class="text-2xl font-medium" (click)="close()">{{
          name
        }}</a>
      }
    </ng-template>
    <ng-container uiPopover sounds [(open)]="open">
      <button
        uiButton
        uiPopoverTrigger
        type="button"
        variant="ghost"
        class="extend-touch-target h-8 touch-manipulation items-center justify-start !p-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent"
      >
        <div class="relative flex h-8 w-4 items-center justify-center">
          <div class="relative size-4">
            <span
              [class]="
                cn(
                  'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                  open() ? 'top-[0.4rem] -rotate-45' : 'top-1'
                )
              "
            ></span>
            <span
              [class]="
                cn(
                  'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                  open() ? 'top-[0.4rem] rotate-45' : 'top-2.5'
                )
              "
            ></span>
          </div>
          <span class="sr-only">Toggle Menu</span>
        </div>
      </button>
      <ui-popover-content
        *uiPortal
        class="bg-background/90 no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto rounded-none border-none p-0 shadow-none backdrop-blur duration-100"
        align="start"
        side="bottom"
        [alignOffset]="-16"
        [sideOffset]="14"
      >
        <div class="flex flex-col gap-12 overflow-auto px-6 py-6">
          @for (group of groups(); track group.label) {
            <div class="flex flex-col gap-4">
              <div class="text-sm font-medium text-muted-foreground">
                {{ group.label }}
              </div>
              <div class="flex flex-col gap-3">
                @for (item of group.links; track item.href) {
                  <ng-container
                    *ngTemplateOutlet="
                      link;
                      context: { href: item.href, name: item.name }
                    "
                  />
                }
              </div>
            </div>
          }
        </div>
      </ui-popover-content>
    </ng-container>
  `,
})
export class MobileNav {
  readonly items = input.required<NavItem[]>();
  readonly tree = input.required<DocsTree>();

  protected readonly cn = cn;
  protected readonly isFileUrl = isFileUrl;
  protected readonly open = signal(false);
  private readonly feedback = inject(FeedbackService);
  private readonly pathname = injectPathname();
  /** Menu and Sections, then the page tree's groups for the current base. */
  protected readonly groups = computed(() => [
    {
      label: "Menu",
      links: [
        { href: ROUTES.HOME, name: "Home" },
        ...this.items().map(({ href, label }) => ({ href, name: label })),
      ],
    },
    { label: "Sections", links: TOP_LEVEL_SECTIONS },
    ...getTreeGroups(this.tree(), getCurrentBase(this.pathname())).map(
      (group) => ({
        label: group.label,
        links: group.pages.map(({ url, name }) => ({ href: url, name })),
      })
    ),
  ]);

  protected close() {
    this.feedback.play("click");
    this.open.set(false);
  }
}
