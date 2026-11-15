import { Clipboard } from "@angular/cdk/clipboard";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import type { WritableSignal } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import type { SafeHtml } from "@angular/platform-browser";
import { Check, Copy, Download } from "lucide";
import type { HighlighterCore } from "shiki/core";

import type { BaseName } from "@/lib/content/types";
import {
  generateDeltaCode,
  generateInstallCommand,
  generateThemeCode,
  generateUsageCode,
} from "@/lib/theme-builder/generate-code";
import { getRemoteFontFamilies } from "@/lib/theme-builder/preview-fonts";
import { cn } from "@/lib/utils";
import type { PdfcnTheme, ThemePresetName } from "@/registry/themes";
import { CopyButton } from "@/src/app/components/copy-button";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiDialog,
  UiDialogContent,
  UiDialogDescription,
  UiDialogHeader,
  UiDialogTitle,
} from "@/src/app/components/ui/dialog";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiPortal } from "@/src/app/components/ui/overlay";

type CodeTab = "delta" | "full";
type CodeLanguage = "angular-ts" | "ts";

const TAB_CLASS = "h-7 rounded-none px-3 text-xs";
const ACTIVE_TAB_CLASS =
  "bg-foreground text-background hover:bg-foreground hover:text-background";

const createHighlighter = async () => {
  const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
    await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
  return createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [
      import("shiki/langs/angular-ts.mjs"),
      import("shiki/langs/typescript.mjs"),
    ],
    themes: [
      import("shiki/themes/github-dark.mjs"),
      import("shiki/themes/github-light.mjs"),
    ],
  });
};

let highlighter: Promise<HighlighterCore> | undefined;

/** The reference's `highlightCode`, loaded on first use with only the grammars the dialog shows. */
const highlightCode = async (code: string, lang: CodeLanguage) => {
  highlighter ??= createHighlighter();
  const shiki = await highlighter;
  return shiki.codeToHtml(code, {
    defaultColor: false,
    lang,
    themes: { dark: "github-dark", light: "github-light" },
    transformers: [
      {
        code(node) {
          node.properties["data-line-numbers"] = "";
        },
        line(node) {
          node.properties["data-line"] = "";
        },
        pre(node) {
          node.properties["class"] =
            "no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0 !bg-transparent";
        },
      },
    ],
  });
};

