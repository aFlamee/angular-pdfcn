import { Clipboard } from "@angular/cdk/clipboard";
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  ArrowRight,
  CircleDashed,
  CornerDownLeft,
  DollarSign,
  FileText,
} from "lucide";

import { packageManagerCommands } from "@/lib/content/commands";
import type { DocsTree, PackageManager } from "@/lib/content/types";
import { addCommand } from "@/lib/install";
import { getCurrentBase, getTreeGroups } from "@/lib/page-tree";
import { themePresets } from "@/registry/themes";
import { injectPathname } from "@/src/app/components/app-routes";
import { isTypingTarget } from "@/src/app/components/hotkey";
import type { NavItem } from "@/src/app/components/main-nav";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiCommand,
  UiCommandEmpty,
  UiCommandGroup,
  UiCommandInput,
  UiCommandItem,
  UiCommandList,
} from "@/src/app/components/ui/command";
import {
  UiDialog,
  UiDialogContent,
  UiDialogDescription,
  UiDialogHeader,
  UiDialogTitle,
  UiDialogTrigger,
} from "@/src/app/components/ui/dialog";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiKbd } from "@/src/app/components/ui/kbd";
import { UiPortal } from "@/src/app/components/ui/overlay";
import { UiSeparator } from "@/src/app/components/ui/separator";
import { ConfigService } from "@/src/app/services/config";
import { FeedbackService } from "@/src/app/services/feedback";

type DocUrlKind =
  | { kind: "theme"; slug: string }
  | { kind: "component"; slug: string }
  | { kind: "block"; slug: string }
  | { kind: "page" };

interface CommandEntry {
  value: string;
  keywords: string[];
  label: string;
  url: string;
  parsed: DocUrlKind;
}

const GROUP_HEADING_CLS =
  "!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1";

const ITEM_CLS =
  "data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-9 rounded-md border border-transparent px-3! font-medium";

const parseDocPageUrl = (url: string): DocUrlKind => {
  const parts = url.split("/").filter(Boolean);
  const themesIdx = parts.indexOf("themes");
  if (themesIdx !== -1 && parts[themesIdx + 1]) {
    return { kind: "theme", slug: parts[themesIdx + 1] };
  }
  const componentsIdx = parts.indexOf("components");
  if (componentsIdx !== -1 && parts[componentsIdx + 1]) {
    return { kind: "component", slug: parts.at(-1) ?? "" };
  }
  const templatesIdx = parts.indexOf("blocks");
  if (templatesIdx !== -1 && parts[templatesIdx + 1]) {
    return { kind: "block", slug: parts.at(-1) ?? "" };
  }
  return { kind: "page" };
};

const searchKeywordsFromUrl = (url: string) => {
  const segments = url.split("/").filter(Boolean);
  return segments.flatMap((segment) =>
    segment.includes("-") ? [segment, ...segment.split("-")] : [segment]
  );
};

const buildDocPageKeywords = (
  parsed: DocUrlKind,
  url: string,
  breadcrumb: string[]
): string[] => [
  ...(parsed.kind === "page" ? [] : [parsed.kind]),
  ...breadcrumb.filter(Boolean).flatMap((s) => [s, s.toLowerCase()]),
  ...searchKeywordsFromUrl(url),
];

const themePrimary = (slug: string) =>
  (themePresets as Record<string, { colors: { primary: string } } | undefined>)[
    slug
  ]?.colors.primary ?? null;

/** The install command for a theme, component or block page, in the chosen package manager. */
const installCommand = (
  parsed: DocUrlKind,
  base: string,
  packageManager: PackageManager
) => {
  if (parsed.kind === "page") {
    return "";
  }
  const name =
    parsed.kind === "theme" ? `theme-${parsed.slug}` : `${base}/${parsed.slug}`;
  return packageManagerCommands(addCommand(name))?.[packageManager] ?? "";
};

