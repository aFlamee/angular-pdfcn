import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ROUTES } from "@/constants/routes";
import { BrandContextMenu } from "@/src/app/components/brand-context-menu";
import { CommandMenu } from "@/src/app/components/command-menu";
import { LabsNav } from "@/src/app/components/labs-nav";
import { LogoMark } from "@/src/app/components/logo";
import { MainNav } from "@/src/app/components/main-nav";
import type { NavItem } from "@/src/app/components/main-nav";
import { MobileNav } from "@/src/app/components/mobile-nav";
import { NavItemGithub } from "@/src/app/components/nav-item-github";
import { SiteSettings } from "@/src/app/components/site-settings";
import { SponsorLink } from "@/src/app/components/sponsor-link";
import { UiButton } from "@/src/app/components/ui/button";
import { tree } from "@/src/app/lib/docs-source";

const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.DOCS, label: "Docs" },
  { href: ROUTES.DOCS_COMPONENTS, label: "Components" },
  { href: ROUTES.DOCS_BLOCKS, label: "Blocks" },
  { href: ROUTES.THEME_BUILDER, label: "Theme Builder" },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    BrandContextMenu,
    CommandMenu,
    LabsNav,
    LogoMark,
    MainNav,
    MobileNav,
    NavItemGithub,
    RouterLink,
    SiteSettings,
    SponsorLink,
    UiButton,
  ],
  selector: "app-site-header",
  template: `
    <header
      class="bg-background sticky top-0 z-50 w-full"
      style="view-transition-name: site-header"
    >
      <div class="container-wrapper 3xl:fixed:px-0 relative px-6">
        <div
          class="3xl:fixed:container relative flex h-(--header-height) items-center"
        >
          <app-mobile-nav
            [items]="navItems"
            [tree]="tree"
            class="flex lg:hidden mr-2"
          />
          <div class="flex items-center">
            <app-brand-context-menu>
              <a
                uiButton
                variant="ghost"
                size="icon-sm"
                class="hover:bg-transparent focus-visible:bg-transparent dark:hover:bg-transparent lg:size-9"
                sound="click"
                [routerLink]="ROUTES.HOME"
              >
                <svg appLogoMark class="size-5"></svg>
              </a>
            </app-brand-context-menu>
            <span class="text-muted-foreground/50 ml-1">/</span>
            <app-labs-nav />
          </div>
          <nav appMainNav [items]="navItems" class="hidden lg:flex"></nav>
          <div
            class="ml-auto flex items-center gap-1 md:gap-2 md:flex-1 md:justify-end"
          >
            <div class="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <app-command-menu [navItems]="navItems" [tree]="tree" />
            </div>
            <app-nav-item-github />
            <app-sponsor-link />
            <app-site-settings />
          </div>
        </div>
      </div>
    </header>
  `,
})
export class SiteHeader {
  protected readonly ROUTES = ROUTES;
  protected readonly navItems = NAV_ITEMS;
  protected readonly tree = tree;
}
