import { Clipboard } from "@angular/cdk/clipboard";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { Check, Copy } from "lucide";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { REGISTRY_NAMESPACE, addCommand } from "@/lib/install";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";

const agentInstallPrompt = `Read the ${SITE.NAME} agent instructions at ${SITE.URL}${ROUTES.LLMS}, then install ${SITE.NAME}, the Angular port of pdfcn, in this Angular project. Use the Takumi renderer by default (components under ${REGISTRY_NAMESPACE}/takumi/*). Use Forme (${REGISTRY_NAMESPACE}/forme/*) only if the project already uses @formepdf/core or the user asks for it. shadcn init does not support Angular, so if the project has no components.json, create it and the tsconfig "@/*" path as ${SITE.URL}${ROUTES.DOCS_INSTALLATION} shows. Run ${addCommand("takumi/text")}. Then add a basic standalone component that renders TakumiDocument and TakumiPage from "@/lib/pdf-primitives", wraps the content in PdfcnThemeProvider from "@/components/pdf/theme-provider", and uses PdfText from "@/components/pdf/text/text". For complete documents, install a block such as ${REGISTRY_NAMESPACE}/takumi/invoice-minimal instead of building from scratch. Preserve the existing Tailwind CSS setup. Do not manually rewrite registry components unless the command fails. If it fails, inspect ${SITE.URL}/r/takumi/text.json and install the listed dependencies.`;

/** Copies a prompt that has a coding agent install angular-pdfcn. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [UiButton, UiIcon],
  selector: "app-agent-prompt",
  template: `
    <button
      uiButton
      type="button"
      variant="ghost"
      size="xs"
      sound="copy"
      aria-live="polite"
      class="text-muted-foreground hover:text-foreground h-7 px-2.5"
      (click)="copy()"
    >
      @if (copied()) {
        <svg
          [uiIcon]="Check"
          class="animate-in fade-in-0 zoom-in-75 duration-150"
        ></svg>
      } @else {
        <svg
          [uiIcon]="Copy"
          class="animate-in fade-in-0 zoom-in-75 duration-150"
        ></svg>
      }
      {{
        copied()
          ? "Copied, paste into your agent"
          : "Copy prompt for your agent"
      }}
    </button>
  `,
})
export class AgentPrompt {
  protected readonly Check = Check;
  protected readonly Copy = Copy;
  protected readonly copied = signal(false);
  private readonly clipboard = inject(Clipboard);
  private timer?: ReturnType<typeof setTimeout>;

  protected copy() {
    if (this.clipboard.copy(agentInstallPrompt)) {
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 2500);
    }
  }
}
