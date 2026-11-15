import { defineEventHandler } from "h3";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { siteAgentSkillDigest } from "@/lib/agent-discovery/site-agent-skill";

export default defineEventHandler(() => ({
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      description:
        "Install and use components from this public shadcn registry starter and documentation site.",
      digest: siteAgentSkillDigest(),
      name: "registry-starter",
      type: "skill-md",
      url: `${SITE.URL}${ROUTES.AGENT_SKILLS_SITE_SKILL}`,
    },
  ],
}));
