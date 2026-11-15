import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ArrowUpRight, ChevronDown } from "lucide";

import { LABS_LATEST, LABS_NAV_SECTIONS, UTM_SOURCE } from "@/constants/nav";
import type { LabsNavLink } from "@/constants/nav";
import { SITE } from "@/constants/site";
import { addQueryParams } from "@/lib/url";
import { cn } from "@/lib/utils";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import {
  UiNavigationMenu,
  UiNavigationMenuContent,
  UiNavigationMenuItem,
  UiNavigationMenuLink,
  UiNavigationMenuList,
  UiNavigationMenuTrigger,
} from "@/src/app/components/ui/navigation-menu";
import { UiPortal } from "@/src/app/components/ui/overlay";
import {
  UiPopover,
  UiPopoverContent,
  UiPopoverTrigger,
} from "@/src/app/components/ui/popover";

type SectionId = (typeof LABS_NAV_SECTIONS)[number]["id"];

const SECTION_WIDTH: Partial<Record<SectionId, string>> = {
  registries: "w-72",
  skills: "w-72",
};

const SECTION_LIST: Partial<Record<SectionId, string>> = {
  registries: "columns-2 gap-x-6 space-y-1",
};

const latestCardClassName = cn(
  "flex flex-col gap-4 rounded-lg border border-border bg-background p-4",
  "text-base font-normal no-underline transition-colors",
  "hover:border-foreground/25 hover:bg-background focus:bg-background"
);

const withUtm = (item: LabsNavLink): LabsNavLink => ({
  ...item,
  href: addQueryParams(item.href, UTM_SOURCE),
});

