import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Download } from "lucide";

import type { BaseName } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { PdfcnTheme } from "@/registry/themes";
import { UiButton } from "@/src/app/components/ui/button";
import { UiIcon } from "@/src/app/components/ui/icon";
import { renderPreviewPdf } from "@/src/app/lib/render-preview";
import { MediaQueryService } from "@/src/app/services/media-query";

/** Renders a demo, or Invoice Classic in a theme, to a PDF in the browser and shows it in an iframe. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
    "[style.min-height]": "heightCss()",
    "data-slot": "pdf-preview",
  },
  imports: [UiButton, UiIcon],
  selector: "app-pdf-preview",
  template: `
    @if (error(); as message) {
      <div
        class="flex items-center justify-center p-8 text-sm text-muted-foreground"
        [style.min-height]="heightCss()"
      >
        {{ message }}
      </div>
    } @else if (!url()) {
      <div
        class="flex items-center justify-center p-8 text-sm text-muted-foreground"
        [style.min-height]="heightCss()"
      >
        Rendering PDF…
      </div>
    } @else if (media.isMobile()) {
      <div
        class="flex flex-col items-center justify-center gap-4 bg-muted/10 p-6"
        [style.min-height]="heightCss()"
      >
        <p class="text-sm text-muted-foreground text-center">
          PDF preview is optimized for larger screens.
        </p>
        <a uiButton [href]="safeUrl()" [download]="name() + '.pdf'">
          <svg [uiIcon]="Download"></svg>
          Download PDF
        </a>
      </div>
    } @else {
      <iframe
        class="block w-full bg-background"
        [src]="frameUrl()"
        [style.height]="heightCss()"
        [title]="name() + ' PDF preview'"
      ></iframe>
    }
  `,
})
export class PdfPreview {
  readonly base = input.required<BaseName>();
  readonly name = input.required<string>();
  readonly theme = input<PdfcnTheme>();
  readonly height = input<number | string>(640);
  readonly class = input("");
  readonly urlChange = output<string | null>();

  protected readonly Download = Download;
  protected readonly media = inject(MediaQueryService);
  protected readonly url = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly classes = computed(() =>
    cn("block overflow-hidden rounded-lg border bg-muted/30", this.class())
  );
  protected readonly heightCss = computed(() => {
    const height = this.height();
    return typeof height === "number" ? `${height}px` : height;
  });
  // Blob URLs we created ourselves.
  protected readonly safeUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustUrl(this.url() ?? "")
  );
  protected readonly frameUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.url()}#toolbar=1&navpanes=0`
    )
  );

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    let current: string | undefined;
    const revoke = () => {
      if (current) {
        URL.revokeObjectURL(current);
        current = undefined;
        this.urlChange.emit(null);
      }
    };
    inject(DestroyRef).onDestroy(revoke);

    effect((onCleanup) => {
      const base = this.base();
      const name = this.name();
      const theme = this.theme();
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
        revoke();
      });
      this.url.set(null);
      this.error.set(null);

      const render = async () => {
        try {
          const bytes = await renderPreviewPdf(base, name, theme);
          const next = URL.createObjectURL(
            new Blob([bytes as BlobPart], { type: "application/pdf" })
          );
          if (cancelled) {
            URL.revokeObjectURL(next);
            return;
          }
          current = next;
          this.url.set(next);
          this.urlChange.emit(next);
        } catch (renderError) {
          if (!cancelled) {
            this.error.set(
              renderError instanceof Error
                ? renderError.message
                : "Failed to render PDF"
            );
          }
        }
      };
      render();
    });
  }
}
