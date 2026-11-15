import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeader,
} from "h3";

import { ROUTES } from "@/constants/routes";
import { docsPageMarkdown } from "@/lib/llms";

/** `/llms.md/docs/<slugs>/content.md`: the markdown of the docs page at `/docs/<slugs>`. */
export default defineEventHandler((event) => {
  const slug = getRouterParam(event, "slug") ?? "";
  const markdown = docsPageMarkdown(
    `${ROUTES.DOCS}/${slug}`.replace(/\/content\.md$/, "")
  );
  if (!markdown) {
    throw createError({ statusCode: 404 });
  }
  setResponseHeader(event, "content-type", "text/markdown; charset=utf-8");
  return markdown;
});
