import { Injectable, afterNextRender, signal } from "@angular/core";

const MOBILE_BREAKPOINT = 768;

/** The reference's `useIsMobile`: false on the server and the first client render. */
@Injectable({ providedIn: "root" })
export class MediaQueryService {
  readonly isMobile = signal(false);

  constructor() {
    afterNextRender(() => {
      const query = matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const update = () => this.isMobile.set(innerWidth < MOBILE_BREAKPOINT);
      query.addEventListener("change", update);
      update();
    });
  }
}