/** The shadcn-labs projects: a full-width menu from lg up, a popover below. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    NgTemplateOutlet,
    UiButton,
    UiIcon,
    UiNavigationMenu,
    UiNavigationMenuContent,
    UiNavigationMenuItem,
    UiNavigationMenuLink,
    UiNavigationMenuList,
    UiNavigationMenuTrigger,
    UiPopover,
    UiPopoverContent,
    UiPopoverTrigger,
    UiPortal,
  ],
  selector: "app-labs-nav",
  template: `
    <ng-template
      #latestContent
      let-nameClass="nameClass"
      let-textClass="textClass"
    >
      <span
        [class]="
          cn(
            'flex items-center justify-center rounded-md bg-muted text-base font-medium',
            nameClass
          )
        "
        >{{ latest.name }}</span
      >
      <span
        [class]="
          cn(
            'inline-flex items-center gap-1 text-sm text-foreground',
            textClass
          )
        "
      >
        {{ latest.description }}
        <svg [uiIcon]="ArrowUpRight" class="inline-flex size-4 shrink-0"></svg>
      </span>
    </ng-template>

    <div class="lg:hidden">
      <ng-container uiPopover [(open)]="mobileOpen">
        <button
          uiButton
          uiPopoverTrigger
          type="button"
          variant="ghost"
          size="sm"
          class="gap-1 text-base hover:bg-transparent focus-visible:bg-transparent data-[state=open]:bg-transparent dark:hover:bg-transparent"
        >
          {{ SITE.NAME }}
          <svg
            [uiIcon]="ChevronDown"
            stroke-width="2.5"
            [class]="
              cn(
                'size-3 transition-transform duration-200',
                mobileOpen() && 'rotate-180'
              )
            "
          ></svg>
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
            <div class="flex flex-col gap-4">
              <div class="text-sm font-medium text-muted-foreground">
                Latest
              </div>
              <a
                target="_blank"
                rel="noopener noreferrer"
                [href]="latest.href"
                [class]="cn(latestCardClassName, 'w-full')"
                (click)="mobileOpen.set(false)"
              >
                <ng-container
                  *ngTemplateOutlet="
                    latestContent;
                    context: {
                      nameClass: 'min-h-16 text-2xl',
                      textClass: 'text-base',
                    }
                  "
                />
              </a>
            </div>
            @for (section of sections; track section.id) {
              <div class="flex flex-col gap-4">
                <div class="text-sm font-medium text-muted-foreground">
                  {{ section.title }}
                </div>
                <div class="flex flex-col gap-3">
                  @for (item of section.items; track item.href) {
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      [href]="item.href"
                      class="inline-flex items-center gap-1 text-2xl font-medium"
                      (click)="mobileOpen.set(false)"
                    >
                      {{ item.name }}
                      <svg
                        [uiIcon]="ArrowUpRight"
                        class="inline-flex size-6 shrink-0"
                      ></svg>
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        </ui-popover-content>
      </ng-container>
    </div>

    <div class="hidden lg:block">
      @if (value()) {
        <button
          type="button"
          aria-label="Close menu"
          class="fixed inset-x-0 top-(--header-height) bottom-0 z-20 cursor-default bg-background/60"
          (click)="value.set('')"
        ></button>
      }
      <nav
        uiNavigationMenu
        [(value)]="value"
        class="z-50 max-w-none justify-start"
      >
        <ul uiNavigationMenuList class="justify-start">
          <li uiNavigationMenuItem value="labs">
            <button
              uiNavigationMenuTrigger
              class="h-auto gap-1 bg-transparent px-3 py-1.5 text-base font-medium hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground data-[state=open]:bg-transparent data-[state=open]:text-foreground data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent"
            >
              {{ SITE.NAME }}
            </button>
            @if (value() === "labs") {
              <div
                uiNavigationMenuContent
                class="fixed inset-x-0 top-(--header-height) z-30 w-screen bg-background p-0 shadow-[0_1px_0_0_var(--border)] before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-[''] data-[motion^=from-]:animate-none data-[motion^=to-]:animate-none data-[state=closed]:hidden md:fixed md:w-screen dark:bg-black"
              >
                <div class="container-wrapper px-6">
                  <div class="flex gap-8 py-4 pl-3">
                    <div class="flex w-64 flex-col gap-3">
                      <div class="text-sm font-medium text-muted-foreground">
                        Latest
                      </div>
                      <a
                        uiNavigationMenuLink
                        [href]="latest.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        [class]="
                          cn(latestCardClassName, 'w-60 flex-1 gap-2 p-3')
                        "
                      >
                        <ng-container
                          *ngTemplateOutlet="
                            latestContent;
                            context: { nameClass: 'min-h-8 flex-1' }
                          "
                        />
                      </a>
                    </div>
                    @for (section of sections; track section.id) {
                      <div
                        [class]="
                          cn(
                            'flex flex-col gap-3 w-44',
                            SECTION_WIDTH[section.id]
                          )
                        "
                      >
                        <div class="text-sm font-medium text-muted-foreground">
                          {{ section.title }}
                        </div>
                        <ul
                          [class]="
                            cn('columns-1 gap-1', SECTION_LIST[section.id])
                          "
                        >
                          @for (item of section.items; track item.href) {
                            <li class="w-full break-inside-avoid">
                              <a
                                uiNavigationMenuLink
                                [href]="item.href"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex w-full flex-row items-center gap-1 whitespace-nowrap rounded-none bg-transparent p-0 text-base font-normal leading-normal underline-offset-4 decoration-muted-foreground/50 decoration-1 hover:bg-transparent hover:underline focus:bg-transparent focus:underline data-[active=true]:bg-transparent"
                              >
                                {{ item.name }}
                                <svg
                                  [uiIcon]="ArrowUpRight"
                                  class="inline-flex size-4 shrink-0"
                                ></svg>
                              </a>
                            </li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </li>
        </ul>
      </nav>
    </div>
  `,
})
export class LabsNav {
  protected readonly cn = cn;
  protected readonly SITE = SITE;
  protected readonly ArrowUpRight = ArrowUpRight;
  protected readonly ChevronDown = ChevronDown;
  protected readonly SECTION_WIDTH = SECTION_WIDTH;
  protected readonly SECTION_LIST = SECTION_LIST;
  protected readonly latestCardClassName = latestCardClassName;
  protected readonly latest = withUtm(LABS_LATEST);
  protected readonly sections = LABS_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map(withUtm),
  }));
  protected readonly mobileOpen = signal(false);
  protected readonly value = signal("");
}
