import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from "@angular/core";

import { getBlockTool, listBlocksTool, previewBlockTool } from "./block-tools";
import {
  getInstallCommandTool,
  listDocsTool,
  openDocsTool,
} from "./docs-tools";
import { generatePdfTool } from "./pdf-tool";
import { fetchRegistryTool } from "./registry-tool";
import { searchComponentsTool } from "./search-tool";
import { applyThemeTool, getThemeTool, listThemesTool } from "./theme-tools";
import { registerWebMcpTools } from "./web-mcp";
import type { WebMcpTool } from "./web-mcp";

const TOOLS: readonly WebMcpTool[] = [
  listThemesTool,
  getThemeTool,
  applyThemeTool,
  listBlocksTool,
  getBlockTool,
  previewBlockTool,
  generatePdfTool,
  searchComponentsTool,
  openDocsTool,
  listDocsTool,
  getInstallCommandTool,
  fetchRegistryTool,
];

/** Registers the site's WebMCP tools in the browser while mounted. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-web-mcp-tools",
  template: "",
})
export class WebMcpTools {
  constructor() {
    const controller = new AbortController();
    inject(DestroyRef).onDestroy(() => controller.abort());
    afterNextRender(() => registerWebMcpTools(TOOLS, controller.signal));
  }
}
