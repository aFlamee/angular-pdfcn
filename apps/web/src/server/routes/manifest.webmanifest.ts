import { defineEventHandler, setResponseHeader } from "h3";

import { ROUTES } from "@/constants/routes";
import { META_THEME_COLORS, SITE } from "@/constants/site";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "application/manifest+json");
  return JSON.stringify({
    background_color: META_THEME_COLORS.light,
    description: SITE.DESCRIPTION.LONG,
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/android-chrome-512x512.png",
        type: "image/png",
      },
    ],
    name: SITE.NAME,
    short_name: SITE.NAME,
    start_url: ROUTES.HOME,
    theme_color: META_THEME_COLORS.light,
  });
});
