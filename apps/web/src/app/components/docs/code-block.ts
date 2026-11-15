import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { File } from "lucide";

import type { BrandIconName } from "@/lib/brand-icons";
import type { DocNode } from "@/lib/content/types";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { CopyButton } from "@/src/app/components/copy-button";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiSeparator } from "@/src/app/components/ui/separator";

const LANGUAGE_ICONS: Record<string, BrandIconName> = {
  "angular-ts": "ts",
  css: "css",
  json: "json",
  ts: "ts",
  tsx: "ts",
  typescript: "ts",
};

/** A highlighted code figure with a copy button. Collapsible blocks are the reference's ComponentSource. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    BrandIcon,
    CopyButton,
    NgTemplateOutlet,
    UiButton,
    UiIcon,
    UiSeparator,
  ],
  selector: "docs-code-block",
  template: `
    <ng-template #figure>
      <figure
        data-rehype-pretty-code-figure=""
        [class]="block().collapsible ? '[&>pre]:max-h-96' : ''"
      >
        @if (block().title) {
          <figcaption
            class="text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70"
            data-rehype-pretty-code-title=""
            [attr.data-language]="block().lang"
          >
            @if (languageIcon(); as icon) {
              <svg [brandIcon]="icon"></svg>
            } @else {
              <svg [uiIcon]="File" class="size-4"></svg>
            }
            {{ block().title }}
          </figcaption>
        }
        <app-copy-button [value]="block().code" />
        <div [innerHTML]="html()"></div>
      </figure>
    </ng-template>

    @if (block().collapsible) {
      <div
        class="group/collapsible relative md:-mx-1"
        data-slot="collapsible"
        [attr.data-state]="open() ? 'open' : 'closed'"
      >
        <div
          class="absolute right-9 z-10 flex items-center"
          [class]="block().title ? 'top-1.5' : 'top-3'"
        >
          <button
            uiButton
            variant="ghost"
            size="sm"
            class="text-muted-foreground h-7 rounded-md px-2"
            type="button"
            (click)="open.set(!open())"
          >
            {{ open() ? "Collapse" : "Expand" }}
          </button>
          <ui-separator orientation="vertical" class="mx-1.5 h-4!" />
        </div>
        <div
          class="relative mt-6 overflow-hidden data-[state=closed]:max-h-64 data-[state=closed]:[content-visibility:auto] [&>figure]:mt-0 [&>figure]:md:mx-0!"
          data-slot="collapsible-content"
          [attr.data-state]="open() ? 'open' : 'closed'"
        >
          <ng-container [ngTemplateOutlet]="figure" />
        </div>
        <div
          class="absolute inset-x-0 -bottom-2 flex h-20 items-center justify-center rounded-b-lg bg-linear-to-b from-code/70 to-code group-data-[state=open]/collapsible:hidden"
        >
          <button
            uiButton
            variant="outline"
            size="sm"
            type="button"
            (click)="open.set(true)"
          >
            Expand
          </button>
        </div>
      </div>
    } @else {
      <ng-container [ngTemplateOutlet]="figure" />
    }
  `,
})
export class DocsCodeBlock {
  readonly block = input.required<Extract<DocNode, { type: "code" }>>();

  protected readonly File = File;
  protected readonly open = signal(false);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly languageIcon = computed(
    () => LANGUAGE_ICONS[this.block().lang]
  );
  // Shiki's markup is generated at build time from our own files.
  protected readonly html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.block().html)
  );
}
