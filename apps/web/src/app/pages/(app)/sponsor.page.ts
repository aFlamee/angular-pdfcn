import type { RouteMeta } from "@analogjs/router";
import {
  ChangeDetectionStrategy,
  Component,
  TransferState,
  inject,
  makeStateKey,
} from "@angular/core";
import type { ResolveFn } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { ExternalLink, Heart, Star } from "lucide";

import { LINK, ORIGINAL } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { getStargazers, tiers } from "@/lib/sponsors";
import type { Stargazer } from "@/lib/sponsors";
import { ExternalLinkButton } from "@/src/app/components/external-link-button";
import { SponsorTier } from "@/src/app/components/sponsor/sponsor-tier";
import {
  UiCard,
  UiCardContent,
  UiCardHeader,
} from "@/src/app/components/ui/card";
import { UiIcon } from "@/src/app/components/ui/icon";
import { SeoService } from "@/src/app/services/seo";

const STARGAZERS = makeStateKey<Stargazer[]>("stargazers");

/** Fetches the stargazers while prerendering and hands them to the client through the page. */
const resolveStargazers: ResolveFn<Stargazer[]> = async () => {
  const state = inject(TransferState);
  if (state.hasKey(STARGAZERS)) {
    return state.get(STARGAZERS, []);
  }
  const stargazers = await getStargazers();
  state.set(STARGAZERS, stargazers);
  return stargazers;
};

export const routeMeta: RouteMeta = {
  resolve: { stargazers: resolveStargazers },
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    ExternalLinkButton,
    SponsorTier,
    UiCard,
    UiCardContent,
    UiCardHeader,
    UiIcon,
  ],
  template: `
    <section class="container-wrapper relative">
      <div
        class="container max-w-2xl flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24"
      >
        <h1
          class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl from-foreground via-foreground to-foreground/65 bg-linear-to-b bg-clip-text text-transparent"
        >
          Support the project
        </h1>
        <p class="text-base text-muted-foreground text-balance">
          {{ SITE.NAME }} is a community Angular port of
          <a
            [href]="ORIGINAL.GITHUB"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-foreground underline underline-offset-4"
            >{{ ORIGINAL.NAME }}</a
          >, a collection of beautifully designed, accessible, and customizable
          PDF components by {{ ORIGINAL.AUTHOR }}. Every component is free and
          that's not changing.
        </p>
        <p class="text-sm text-muted-foreground text-balance">
          The components, their design, and the registry come from
          {{ ORIGINAL.NAME }}. Sponsorships on this page go to
          {{ ORIGINAL.AUTHOR }}, its original author, not to this port. If
          {{ SITE.NAME }} made your project better, sponsoring
          {{ ORIGINAL.AUTHOR }} is a nice way to say so. It pays for real time
          on {{ ORIGINAL.NAME }}, and this port follows its updates.
        </p>
        <p class="text-sm text-muted-foreground text-balance">
          Any amount is genuinely appreciated. And if money's not your thing,
          starring the repo or sharing something you liked works too.
        </p>
        <a
          externalLinkButton
          sound="heart"
          size="lg"
          class="mt-4"
          [href]="LINK.SPONSOR"
        >
          <svg [uiIcon]="Heart"></svg>
          Sponsor on GitHub
          <svg [uiIcon]="ExternalLink" class="size-3.5 opacity-60"></svg>
        </a>
      </div>
    </section>

    <section class="container-wrapper relative">
      <div class="container max-w-2xl flex flex-col">
        @for (tier of tiers; track tier.name) {
          <app-sponsor-tier [tier]="tier" />
        }
      </div>
    </section>

    @if (stargazers.length > 0) {
      <section class="container-wrapper relative">
        <div class="container max-w-2xl pt-6">
          <ui-card class="shadow-none gap-4 py-4">
            <ui-card-header class="flex items-center gap-3 px-4">
              <h3
                class="text-xs font-bold uppercase tracking-wide text-foreground"
              >
                Stargazers
              </h3>
              <span class="text-xs tabular-nums text-muted-foreground">{{
                stargazers.length
              }}</span>
            </ui-card-header>
            <ui-card-content class="flex flex-wrap justify-center gap-0 px-4">
              @for (user of stargazers; track user.login) {
                <a
                  [href]="'https://github.com/' + user.login"
                  target="_blank"
                  rel="noopener noreferrer"
                  [title]="user.login"
                  class="group relative p-1.5 transition-colors hover:bg-accent/50"
                >
                  <img
                    [src]="user.avatar_url"
                    [alt]="user.login"
                    width="36"
                    height="36"
                    loading="lazy"
                    class="rounded-full ring-1 ring-border transition-all group-hover:ring-foreground/30 group-hover:scale-110"
                  />
                </a>
              }
            </ui-card-content>
          </ui-card>
        </div>
      </section>
    }

    <section class="container-wrapper relative">
      <div
        class="container flex flex-col items-center gap-4 py-16 md:py-20 lg:py-24"
      >
        <div class="flex flex-col items-center gap-2 text-center">
          <h2 class="text-lg font-bold tracking-tight">
            Want to back the project?
          </h2>
          <p class="max-w-sm text-sm text-muted-foreground">
            Every bit helps, whether it's a sponsorship, a star, or sharing
            something you found useful.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a externalLinkButton sound="heart" [href]="LINK.SPONSOR">
            <svg [uiIcon]="Heart"></svg>
            Become a Sponsor
          </a>
          <a
            externalLinkButton
            sound="star"
            variant="outline"
            [href]="LINK.GITHUB"
          >
            <svg [uiIcon]="Star"></svg>
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  `,
})
export default class SponsorPage {
  protected readonly ExternalLink = ExternalLink;
  protected readonly Heart = Heart;
  protected readonly Star = Star;
  protected readonly LINK = LINK;
  protected readonly ORIGINAL = ORIGINAL;
  protected readonly SITE = SITE;
  protected readonly tiers = tiers;
  protected readonly stargazers: Stargazer[] =
    inject(ActivatedRoute).snapshot.data["stargazers"];

  constructor() {
    inject(SeoService).setPage({
      description: `Support ${ORIGINAL.NAME}, the PDF components ${SITE.NAME} ports to Angular. Sponsor tiers, stargazers, and how to contribute.`,
      path: ROUTES.SPONSOR,
      title: "Sponsor",
    });
  }
}