/** The exported theme file, full or as a delta from its preset, and how to use it. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    CopyButton,
    UiButton,
    UiDialog,
    UiDialogContent,
    UiDialogDescription,
    UiDialogHeader,
    UiDialogTitle,
    UiIcon,
    UiPortal,
  ],
  selector: "app-theme-code-dialog",
  template: `
    <ng-container uiDialog [(open)]="open">
      <ui-dialog-content
        *uiPortal
        class="flex max-h-[85svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        <div uiDialogHeader class="border-b p-5 pr-12">
          <h2 uiDialogTitle>Generated theme code</h2>
          <p uiDialogDescription>
            Copy into
            <code class="rounded bg-muted px-1 py-0.5 font-mono text-[10px]"
              >src/lib/{{ safeName() }}.ts</code
            >
            in your project and pass it to any themed pdfcn document.
          </p>
        </div>
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2"
        >
          <div class="flex overflow-hidden rounded-lg border bg-background">
            <button
              uiButton
              size="sm"
              variant="ghost"
              [class]="tabClass('full', 'border-0')"
              (click)="tab.set('full')"
            >
              Full theme
            </button>
            <button
              uiButton
              size="sm"
              variant="ghost"
              [class]="tabClass('delta', 'border-l')"
              (click)="tab.set('delta')"
            >
              Delta from <span class="capitalize">{{ basePreset() }}</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button uiButton size="sm" variant="ghost" (click)="downloadCode()">
              <svg [uiIcon]="Download"></svg>
              Download .ts
            </button>
            <button uiButton size="sm" variant="outline" (click)="copyCode()">
              <svg [uiIcon]="copied() ? Check : Copy"></svg>
              {{ copied() ? "Copied" : "Copy" }}
            </button>
          </div>
        </div>
        @if (tab() === "full" && remoteFonts().length > 0) {
          <div class="border-b border-amber-500/20 bg-amber-500/10 px-5 py-3">
            <p class="text-[11px] text-amber-900 dark:text-amber-200">
              <strong class="font-semibold">Production note:</strong> this theme
              uses {{ remoteFontList() }} from jsDelivr at runtime. For offline
              or restricted deployments, self-host those font files or switch to
              built-in fonts before release.
            </p>
          </div>
        }
        <div class="min-h-0 flex-1 overflow-auto bg-code [&_pre]:m-0">
          @if (codeHtml(); as html) {
            <div dir="ltr" [innerHTML]="html"></div>
          } @else {
            <pre
              class="p-5 font-mono text-xs leading-relaxed text-code-foreground"
            ><code>{{ code() }}</code></pre>
          }
          <div class="space-y-3 border-t border-border/50 px-5 py-4">
            <p class="text-[11px] text-muted-foreground">
              <strong class="text-foreground/70">Usage:</strong> install the
              theme provider, then pass the theme to
              <code class="font-mono">&lt;pdf-theme-provider [theme]&gt;</code>
              around your PDF content.
            </p>
            <div class="relative rounded-md border border-border/50">
              <pre
                class="no-scrollbar overflow-x-auto py-3 pr-12 pl-4 font-mono text-xs text-code-foreground"
              ><code><span class="select-none">$ </span>{{ installCommand() }}</code></pre>
              <app-copy-button
                class="top-1.5 right-1.5"
                [value]="installCommand()"
              />
            </div>
            <div class="relative rounded-md border border-border/50">
              @if (usageHtml(); as html) {
                <div dir="ltr" [innerHTML]="html"></div>
              } @else {
                <pre
                  class="p-4 font-mono text-xs leading-relaxed text-code-foreground"
                ><code>{{ usageCode() }}</code></pre>
              }
              <app-copy-button
                class="top-1.5 right-1.5"
                [value]="usageCode()"
              />
            </div>
          </div>
        </div>
        <div class="border-t bg-muted/20 px-5 py-3">
          <p class="text-[11px] text-muted-foreground">
            <strong class="text-foreground/70">Tip:</strong> use the
            <strong class="text-foreground/70">Delta</strong> tab if you only
            changed a few values. It shows a minimal override of your base
            preset.
          </p>
        </div>
      </ui-dialog-content>
    </ng-container>
  `,
})
export class ThemeCodeDialog {
  readonly base = input.required<BaseName>();
  readonly basePreset = input.required<ThemePresetName>();
  readonly theme = input.required<PdfcnTheme>();
  readonly open = model(false);

  protected readonly Check = Check;
  protected readonly Copy = Copy;
  protected readonly Download = Download;
  protected readonly copied = signal(false);
  protected readonly tab = signal<CodeTab>("full");
  protected readonly codeHtml = signal<SafeHtml | null>(null);
  protected readonly usageHtml = signal<SafeHtml | null>(null);
  private readonly clipboard = inject(Clipboard);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly code = computed(() =>
    this.tab() === "full"
      ? generateThemeCode(this.theme())
      : generateDeltaCode(this.theme(), this.basePreset())
  );
  protected readonly remoteFonts = computed(() =>
    getRemoteFontFamilies([
      this.theme().typography.body.fontFamily,
      this.theme().typography.heading.fontFamily,
    ])
  );
  protected readonly remoteFontList = computed(() =>
    this.remoteFonts()
      .map((font) => `'${font}'`)
      .join(" and ")
  );
  protected readonly safeName = computed(
    () =>
      this.theme()
        .name.trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9-]+/g, "-") || "custom-theme"
  );
  protected readonly installCommand = computed(() =>
    generateInstallCommand(
      this.base(),
      this.tab() === "delta" ? this.basePreset() : undefined
    )
  );
  protected readonly usageCode = computed(() =>
    generateUsageCode(this.safeName())
  );

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.copied.set(false);
        this.tab.set("full");
      }
    });
    this.highlightWhileOpen(this.code, this.codeHtml, "ts");
    this.highlightWhileOpen(this.usageCode, this.usageHtml, "angular-ts");
  }

  protected tabClass(tab: CodeTab, edge: string) {
    return cn(
      TAB_CLASS,
      edge,
      this.tab() === tab ? ACTIVE_TAB_CLASS : "text-muted-foreground"
    );
  }

  protected copyCode() {
    if (this.clipboard.copy(this.code())) {
      this.copied.set(true);
    }
  }

  protected downloadCode() {
    const objectUrl = URL.createObjectURL(
      new Blob([this.code()], { type: "text/typescript;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.download = `${this.safeName()}.ts`;
    link.href = objectUrl;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  private highlightWhileOpen(
    source: () => string,
    target: WritableSignal<SafeHtml | null>,
    lang: CodeLanguage
  ) {
    effect((onCleanup) => {
      if (!this.open()) {
        return;
      }
      const code = source();
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });
      const render = async () => {
        const html = await highlightCode(code, lang);
        if (!cancelled) {
          // Shiki escapes the code it highlights.
          target.set(this.sanitizer.bypassSecurityTrustHtml(html));
        }
      };
      render();
    });
  }
}
