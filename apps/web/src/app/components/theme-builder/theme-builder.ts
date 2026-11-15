import { Clipboard } from "@angular/cdk/clipboard";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  Check,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  Redo2,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Undo2,
} from "lucide";

import { ROUTES } from "@/constants/routes";
import type { BaseName } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { PdfPreview } from "@/src/app/components/pdf-preview";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiSeparator } from "@/src/app/components/ui/separator";
import { UiTooltip } from "@/src/app/components/ui/tooltip";
import { ThemeBuilderStore } from "@/src/app/services/theme-builder";

import { ThemeCodeDialog } from "./theme-code-dialog";
import { ThemeControls } from "./theme-controls";

const BASE_SWITCHER = [
  { href: `${ROUTES.THEME_BUILDER}/takumi`, name: "takumi" },
  { href: `${ROUTES.THEME_BUILDER}/forme`, name: "forme" },
] as const satisfies readonly { href: string; name: BaseName }[];

const SWITCHER_CLASS =
  "h-7 gap-1.5 border border-transparent px-2 text-sm capitalize";
const SWITCHER_ACTIVE_CLASS =
  "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground";

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT");

/** The live PDF preview with the toolbar, the customize panels, and the code dialog. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(document:keydown)": "onKeydown($event)",
    class:
      "flex h-[calc(100svh-var(--header-height))] min-h-[680px] flex-col overflow-hidden border-t bg-background",
  },
  imports: [
    BrandIcon,
    PdfPreview,
    RouterLink,
    ThemeCodeDialog,
    ThemeControls,
    UiButton,
    UiIcon,
    UiSeparator,
    UiTooltip,
  ],
  providers: [ThemeBuilderStore],
  selector: "app-theme-builder",
  template: `
    <div
      class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-6 py-2 max-lg:flex-nowrap max-lg:overflow-x-auto **:data-[slot=separator]:h-5!"
    >
      <div
        class="flex shrink-0 items-center gap-0.5 rounded-lg bg-muted p-0.5"
        role="radiogroup"
        aria-label="PDF renderer base"
      >
        @for (item of baseSwitcher; track item.name) {
          <a
            uiButton
            size="sm"
            variant="ghost"
            [class]="switcherClass(item.name)"
            [attr.aria-current]="base() === item.name"
            [routerLink]="item.href"
          >
            <svg aria-hidden="true" [brandIcon]="item.name"></svg>
            {{ item.name }}
          </a>
        }
      </div>

      <ui-separator class="md:hidden" orientation="vertical" />

      <div class="flex items-center gap-2">
        <button
          uiButton
          aria-label="Undo theme change"
          size="icon-sm"
          variant="ghost"
          uiTooltip="Undo (⌘Z)"
          [disabled]="!store.canUndo()"
          (click)="store.undo()"
        >
          <svg [uiIcon]="Undo2"></svg>
        </button>
        <button
          uiButton
          aria-label="Redo theme change"
          size="icon-sm"
          variant="ghost"
          uiTooltip="Redo (⌘⇧Z)"
          [disabled]="!store.canRedo()"
          (click)="store.redo()"
        >
          <svg [uiIcon]="Redo2"></svg>
        </button>

        <ui-separator orientation="vertical" />

        <button
          uiButton
          aria-label="Reset to preset defaults"
          size="sm"
          variant="outline"
          uiTooltip="Reset to preset defaults"
          (click)="store.loadPreset(store.basePreset())"
        >
          <svg [uiIcon]="RotateCcw"></svg>
          <span class="hidden sm:inline">Reset</span>
        </button>

        <ui-separator orientation="vertical" />

        @if (pdfUrl(); as url) {
          <a
            uiButton
            aria-label="Open PDF in new tab"
            rel="noopener noreferrer"
            size="sm"
            target="_blank"
            variant="outline"
            uiTooltip="Open PDF in new tab"
            [href]="url"
          >
            <span class="hidden sm:inline">Open</span>
            <svg [uiIcon]="ExternalLink"></svg>
          </a>
        } @else {
          <button
            uiButton
            aria-label="Open PDF in new tab"
            disabled
            size="sm"
            variant="outline"
          >
            <span class="hidden sm:inline">Open</span>
            <svg [uiIcon]="ExternalLink"></svg>
          </button>
        }

        <button
          uiButton
          aria-label="Copy share link"
          size="sm"
          variant="outline"
          uiTooltip="Share theme"
          (click)="shareTheme()"
        >
          <svg [uiIcon]="shared() ? Check : Share2"></svg>
          <span class="hidden sm:inline">{{
            shared() ? "Copied" : "Share"
          }}</span>
        </button>

        <ui-separator orientation="vertical" />

        @if (pdfUrl(); as url) {
          <a
            uiButton
            aria-label="Download preview PDF"
            size="sm"
            variant="outline"
            uiTooltip="Download PDF"
            [download]="safeThemeName() + '-preview.pdf'"
            [href]="url"
          >
            <svg [uiIcon]="Download"></svg>
            <span class="hidden md:inline">Download</span>
          </a>
        } @else {
          <button
            uiButton
            aria-label="Download preview PDF"
            disabled
            size="sm"
            variant="outline"
          >
            <svg [uiIcon]="Download"></svg>
            <span class="hidden md:inline">Download</span>
          </button>
        }

        <button
          uiButton
          aria-label="Get theme code"
          class="gap-1.5"
          size="sm"
          uiTooltip="Get theme code"
          (click)="codeOpen.set(true)"
        >
          <svg [uiIcon]="Code2"></svg>
          Code
        </button>
      </div>
    </div>

    <div [class]="gridClass()">
      <section
        class="relative min-h-0 overflow-hidden"
        aria-label="Live PDF preview"
      >
        <app-pdf-preview
          class="h-full rounded-none border-0"
          height="100%"
          name="invoice-classic"
          [base]="base()"
          [theme]="store.theme()"
          (urlChange)="pdfUrl.set($event)"
        />

        <button
          uiButton
          class="absolute right-6 bottom-6 shadow-lg lg:hidden"
          (click)="customizerOpen.set(true)"
        >
          <svg [uiIcon]="SlidersHorizontal"></svg>
          Customize
        </button>

        @if (!sidebarOpen()) {
          <button
            uiButton
            class="absolute right-6 bottom-6 shadow-lg max-lg:hidden"
            (click)="sidebarOpen.set(true)"
          >
            <svg [uiIcon]="SlidersHorizontal"></svg>
            Customize
          </button>
        }

        <div
          [class]="mobilePanelClass()"
          [attr.aria-hidden]="!customizerOpen()"
        >
          <div class="flex items-start justify-between border-b px-6 py-3">
            <div class="min-w-0">
              <h2 class="text-sm font-semibold">Customize theme</h2>
              <p class="text-xs text-muted-foreground">
                Changes render in the preview automatically.
              </p>
            </div>
            <button
              uiButton
              aria-label="Close customize panel"
              size="icon-sm"
              title="Hide panel"
              variant="ghost"
              (click)="customizerOpen.set(false)"
            >
              <svg [uiIcon]="ChevronRight"></svg>
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <app-theme-controls idPrefix="mobile" />
          </div>
        </div>
      </section>

      <aside
        aria-label="Theme controls"
        [class]="sidebarClass()"
        [attr.aria-hidden]="!sidebarOpen()"
      >
        <div class="flex h-full w-[390px] min-h-0 flex-col">
          <div class="flex items-start justify-between border-b px-6 py-2.5">
            <div class="min-w-0">
              <h2 class="text-sm font-semibold">Customize</h2>
              <p class="text-xs text-muted-foreground">
                Changes render in the preview automatically.
              </p>
            </div>
            <button
              uiButton
              aria-label="Close customize panel"
              size="icon-sm"
              title="Hide panel"
              variant="ghost"
              (click)="sidebarOpen.set(false)"
            >
              <svg [uiIcon]="ChevronRight"></svg>
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <app-theme-controls idPrefix="desktop" />
          </div>
        </div>
      </aside>
    </div>

    <app-theme-code-dialog
      [base]="base()"
      [basePreset]="store.basePreset()"
      [theme]="store.theme()"
      [(open)]="codeOpen"
    />
  `,
})
export class ThemeBuilder {
  readonly base = input.required<BaseName>();

  protected readonly store = inject(ThemeBuilderStore);
  private readonly clipboard = inject(Clipboard);

  protected readonly Check = Check;
  protected readonly ChevronRight = ChevronRight;
  protected readonly Code2 = Code2;
  protected readonly Download = Download;
  protected readonly ExternalLink = ExternalLink;
  protected readonly Redo2 = Redo2;
  protected readonly RotateCcw = RotateCcw;
  protected readonly Share2 = Share2;
  protected readonly SlidersHorizontal = SlidersHorizontal;
  protected readonly Undo2 = Undo2;
  protected readonly baseSwitcher = BASE_SWITCHER;

  protected readonly codeOpen = signal(false);
  protected readonly customizerOpen = signal(false);
  protected readonly pdfUrl = signal<string | null>(null);
  protected readonly sidebarOpen = signal(true);
  protected readonly shared = signal(false);
  private sharedTimer?: ReturnType<typeof setTimeout>;

  protected readonly safeThemeName = computed(
    () =>
      this.store
        .theme()
        .name.trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9-]+/g, "-") || "theme"
  );
  protected readonly gridClass = computed(() =>
    cn(
      "grid min-h-0 flex-1 transition-[grid-template-columns] duration-300 ease-in-out",
      this.sidebarOpen()
        ? "lg:grid-cols-[minmax(0,1fr)_390px]"
        : "lg:grid-cols-[minmax(0,1fr)_0px]"
    )
  );
  protected readonly mobilePanelClass = computed(() =>
    cn(
      "absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l bg-background shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
      this.customizerOpen()
        ? "translate-x-0"
        : "pointer-events-none translate-x-full"
    )
  );
  protected readonly sidebarClass = computed(() =>
    cn(
      "hidden min-h-0 flex-col overflow-hidden bg-background lg:flex",
      this.sidebarOpen() && "border-l"
    )
  );

  constructor() {
    // Debounced sync to the URL and localStorage. A base switch drops the hash, so it syncs again.
    effect((onCleanup) => {
      if (!this.store.loaded()) {
        return;
      }
      const snapshot = {
        basePreset: this.store.basePreset(),
        theme: this.store.theme(),
      };
      this.base();
      const timeout = setTimeout(() => this.store.syncToUrl(snapshot), 300);
      onCleanup(() => clearTimeout(timeout));
    });
  }

  protected switcherClass(name: BaseName) {
    return cn(
      SWITCHER_CLASS,
      this.base() === name ? SWITCHER_ACTIVE_CLASS : "text-muted-foreground"
    );
  }

  protected onKeydown(event: KeyboardEvent) {
    if (isEditable(event.target) || !(event.metaKey || event.ctrlKey)) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "z" && !event.shiftKey) {
      event.preventDefault();
      this.store.undo();
    } else if (key === "y" || (key === "z" && event.shiftKey)) {
      event.preventDefault();
      this.store.redo();
    }
  }

  /** The reference toasts here. The button shows "Copied" instead. */
  protected shareTheme() {
    this.store.syncToUrl({
      basePreset: this.store.basePreset(),
      theme: this.store.theme(),
    });
    if (this.clipboard.copy(window.location.href)) {
      this.shared.set(true);
      clearTimeout(this.sharedTimer);
      this.sharedTimer = setTimeout(() => this.shared.set(false), 2000);
    }
  }
}
