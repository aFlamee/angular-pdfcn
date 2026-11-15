import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ArrowLeft, BookOpenText } from "lucide";

import { ROUTES } from "@/constants/routes";
import { Daikanoid } from "@/src/app/components/not-found/daikanoid/daikanoid";
import {
  DaikanoidArtwork,
  DaikanoidPreview,
} from "@/src/app/components/not-found/daikanoid/preview";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiEmpty,
  UiEmptyContent,
  UiEmptyDescription,
  UiEmptyHeader,
  UiEmptyMedia,
  UiEmptyTitle,
} from "@/src/app/components/ui/empty";
import { UiIcon } from "@/src/app/components/ui/icon";

// The preview and the game share it, so the preview grows into the game.
const GAME_TRANSITION_NAME = "view-transition-name: not-found-daikanoid";

/** The 404 page: copy and links, plus a brick breaker game on larger screens. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "relative grid min-h-svh place-items-center overflow-hidden p-6 md:p-8",
  },
  imports: [
    Daikanoid,
    DaikanoidArtwork,
    DaikanoidPreview,
    NgTemplateOutlet,
    RouterLink,
    UiButton,
    UiEmpty,
    UiEmptyContent,
    UiEmptyDescription,
    UiEmptyHeader,
    UiEmptyMedia,
    UiEmptyTitle,
    UiIcon,
  ],
  selector: "main[appNotFound]",
  template: `
    <ng-template #actions>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <a uiButton variant="outline" [routerLink]="ROUTES.HOME">
          <svg [uiIcon]="ArrowLeft"></svg>
          Back to Home
        </a>
        <a uiButton [routerLink]="ROUTES.DOCS">
          <svg [uiIcon]="BookOpenText"></svg>
          Go to Docs
        </a>
      </div>
    </ng-template>
    <ng-template #copy>
      <div uiEmptyTitle class="text-xl md:text-2xl">
        <h1>Page not found</h1>
      </div>
      <div uiEmptyDescription class="max-w-md md:text-base/relaxed">
        The page you're looking for may have been moved, removed, renamed, or
        might never have existed.
      </div>
    </ng-template>

    <div uiEmpty class="w-full max-w-md gap-6 p-0 md:hidden">
      <div uiEmptyHeader class="w-full max-w-md">
        <div uiEmptyMedia class="mb-3 w-full">
          <div appDaikanoidArtwork></div>
        </div>
        <ng-container [ngTemplateOutlet]="copy" />
      </div>
      <div uiEmptyContent>
        <ng-container [ngTemplateOutlet]="actions" />
      </div>
    </div>

    @if (!playing()) {
      <div class="hidden w-full max-w-3xl md:block">
        <div uiEmpty class="w-full gap-6 p-0">
          <div uiEmptyHeader class="w-full max-w-3xl gap-3">
            <div uiEmptyMedia class="mb-5 w-full">
              <button
                appDaikanoidPreview
                [style]="GAME_TRANSITION_NAME"
                (click)="setPlaying(true)"
              ></button>
            </div>
            <ng-container [ngTemplateOutlet]="copy" />
          </div>
          <div uiEmptyContent>
            <ng-container [ngTemplateOutlet]="actions" />
          </div>
        </div>
      </div>
    } @else {
      <div
        class="absolute inset-0 z-20 hidden place-items-center bg-background p-6 md:grid"
      >
        <div
          class="flex w-[min(50rem,calc(100vw-3rem),calc(133.333svh-7.667rem))] flex-col items-start gap-2"
        >
          <button
            uiButton
            type="button"
            variant="ghost"
            (click)="setPlaying(false)"
          >
            <svg [uiIcon]="ArrowLeft"></svg>
            Back
          </button>
          <div
            class="aspect-4/3 w-full overflow-hidden bg-muted/35 ring-1 ring-border"
            [style]="GAME_TRANSITION_NAME"
          >
            <canvas
              appDaikanoid
              autofocus
              class="h-full w-full max-w-none ring-0 focus-visible:ring-0"
            ></canvas>
          </div>
        </div>
      </div>
    }
  `,
})
export class NotFound {
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly BookOpenText = BookOpenText;
  protected readonly ROUTES = ROUTES;
  protected readonly GAME_TRANSITION_NAME = GAME_TRANSITION_NAME;
  protected readonly playing = signal(false);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  /** Swaps the preview and the game in a view transition, which morphs one into the other. */
  protected setPlaying(playing: boolean) {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !this.document.startViewTransition) {
      this.playing.set(playing);
      return;
    }
    this.document.startViewTransition(() => {
      this.playing.set(playing);
      this.appRef.tick();
    });
  }
}
