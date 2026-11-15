import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { SquareTerminal, Text } from "lucide";

import type { BrandIconName } from "@/lib/brand-icons";
import type { DocNode, PackageManager } from "@/lib/content/types";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { CopyButton } from "@/src/app/components/copy-button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { ConfigService } from "@/src/app/services/config";
import { FeedbackService } from "@/src/app/services/feedback";

type CommandTab = PackageManager | "shadcn" | "prompt";

const SHADCN_NPX_PREFIX = "npx shadcn@latest ";
const PACKAGE_MANAGERS: ReadonlySet<string> = new Set([
  "bun",
  "npm",
  "pnpm",
  "yarn",
]);

const TAB_TRIGGER =
  "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-input h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none";

/** The reference's CodeBlockCommand: one command per package manager, plus shadcn and agent prompt tabs. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [BrandIcon, CopyButton, NgTemplateOutlet, UiIcon],
  selector: "docs-code-block-command",
  template: `
    <ng-template #tabIcon>
      @if (brandIcon(); as icon) {
        <svg [brandIcon]="icon"></svg>
      } @else if (activeTab() === "prompt") {
        <svg [uiIcon]="Text" class="size-4"></svg>
      } @else {
        <svg [uiIcon]="SquareTerminal"></svg>
      }
    </ng-template>
    <div
      class="bg-code text-code-foreground relative overflow-hidden rounded-lg text-sm"
    >
      <div data-slot="tabs" class="flex flex-col gap-0">
        <div
          class="border-border/50 flex items-center gap-2 border-b px-3 py-1"
        >
          <div
            role="tablist"
            data-slot="tabs-list"
            class="text-muted-foreground hidden h-9 w-fit items-center justify-center rounded-none bg-transparent p-0 md:inline-flex [&_svg]:me-2 [&_svg]:size-4 [&_svg]:text-muted-foreground"
          >
            <ng-container [ngTemplateOutlet]="tabIcon" />
            @for (tab of tabs(); track tab.value) {
              <button
                type="button"
                role="tab"
                data-slot="tabs-trigger"
                [class]="TAB_TRIGGER"
                [attr.data-state]="
                  tab.value === activeTab() ? 'active' : 'inactive'
                "
                [attr.aria-selected]="tab.value === activeTab()"
                (click)="select(tab.value)"
              >
                {{ tab.value }}
              </button>
            }
          </div>
          <div
            class="flex items-center gap-2 md:hidden [&_svg]:size-4 [&_svg]:text-muted-foreground"
          >
            <ng-container [ngTemplateOutlet]="tabIcon" />
            <select
              aria-label="Command"
              class="border-input font-sans bg-background my-0.5 h-8 rounded-md border px-2.5 text-sm shadow-none"
              [value]="activeTab()"
              (change)="select($any($event.target).value)"
            >
              @for (tab of tabs(); track tab.value) {
                <option
                  [value]="tab.value"
                  [selected]="tab.value === activeTab()"
                >
                  {{ tab.value }}
                </option>
              }
            </select>
          </div>
        </div>
        <div
          class="no-scrollbar"
          [class.overflow-x-auto]="activeTab() !== 'prompt'"
        >
          <div
            data-slot="tabs-content"
            class="mt-0 flex-1 px-4 py-3.5 outline-none"
          >
            @if (activeTab() === "prompt") {
              <p
                data-slot="code-block"
                class="text-sm/relaxed whitespace-normal"
              >
                {{ copyValue() }}
              </p>
            } @else {
              <pre><code data-slot="code-block" data-language="bash" class="font-mono text-sm/none"><span class="select-none">$ </span>{{ copyValue() }}</code></pre>
            }
          </div>
        </div>
      </div>
      <app-copy-button
        class="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
        [value]="copyValue()"
      />
    </div>
  `,
})
export class DocsCodeBlockCommand {
  readonly block = input.required<Extract<DocNode, { type: "command" }>>();

  protected readonly SquareTerminal = SquareTerminal;
  protected readonly Text = Text;
  protected readonly TAB_TRIGGER = TAB_TRIGGER;
  private readonly config = inject(ConfigService);
  private readonly feedback = inject(FeedbackService);
  private readonly commandTab = signal<CommandTab | null>(null);

  protected readonly tabs = computed(() => {
    const { bun, npm, pnpm, yarn } = this.block().commands;
    const packageManagerTabs: { command: string; value: CommandTab }[] = [
      { command: bun, value: "bun" },
      { command: npm, value: "npm" },
      { command: pnpm, value: "pnpm" },
      { command: yarn, value: "yarn" },
    ];
    if (!npm.startsWith(SHADCN_NPX_PREFIX)) {
      return packageManagerTabs;
    }
    return [
      {
        command: `Run \`${npm}\` in this project to install it with the shadcn CLI. Don't rewrite the files it adds. If the command fails, show me the error.`,
        value: "prompt" as const,
      },
      {
        command: npm.replace(SHADCN_NPX_PREFIX, "shadcn "),
        value: "shadcn" as const,
      },
      ...packageManagerTabs,
    ];
  });

  protected readonly activeTab = computed(() => {
    const selected = this.commandTab() ?? this.config.packageManager();
    return this.tabs().some((tab) => tab.value === selected) ? selected : "npm";
  });

  protected readonly copyValue = computed(
    () =>
      this.tabs().find((tab) => tab.value === this.activeTab())?.command ?? ""
  );

  protected readonly brandIcon = computed((): BrandIconName | undefined => {
    const tab = this.activeTab();
    return tab === "shadcn" || PACKAGE_MANAGERS.has(tab)
      ? (tab as BrandIconName)
      : undefined;
  });

  protected select(value: string) {
    const tab = value as CommandTab;
    this.feedback.play("tabSwitch");
    this.commandTab.set(tab);
    if (PACKAGE_MANAGERS.has(tab)) {
      this.config.packageManager.set(tab as PackageManager);
    }
  }
}
