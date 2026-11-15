import type { RouteMeta } from "@analogjs/router";

import { ROUTES } from "@/constants/routes";

// The reference redirects /theme-builder to the Takumi builder.
export const routeMeta: RouteMeta = {
  pathMatch: "full",
  redirectTo: ROUTES.THEME_BUILDER_TAKUMI,
};
