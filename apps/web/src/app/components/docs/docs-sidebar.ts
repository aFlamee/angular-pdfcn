import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { TOP_LEVEL_SECTIONS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import type { DocsTree } from "@/lib/content/types";
import { PAGES_NEW } from "@/lib/docs";
import { getCurrentBase, getTreeGroups } from "@/lib/page-tree";
import { injectPathname, isFileUrl } from "@/src/app/components/app-routes";
import {
  UiSidebar,
  UiSidebarContent,
  UiSidebarGroup,
  UiSidebarGroupContent,
  UiSidebarGroupLabel,
  UiSidebarMenu,
  UiSidebarMenuButton,
  UiSidebarMenuItem,
} from "@/src/app/components/ui/sidebar";

const MENU_BUTTON_CLS =
  "relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    NgTemplateOutlet,
    RouterLink,
    UiSidebar,
    UiSidebarContent,
    UiSidebarGroup,
    UiSidebarGroupContent,
    UiSidebarGroupLabel,
    UiSidebarMenu,
    UiSidebarMenuButton,
    UiSidebarMenuItem,
  ],
  selector: "docs-sidebar",
  template: `
    <ng-template #label let-link>
      <span
        class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"
      ></span>
      {{ link.name }}
      @if (PAGES_NEW.includes(link.href)) {
        <span class="flex size-2 rounded-full bg-blue-500" title="New"></span>
      }
    </ng-template>
    <div
      uiSidebar
      class="text-sidebar-foreground sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] flex-col overscroll-none bg-transparent [--sidebar-menu-width:--spacing(48)] lg:flex"
    >
      <div class="h-9"></div>
      <div
        class="absolute top-8 z-10 h-8 w-(--sidebar-menu-width) shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs"
      ></div>
      <div
        class="absolute top-12 right-2 bottom-0 hidden h-full w-px bg-linear-to-b from-transparent via-border to-transparent lg:flex"
      ></div>
      <div
        uiSidebarContent
        class="mx-auto no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2"
      >
        @for (group of groups(); track group.label) {
          <div uiSidebarGroup [class]="$first ? 'pt-6' : ''">
            <div uiSidebarGroupLabel class="text-muted-foreground font-medium">
              {{ group.label }}
            </div>
            <div uiSidebarGroupContent>
              <ul uiSidebarMenu>
                @for (link of group.links; track link.href) {
                  <li uiSidebarMenuItem>
                    @if (!isFileUrl(link.href)) {
                      <a
                        uiSidebarMenuButton
                        [class]="MENU_BUTTON_CLS"
                        [isActive]="link.active"
                        [routerLink]="link.href"
                      >
                        <ng-container
                          *ngTemplateOutlet="
                            label;
                            context: { $implicit: link }
                          "
                        />
                      </a>
                    } @else {
                      <a
                        uiSidebarMenuButton
                        [class]="MENU_BUTTON_CLS"
                        [isActive]="link.active"
                        [href]="link.href"
                      >
                        <ng-container
                          *ngTemplateOutlet="
                            label;
                            context: { $implicit: link }
                          "
                        />
                      </a>
                    }
                  </li>
                }
              </ul>
            </div>
          </div>
        }
        <div
          class="from-background via-background/80 to-background/50 sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t blur-xs"
        ></div>
      </div>
    </div>
  `,
})
export class DocsSidebar {
  readonly tree = input.required<DocsTree>();

  protected readonly isFileUrl = isFileUrl;
  protected readonly MENU_BUTTON_CLS = MENU_BUTTON_CLS;
  protected readonly PAGES_NEW = PAGES_NEW;
  private readonly pathname = injectPathname();
  /** The Sections group, then the page tree's groups for the current base. */
  protected readonly groups = computed(() => {
    const pathname = this.pathname();
    const sections = TOP_LEVEL_SECTIONS.map(({ href, name }) => ({
      active:
        href === ROUTES.DOCS ? pathname === href : pathname.startsWith(href),
      href,
      name,
    }));
    const pages = getTreeGroups(this.tree(), getCurrentBase(pathname)).map(
      (group) => ({
        label: group.label,
        links: group.pages.map((page) => ({
          active: page.url === pathname,
          href: page.url,
          name: page.name,
        })),
      })
    );
    return [{ label: "Sections", links: sections }, ...pages];
  });
}
