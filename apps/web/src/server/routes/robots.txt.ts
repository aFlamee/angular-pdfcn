import { defineEventHandler, setResponseHeader } from "h3";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "text/plain; charset=utf-8");
  return [
    "User-agent: *",
    "Allow: /",
    "Content-Signal: ai-train=yes, search=yes, ai-input=yes",
    "",
    `Sitemap: ${SITE.URL}${ROUTES.SITEMAP}`,
    "",
  ].join("\n");
});
