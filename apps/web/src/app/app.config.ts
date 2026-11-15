import { provideFileRouter } from "@analogjs/router";
import { provideBrowserGlobalErrorListeners } from "@angular/core";
import type { ApplicationConfig } from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";
import {
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from "@angular/router";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Blocking navigation runs the docs resolver before hydration, so the client matches the prerendered page.
    provideFileRouter(
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        anchorScrolling: "enabled",
        scrollPositionRestoration: "enabled",
      })
    ),
    provideClientHydration(),
  ],
};
