import type { RouteMeta } from "@analogjs/router";

import { ROUTES } from "@/constants/routes";

// The reference redirects /docs/theming permanently.
export const routeMeta: RouteMeta = {
  pathMatch: "full",
  redirectTo: `${ROUTES.DOCS_THEMING}/takumi`,
};
