import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { ORIGINAL } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { AgentPrompt } from "@/src/app/components/home/agent-prompt";
import { CommandBox } from "@/src/app/components/home/command-box";
import { HomeCtas } from "@/src/app/components/home/home-ctas";
import { HomePdfShowcase } from "@/src/app/components/home/home-pdf-showcase";
import { PageHero } from "@/src/app/components/home/page-hero";
import { BreadcrumbJsonLd } from "@/src/app/components/json-ld";
import { SeoService } from "@/src/app/services/seo";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    AgentPrompt,
    BreadcrumbJsonLd,
    CommandBox,
    HomeCtas,
    HomePdfShowcase,
    PageHero,
  ],
  template: `
    <app-breadcrumb-json-ld [items]="[{ name: 'Home', path: ROUTES.HOME }]" />
    <section class="container-wrapper relative">
      <div
        class="container flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24"
      >
        <app-page-hero
          showAnnouncement
          title="Beautiful PDFs, made simple"
          titleClass="max-w-7xl"
          descriptionClass="max-w-2xl text-lg sm:text-xl"
        >
          Ready to use, customizable pdf components for Angular.
          <br class="hidden sm:block" />
          A community port of
          <a
            [href]="ORIGINAL.GITHUB"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-4 hover:text-foreground"
            >{{ ORIGINAL.NAME }}</a
          >. Built on Takumi and Forme. Distributed via shadcn.
        </app-page-hero>

        <app-command-box class="mt-4 w-full max-w-xl" />

        <app-home-ctas class="mt-4" />

        <app-agent-prompt />
      </div>
    </section>

    <app-home-pdf-showcase />
  `,
})
export default class HomePage {
  protected readonly ORIGINAL = ORIGINAL;
  protected readonly ROUTES = ROUTES;

  constructor() {
    inject(SeoService).setPage({ path: ROUTES.HOME });
  }
}
