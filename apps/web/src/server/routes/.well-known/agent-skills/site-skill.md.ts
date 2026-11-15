import { defineEventHandler, setResponseHeader } from "h3";

import { SITE_AGENT_SKILL_MD } from "@/lib/agent-discovery/site-agent-skill";

export default defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "text/markdown; charset=utf-8");
  return SITE_AGENT_SKILL_MD;
});
