import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { AGENT_DOCS_DIRECTIVE_TEXT } from "@/lib/agent-discovery/directive";
import { SiteFooter } from "@/src/app/components/site-footer";
import { SiteHeader } from "@/src/app/components/site-header";
import { WebMcpTools } from "@/src/app/components/web-mcp/web-mcp-tools";

/** The site chrome every page except the 404 shares. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "bg-background relative flex min-h-svh flex-col" },
  imports: [RouterOutlet, SiteFooter, SiteHeader, WebMcpTools],
  template: `
    <blockquote class="sr-only">{{ directive }}</blockquote>
    <app-web-mcp-tools />
    <app-site-header />
    <main class="flex flex-1 flex-col"><router-outlet /></main>
    <app-site-footer />
  `,
})
export default class AppLayout {
  protected readonly directive = AGENT_DOCS_DIRECTIVE_TEXT;
}
