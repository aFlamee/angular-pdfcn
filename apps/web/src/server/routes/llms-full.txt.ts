import { defineEventHandler, setResponseHeader } from "h3";

import { loadDocs } from "@/lib/content/source";
import { getLLMText } from "@/lib/llms";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "text/plain; charset=utf-8");
  return loadDocs().pages.map(getLLMText).join("\n\n");
});
