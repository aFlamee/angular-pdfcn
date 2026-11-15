import { defineEventHandler } from "h3";

import { buildOpenApiDocument } from "@/lib/agent-discovery/openapi-document";

export default defineEventHandler(() => buildOpenApiDocument());
