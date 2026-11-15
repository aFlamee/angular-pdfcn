import { computed, inject } from "@angular/core";
import { Router } from "@angular/router";

/** The current path without query or hash, like Next's `usePathname`. */
export const injectPathname = () => {
  const router = inject(Router);
  return computed(() => {
    router.lastSuccessfulNavigation();
    return router.url.split(/[?#]/)[0];
  });
};

/** Urls with an extension, like `/llms.txt`, are files the router doesn't serve. */
export const isFileUrl = (url: string) => /\.\w+$/.test(url);