/** The docs search: nav pages and the page tree. Cmd/Ctrl+K or / opens it. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown)": "onKeydown($event)", class: "contents" },
  imports: [
    UiButton,
    UiCommand,
    UiCommandEmpty,
    UiCommandGroup,
    UiCommandInput,
    UiCommandItem,
    UiCommandList,
    UiDialog,
    UiDialogContent,
    UiDialogDescription,
    UiDialogHeader,
    UiDialogTitle,
    UiDialogTrigger,
    UiIcon,
    UiKbd,
    UiPortal,
    UiSeparator,
  ],
  selector: "app-command-menu",
  template: `
    <ng-container uiDialog sounds [(open)]="open">
      <button
        uiButton
        uiDialogTrigger
        type="button"
        variant="secondary"
        class="bg-surface text-surface-foreground/60 dark:bg-card relative h-8 w-full justify-start pl-2.5 font-normal shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64"
      >
        <span class="hidden lg:inline-flex">Search documentation...</span>
        <span class="inline-flex lg:hidden">Search...</span>
        <div class="absolute top-1.5 right-1.5 hidden gap-1 sm:flex">
          <kbd uiKbd>{{ modKey() }}</kbd>
          <kbd uiKbd class="aspect-square">K</kbd>
        </div>
      </button>
      <ui-dialog-content
        *uiPortal
        [showCloseButton]="false"
        class="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
      >
        <div uiDialogHeader class="sr-only">
          <h2 uiDialogTitle>Search documentation...</h2>
          <p uiDialogDescription>Search for a command to run...</p>
        </div>
        <ui-command
          class="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:h-9! **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:h-9! **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border"
          (valueChange)="highlighted.set($event)"
        >
          <ui-command-input placeholder="Search documentation..." />
          <ui-command-list
            class="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5"
          >
            <ui-command-empty
              class="text-muted-foreground py-12 text-center text-sm"
              >No results found.</ui-command-empty
            >
            @for (group of groups(); track group.heading) {
              <ui-command-group
                [heading]="group.heading"
                [class]="GROUP_HEADING_CLS"
              >
                @for (entry of group.entries; track entry.url) {
                  <ui-command-item
                    [value]="entry.value"
                    [keywords]="entry.keywords"
                    [class]="ITEM_CLS"
                    (select)="go(entry.url)"
                  >
                    @switch (entry.parsed.kind) {
                      @case ("theme") {
                        <span
                          class="border-border/60 size-4 shrink-0 rounded-sm border"
                          [style.background-color]="themeColor(entry.parsed)"
                          aria-hidden="true"
                        ></span>
                      }
                      @case ("component") {
                        <svg [uiIcon]="CircleDashed"></svg>
                      }
                      @case ("block") {
                        <svg
                          [uiIcon]="
                            entry.url.includes('invoice')
                              ? DollarSign
                              : FileText
                          "
                        ></svg>
                      }
                      @default {
                        <svg [uiIcon]="ArrowRight"></svg>
                      }
                    }
                    {{ entry.label }}
                  </ui-command-item>
                }
              </ui-command-group>
            }
          </ui-command-list>
        </ui-command>
        <div
          class="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 overflow-hidden rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium dark:border-t-neutral-700 dark:bg-neutral-800"
        >
          <div class="flex items-center gap-2 shrink-0">
            <kbd uiKbd class="shrink-0"
              ><svg [uiIcon]="CornerDownLeft"></svg
            ></kbd>
            @if (highlightedEntry()) {
              <span class="min-w-0 truncate">Go to Page</span>
            }
          </div>
          @if (copyPayload(); as payload) {
            <ui-separator orientation="vertical" class="h-4!" />
            <div class="flex min-w-0 items-center gap-1">
              <kbd uiKbd class="shrink-0">{{ modKey() }}</kbd>
              <kbd uiKbd class="shrink-0">C</kbd>
              <span class="min-w-0 truncate">{{ payload }}</span>
            </div>
          }
        </div>
      </ui-dialog-content>
    </ng-container>
  `,
})
export class CommandMenu {
  readonly navItems = input.required<NavItem[]>();
  readonly tree = input.required<DocsTree>();

  protected readonly ArrowRight = ArrowRight;
  protected readonly CircleDashed = CircleDashed;
  protected readonly CornerDownLeft = CornerDownLeft;
  protected readonly DollarSign = DollarSign;
  protected readonly FileText = FileText;
  protected readonly GROUP_HEADING_CLS = GROUP_HEADING_CLS;
  protected readonly ITEM_CLS = ITEM_CLS;

  protected readonly open = signal(false);
  protected readonly highlighted = signal("");
  /** Mac until the browser says otherwise, like the reference. */
  protected readonly modKey = signal("⌘");

  private readonly router = inject(Router);
  private readonly clipboard = inject(Clipboard);
  private readonly feedback = inject(FeedbackService);
  private readonly packageManager = inject(ConfigService).packageManager;
  private readonly pathname = injectPathname();
  private readonly currentBase = computed(() =>
    getCurrentBase(this.pathname())
  );

  protected readonly groups = computed(() => [
    {
      entries: this.navItems().map(
        (item): CommandEntry => ({
          keywords: ["nav", "navigation", item.label.toLowerCase()],
          label: item.label,
          parsed: { kind: "page" },
          url: item.href,
          value: `Navigation ${item.label}`,
        })
      ),
      heading: "Pages",
    },
    ...getTreeGroups(this.tree(), this.currentBase()).map((group) => ({
      entries: group.pages.map((page): CommandEntry => {
        const parsed = parseDocPageUrl(page.url);
        return {
          keywords: buildDocPageKeywords(parsed, page.url, [group.label]),
          label: page.name,
          parsed,
          url: page.url,
          value: [group.label, page.name].filter(Boolean).join(" "),
        };
      }),
      heading: group.label,
    })),
  ]);
  protected readonly highlightedEntry = computed(() =>
    this.groups()
      .flatMap((group) => group.entries)
      .find((entry) => entry.value === this.highlighted())
  );
  protected readonly copyPayload = computed(() => {
    const entry = this.highlightedEntry();
    return entry
      ? installCommand(entry.parsed, this.currentBase(), this.packageManager())
      : "";
  });

  constructor() {
    afterNextRender(() => {
      if (!navigator.platform.toUpperCase().includes("MAC")) {
        this.modKey.set("Ctrl");
      }
    });
  }

  protected themeColor(parsed: DocUrlKind) {
    return parsed.kind === "theme" ? themePrimary(parsed.slug) : null;
  }

  protected go(url: string) {
    this.open.set(false);
    void this.router.navigateByUrl(url);
  }

  protected onKeydown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    if ((event.key === "k" && mod) || event.key === "/") {
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      this.open.update((open) => !open);
    }
    const payload = this.copyPayload();
    if (event.key === "c" && mod && this.open() && payload) {
      this.open.set(false);
      this.feedback.play("copy");
      this.clipboard.copy(payload);
    }
  }
}
