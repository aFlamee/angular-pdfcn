import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";

import { SITE } from "@/constants/site";
import { packageManagerCommands } from "@/lib/content/commands";
import type { PackageManager } from "@/lib/content/types";
import { addCommand } from "@/lib/install";
import registry from "@/registry.json";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { CopyButton } from "@/src/app/components/copy-button";
import { RegistryAddButton } from "@/src/app/components/home/registry-add-button";
import {
  UiSelect,
  UiSelectContent,
  UiSelectItem,
  UiSelectTrigger,
  UiSelectValue,
} from "@/src/app/components/ui/select";
import {
  UiTabs,
  UiTabsContent,
  UiTabsList,
  UiTabsTrigger,
} from "@/src/app/components/ui/tabs";
import { UiTextFlip } from "@/src/app/components/ui/text-flip";
import { ConfigService } from "@/src/app/services/config";

// Every value starts with `npx`, so each maps to all package managers.
const displayCommands = packageManagerCommands("npx shadcn add") as Record<
  PackageManager,
  string
>;
const packageManagers = Object.keys(displayCommands) as PackageManager[];

const registryItemNames = registry.items
  .map((item) => item.name)
  .toSorted((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
    })
  );

/** The hero's install command, cycling through every registry item. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "bg-code text-code-foreground relative block overflow-hidden rounded-lg text-sm",
  },
  imports: [
    BrandIcon,
    CopyButton,
    RegistryAddButton,
    UiSelect,
    UiSelectContent,
    UiSelectItem,
    UiSelectTrigger,
    UiSelectValue,
    UiTabs,
    UiTabsContent,
    UiTabsList,
    UiTabsTrigger,
    UiTextFlip,
  ],
  selector: "app-command-box",
  template: `
    <ui-tabs
      class="gap-0"
      [value]="config.packageManager()"
      (valueChange)="setPackageManager($event)"
    >
      <div class="border-border/50 flex items-center gap-2 border-b px-3 py-1">
        <ui-tabs-list
          class="hidden rounded-none bg-transparent p-0 md:inline-flex [&_svg]:me-2 [&_svg]:size-4 [&_svg]:text-muted-foreground"
        >
          <svg [brandIcon]="config.packageManager()"></svg>
          @for (key of packageManagers; track key) {
            <button
              uiTabsTrigger
              class="data-[state=active]:border-input h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
              sound="tabSwitch"
              [value]="key"
            >
              {{ key }}
            </button>
          }
        </ui-tabs-list>
        <div class="flex items-center gap-2 md:hidden">
          <svg [brandIcon]="config.packageManager()"></svg>
          <ng-container
            uiSelect
            [value]="config.packageManager()"
            (valueChange)="setPackageManager($event)"
          >
            <button
              uiSelectTrigger
              aria-label="Package manager"
              size="sm"
              class="font-sans bg-background px-2.5 my-0.5 shadow-none dark:bg-background dark:hover:bg-background"
            >
              <ui-select-value />
            </button>
            <ui-select-content>
              @for (key of packageManagers; track key) {
                <ui-select-item [value]="key">{{ key }}</ui-select-item>
              }
            </ui-select-content>
          </ng-container>
        </div>
      </div>
      <pre
        class="-translate-y-px px-4 py-3.5"
      ><code data-language="bash" class="text-left block font-mono text-sm text-muted-foreground max-sm:leading-6">@for (key of packageManagers; track key) {<ui-tabs-content class="block sm:inline-block" [value]="key"><span class="select-none">$ </span>{{ displayCommands[key] }} <span class="select-none sm:hidden" aria-hidden="true">\\</span></ui-tabs-content>}<span>{{ SITE.REGISTRY }}/</span><ui-text-flip class="text-foreground" [items]="registryItemNames" [interval]="1.5" [(index)]="itemIndex" /></code></pre>
    </ui-tabs>

    <app-registry-add-button
      [registry]="SITE.REGISTRY"
      class="absolute top-2 right-10 z-10 w-7 h-7 sm:w-auto gap-1.5 border-none px-2 opacity-70 hover:opacity-100 focus-visible:opacity-100 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5"
    />

    <app-copy-button
      class="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
      [value]="copyValue"
    />
  `,
})
export class CommandBox {
  protected readonly config = inject(ConfigService);
  protected readonly SITE = SITE;
  protected readonly displayCommands = displayCommands;
  protected readonly packageManagers = packageManagers;
  protected readonly registryItemNames = registryItemNames;
  protected readonly itemIndex = signal(0);

  protected readonly copyValue = () =>
    packageManagerCommands(addCommand(registryItemNames[this.itemIndex()]))?.[
      this.config.packageManager()
    ] ?? "";

  protected setPackageManager(value: string | undefined) {
    this.config.packageManager.set(value as PackageManager);
  }
}
