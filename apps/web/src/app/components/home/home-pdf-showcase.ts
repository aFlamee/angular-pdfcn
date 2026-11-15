import {
  ChangeDetectionStrategy,
  Component,
  computed,
  resource,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ArrowUpRight, CodeXml, Eye, File } from "lucide";
import { loaders } from "virtual:docs";

import { ROUTES } from "@/constants/routes";
import { packageManagerCommands } from "@/lib/content/commands";
import type { BaseName, DocNode, PackageManager } from "@/lib/content/types";
import {
  homePdfBases,
  homePdfComponentCatalog,
  homePdfPreviews,
} from "@/lib/home/pdf-showcase";
import type { ComponentPartId, PdfRecipe } from "@/lib/home/pdf-showcase";
import { addCommand } from "@/lib/install";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { DocsCodeBlock } from "@/src/app/components/docs/code-block";
import { DocsCodeBlockCommand } from "@/src/app/components/docs/code-block-command";
import { PdfPreview } from "@/src/app/components/pdf-preview";
import { UiBadge } from "@/src/app/components/ui/badge";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiCard,
  UiCardContent,
  UiCardHeader,
  UiCardTitle,
} from "@/src/app/components/ui/card";
import { UiIcon } from "@/src/app/components/ui/icon";
import {
  UiSelect,
  UiSelectContent,
  UiSelectItem,
  UiSelectTrigger,
  UiSelectValue,
} from "@/src/app/components/ui/select";
import { UiSeparator } from "@/src/app/components/ui/separator";
import {
  UiTabs,
  UiTabsContent,
  UiTabsList,
  UiTabsTrigger,
} from "@/src/app/components/ui/tabs";
import { UiToggle } from "@/src/app/components/ui/toggle";

type CodeBlock = Extract<DocNode, { type: "code" }>;

const findPdf = (id: string): PdfRecipe =>
  homePdfPreviews.find((pdf) => pdf.id === id) ?? homePdfPreviews[0];

/** The demo's usage code, highlighted at build time on its block docs page. */
const loadCode = async ({
  base,
  demo,
}: {
  base: BaseName;
  demo: string;
}): Promise<CodeBlock> => {
  const loader = loaders[`${ROUTES.DOCS_BLOCKS}/${base}/${demo}`];
  const page = loader ? await loader() : undefined;
  const code = page?.nodes.find(
    (node): node is CodeBlock =>
      typeof node === "object" && node.type === "code"
  );
  if (!code) {
    throw new Error(`The ${base}/${demo} example is not ported yet.`);
  }
  return { ...code, collapsible: false };
};

