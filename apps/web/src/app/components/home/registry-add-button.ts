import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Plus } from "lucide";

import { packageManagerCommands } from "@/lib/content/commands";
import type { DocNode, PackageManager } from "@/lib/content/types";
import { addQueryParams } from "@/lib/url";
import { DocsCodeBlockCommand } from "@/src/app/components/docs/code-block-command";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiDialog,
  UiDialogClose,
  UiDialogContent,
  UiDialogDescription,
  UiDialogFooter,
  UiDialogHeader,
  UiDialogTitle,
  UiDialogTrigger,
} from "@/src/app/components/ui/dialog";
import {
  UiDrawer,
  UiDrawerClose,
  UiDrawerContent,
  UiDrawerDescription,
  UiDrawerFooter,
  UiDrawerHeader,
  UiDrawerTitle,
  UiDrawerTrigger,
} from "@/src/app/components/ui/drawer";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiPortal } from "@/src/app/components/ui/overlay";
import { MediaQueryService } from "@/src/app/services/media-query";

/** Opens a dialog, or a drawer on mobile, with the command that adds a registry to `components.json`. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    DocsCodeBlockCommand,
    NgTemplateOutlet,
    UiButton,
    UiDialog,
    UiDialogClose,
    UiDialogContent,
    UiDialogDescription,
    UiDialogFooter,
    UiDialogHeader,
    UiDialogTitle,
    UiDialogTrigger,
    UiDrawer,
    UiDrawerClose,
    UiDrawerContent,
    UiDrawerDescription,
    UiDrawerFooter,
    UiDrawerHeader,
    UiDrawerTitle,
    UiDrawerTrigger,
    UiIcon,
    UiPortal,
  ],
  selector: "app-registry-add-button",
  template: `
    <ng-template #label>
      <svg [uiIcon]="Plus"></svg>
      <span class="hidden sm:inline">Add</span>
    </ng-template>
    <ng-template #description>
      Run this command to add
      <a
        class="text-foreground underline underline-offset-4"
        [href]="directoryUrl()"
        target="_blank"
        rel="noopener"
        >{{ registry() }}</a
      >
      to your project.
    </ng-template>

    @if (media.isMobile()) {
      <ng-container uiDrawer sounds [(open)]="open">
        <button
          uiButton
          uiDrawerTrigger
          size="sm"
          variant="ghost"
          [class]="class()"
        >
          <ng-container [ngTemplateOutlet]="label" />
        </button>
        <ui-drawer-content *uiPortal>
          <div uiDrawerHeader>
            <h2 uiDrawerTitle>{{ title }}</h2>
            <p uiDrawerDescription>
              <ng-container [ngTemplateOutlet]="description" />
            </p>
          </div>
          <div class="px-4">
            <docs-code-block-command [block]="block()" />
          </div>
          <div uiDrawerFooter>
            <button uiButton size="sm" uiDrawerClose>Done</button>
          </div>
        </ui-drawer-content>
      </ng-container>
    } @else {
      <ng-container uiDialog sounds [(open)]="open">
        <button
          uiButton
          uiDialogTrigger
          size="sm"
          variant="ghost"
          [class]="class()"
        >
          <ng-container [ngTemplateOutlet]="label" />
        </button>
        <ui-dialog-content *uiPortal class="sm:max-w-lg">
          <div uiDialogHeader>
            <h2 uiDialogTitle>{{ title }}</h2>
            <p uiDialogDescription class="text-balance">
              <ng-container [ngTemplateOutlet]="description" />
            </p>
          </div>
          <docs-code-block-command [block]="block()" />
          <div uiDialogFooter>
            <button uiButton size="sm" uiDialogClose>Done</button>
          </div>
        </ui-dialog-content>
      </ng-container>
    }
  `,
})
export class RegistryAddButton {
  readonly registry = input.required<string>();
  readonly class = input("");

  protected readonly title = "Add Registry";
  protected readonly Plus = Plus;
  protected readonly media = inject(MediaQueryService);
  protected readonly open = signal(false);

  protected readonly directoryUrl = computed(() =>
    addQueryParams("https://ui.shadcn.com/docs/directory", {
      q: this.registry(),
    })
  );
  protected readonly block = computed(
    (): Extract<DocNode, { type: "command" }> => ({
      // The command starts with `npx`, so it maps to every package manager.
      commands: packageManagerCommands(
        `npx shadcn@latest registry add ${this.registry()}`
      ) as Record<PackageManager, string>,
      type: "command",
    })
  );
}
