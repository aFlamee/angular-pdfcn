import { defineEventHandler, setResponseHeader } from "h3";

import { docsPageMarkdown } from "@/lib/llms";

/** Serves `/docs/<slugs>.md` as the page's markdown, which the reference did with a rewrite. */
export default defineEventHandler((event) => {
  const url = event.path.match(/^(\/docs(?:\/[^?#]+)?)\.md$/)?.[1];
  const markdown = url && docsPageMarkdown(url);
  if (!markdown) {
    return;
  }
  setResponseHeader(event, "content-type", "text/markdown; charset=utf-8");
  return markdown;
});
