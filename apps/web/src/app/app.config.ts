import { provideFileRouter } from "@analogjs/router";
import { provideBrowserGlobalErrorListeners } from "@angular/core";
import type { ApplicationConfig } from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFileRouter(),
    provideClientHydration(),
  ],
};