/** A window with the showcase documents, their preview or code, and the components each uses. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "container-wrapper block pb-12 md:pb-16 lg:pb-24" },
  imports: [
    BrandIcon,
    DocsCodeBlock,
    DocsCodeBlockCommand,
    PdfPreview,
    RouterLink,
    UiBadge,
    UiButton,
    UiCard,
    UiCardContent,
    UiCardHeader,
    UiCardTitle,
    UiIcon,
    UiSelect,
    UiSelectContent,
    UiSelectItem,
    UiSelectTrigger,
    UiSelectValue,
    UiSeparator,
    UiTabs,
    UiTabsContent,
    UiTabsList,
    UiTabsTrigger,
    UiToggle,
  ],
  selector: "app-home-pdf-showcase",
  template: `
    <div class="container">
      <ui-card class="gap-0 overflow-hidden py-0">
        <ui-card-header class="block px-0">
          <div
            class="grid min-h-12 grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 px-3 lg:gap-3 lg:px-4"
          >
            <div
              class="col-start-1 row-start-1 hidden justify-self-start gap-1.5 lg:flex"
              aria-hidden="true"
            >
              <span class="size-2.5 rounded-full bg-red-400"></span>
              <span class="size-2.5 rounded-full bg-amber-400"></span>
              <span class="size-2.5 rounded-full bg-emerald-400"></span>
            </div>
            <h2
              class="col-start-2 row-start-1 flex min-w-0 max-w-[70vw] items-center justify-self-center gap-2 px-2 text-sm font-medium text-muted-foreground lg:max-w-full"
              [title]="selectedPdf().filename"
            >
              <svg [uiIcon]="File" class="size-3.5 shrink-0"></svg>
              <span class="truncate">{{ selectedPdf().filename }}</span>
            </h2>

            <div
              class="col-start-3 row-start-1 hidden justify-self-end rounded-lg bg-muted p-0.5 lg:flex"
              role="radiogroup"
              aria-label="PDF base"
            >
              @for (base of homePdfBases; track base.id) {
                <button
                  uiToggle
                  size="sm"
                  [pressed]="pdfBase() === base.id"
                  (pressedChange)="pdfBase.set(base.id)"
                  [attr.aria-label]="base.label"
                  class="h-7 gap-1.5 border border-transparent px-2 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:hover:bg-background data-[state=on]:hover:text-foreground dark:data-[state=on]:border-input dark:data-[state=on]:bg-input/30 dark:data-[state=on]:hover:bg-input/30"
                >
                  <svg [brandIcon]="base.id" class="size-3.5"></svg>
                  {{ base.label }}
                </button>
              }
            </div>
          </div>

          <ui-separator class="lg:hidden" />

          <div
            class="flex h-12 items-center justify-between gap-3 px-3 lg:hidden"
          >
            <label
              for="home-pdf-base"
              class="text-sm font-medium text-muted-foreground"
            >
              Choose base
            </label>
            <ng-container
              uiSelect
              [value]="pdfBase()"
              (valueChange)="pdfBase.set($any($event))"
            >
              <button
                uiSelectTrigger
                id="home-pdf-base"
                size="sm"
                aria-label="Choose base"
                class="w-40 min-w-0 sm:w-48"
              >
                <ui-select-value />
              </button>
              <ui-select-content align="end">
                @for (base of homePdfBases; track base.id) {
                  <ui-select-item [value]="base.id">{{
                    base.label
                  }}</ui-select-item>
                }
              </ui-select-content>
            </ng-container>
          </div>
        </ui-card-header>

        <ui-separator />

        <ui-card-content
          class="p-0 lg:grid lg:h-180 lg:grid-cols-[14rem_minmax(0,1fr)_20rem]"
        >
          <aside
            aria-label="PDF examples"
            class="hidden flex-col bg-card lg:flex lg:border-r"
          >
            <div class="flex h-12 shrink-0 items-center px-4">
              <ui-card-title class="text-sm">Documents</ui-card-title>
            </div>
            <ui-separator />

            <div
              class="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto p-2"
            >
              @for (pdf of homePdfPreviews; track pdf.id) {
                <button
                  uiButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  sound="click"
                  [attr.aria-pressed]="selectedPdfId() === pdf.id"
                  [class]="documentClass(selectedPdfId() === pdf.id)"
                  (click)="selectPdf(pdf.id)"
                >
                  <span class="truncate">{{ pdf.name }}</span>
                </button>
              }
            </div>
          </aside>

          <ui-tabs [(value)]="workspaceTab" class="min-w-0 gap-0 lg:h-full">
            <div
              class="flex h-12 shrink-0 items-center justify-between gap-3 bg-card px-3 lg:hidden"
            >
              <label
                for="home-pdf-template"
                class="text-sm font-medium text-muted-foreground"
              >
                Choose template
              </label>
              <ng-container
                uiSelect
                [value]="selectedPdfId()"
                (valueChange)="selectPdf($any($event))"
              >
                <button
                  uiSelectTrigger
                  id="home-pdf-template"
                  size="sm"
                  aria-label="Choose template"
                  class="w-40 min-w-0 sm:w-48"
                >
                  <ui-select-value />
                </button>
                <ui-select-content align="end">
                  @for (pdf of homePdfPreviews; track pdf.id) {
                    <ui-select-item [value]="pdf.id">{{
                      pdf.name
                    }}</ui-select-item>
                  }
                </ui-select-content>
              </ng-container>
            </div>

            <ui-separator class="lg:hidden" />

            <div
              class="flex h-12 shrink-0 items-center justify-between gap-2 bg-card px-4"
            >
              <ui-tabs-list class="h-8 p-0.5">
                <button
                  uiTabsTrigger
                  value="preview"
                  sound="toggleOn"
                  class="h-7 px-2.5 text-xs"
                >
                  <svg [uiIcon]="Eye" class="size-3.5"></svg>
                  Preview
                </button>
                <button
                  uiTabsTrigger
                  value="code"
                  sound="toggleOn"
                  class="h-7 px-2.5 text-xs"
                >
                  <svg [uiIcon]="CodeXml" class="size-3.5"></svg>
                  Code
                </button>
              </ui-tabs-list>
            </div>

            <ui-separator />

            <ui-tabs-content value="preview" class="min-h-0">
              <app-pdf-preview
                [base]="pdfBase()"
                [name]="selectedPdf().demo"
                class="rounded-none bg-none border-none"
                [height]="672"
              />
            </ui-tabs-content>

            <ui-tabs-content value="code" class="min-h-0">
              <div
                class="relative h-full min-h-140 bg-code text-code-foreground lg:min-h-0"
              >
                <div class="no-scrollbar min-h-0 flex-1 overflow-auto">
                  @if (code.isLoading()) {
                    <div
                      class="flex h-full min-h-72 items-center justify-center text-sm text-code-foreground/60"
                      role="status"
                    >
                      Rendering code…
                    </div>
                  } @else if (code.error(); as error) {
                    <div
                      class="flex h-full min-h-72 items-center justify-center px-6 text-center text-sm text-red-400"
                      role="alert"
                    >
                      {{ error.message }}
                    </div>
                  } @else if (code.value(); as block) {
                    <div class="[&_figure]:mt-0">
                      <docs-code-block [block]="block" />
                    </div>
                  }
                </div>
              </div>
            </ui-tabs-content>
          </ui-tabs>

          <aside
            aria-label="Components used in the selected document"
            class="no-scrollbar border-t bg-card lg:overflow-y-auto lg:border-t-0 lg:border-l"
          >
            <div class="flex h-12 shrink-0 items-center justify-between gap-3 px-4">
              <ui-card-title class="text-sm">Components Used</ui-card-title>
              <span
                uiBadge
                variant="outline"
                class="font-mono text-muted-foreground"
              >
                {{ selectedPdf().componentIds.length }}
              </span>
            </div>
            <ui-separator />

            <ui-card-content class="p-2">
              <div
                class="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-1"
              >
                @for (
                  componentId of selectedPdf().componentIds;
                  track componentId;
                  let index = $index
                ) {
                  @let isSelected = selectedComponentId() === componentId;
                  <button
                    uiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    sound="click"
                    [attr.aria-pressed]="isSelected"
                    [class]="componentClass(isSelected)"
                    (click)="selectComponent(componentId)"
                  >
                    <span
                      uiBadge
                      variant="outline"
                      [class]="badgeClass(isSelected)"
                    >
                      {{ (index + 1).toString().padStart(2, "0") }}
                    </span>
                    <span class="min-w-0 flex-1 truncate font-medium">{{
                      catalog[componentId].label
                    }}</span>
                  </button>
                }
              </div>
            </ui-card-content>

            <ui-separator />

            <ui-card-content class="p-4" aria-live="polite">
              <h3 class="text-lg font-semibold tracking-tight">
                <a
                  [routerLink]="componentDocsUrl()"
                  class="group inline-flex items-center gap-1.5 rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {{ selectedComponent().label }}
                  <svg
                    [uiIcon]="ArrowUpRight"
                    class="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                  ></svg>
                </a>
              </h3>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                {{ selectedComponent().description }}
              </p>

              <div
                class="mt-4 rounded-lg border border-border/70 dark:[&>*>div]:bg-background/60"
              >
                <docs-code-block-command [block]="installBlock()" />
              </div>
            </ui-card-content>
          </aside>
        </ui-card-content>
      </ui-card>
    </div>
  `,
})
export class HomePdfShowcase {
  protected readonly ArrowUpRight = ArrowUpRight;
  protected readonly CodeXml = CodeXml;
  protected readonly Eye = Eye;
  protected readonly File = File;
  protected readonly catalog = homePdfComponentCatalog;
  protected readonly homePdfBases = homePdfBases;
  protected readonly homePdfPreviews = homePdfPreviews;

  protected readonly selectedPdfId = signal("corporate-invoice");
  protected readonly selectedComponentId =
    signal<ComponentPartId>("page-header");
  protected readonly workspaceTab = signal<string | undefined>("preview");
  protected readonly pdfBase = signal<BaseName>("takumi");

  protected readonly selectedPdf = computed(() =>
    findPdf(this.selectedPdfId())
  );
  protected readonly selectedComponent = computed(
    () => homePdfComponentCatalog[this.selectedComponentId()]
  );
  protected readonly componentDocsUrl = computed(
    () =>
      `${ROUTES.DOCS_COMPONENTS}/${this.pdfBase()}/${this.selectedComponentId()}`
  );
  protected readonly installBlock = computed(
    (): Extract<DocNode, { type: "command" }> => ({
      commands: packageManagerCommands(
        addCommand(`${this.pdfBase()}/${this.selectedComponentId()}`)
      ) as Record<PackageManager, string>,
      type: "command",
    })
  );

  protected readonly code = resource({
    loader: ({ params }) => loadCode(params),
    params: () =>
      this.workspaceTab() === "code"
        ? { base: this.pdfBase(), demo: this.selectedPdf().demo }
        : undefined,
  });

  protected documentClass(isSelected: boolean) {
    return cn(
      "h-9 justify-start border px-2 text-left",
      isSelected
        ? "border-border bg-muted text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted"
        : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
    );
  }

  protected componentClass(isSelected: boolean) {
    return cn(
      "h-9 min-w-48 justify-start gap-2.5 border px-2 text-left lg:min-w-0",
      isSelected
        ? "border-blue-500/40 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
        : "border-transparent text-muted-foreground hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
    );
  }

  protected badgeClass(isSelected: boolean) {
    return cn(
      "size-6 bg-background px-0 font-mono",
      isSelected && "border-blue-500/40 text-blue-600"
    );
  }

  protected selectPdf(id: string) {
    this.selectedPdfId.set(id);
    this.selectedComponentId.set(findPdf(id).defaultComponentId);
  }

  protected selectComponent(id: ComponentPartId) {
    this.selectedComponentId.set(id);
    this.workspaceTab.set("preview");
  }
}
