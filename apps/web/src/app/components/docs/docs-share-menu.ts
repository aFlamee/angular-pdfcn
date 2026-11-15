import { Clipboard } from "@angular/cdk/clipboard";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { Ellipsis, Link, Share } from "lucide";

import { BrandIcon } from "@/src/app/components/brand-icon";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiDropdownMenu,
  UiDropdownMenuContent,
  UiDropdownMenuItem,
  UiDropdownMenuTrigger,
} from "@/src/app/components/ui/dropdown-menu";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiPortal } from "@/src/app/components/ui/overlay";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BrandIcon,
    UiButton,
    UiDropdownMenu,
    UiDropdownMenuContent,
    UiDropdownMenuItem,
    UiDropdownMenuTrigger,
    UiIcon,
    UiPortal,
  ],
  selector: "docs-share-menu",
  template: `
    <ng-container uiDropdownMenu sounds>
      <button
        uiButton
        uiDropdownMenuTrigger
        type="button"
        class="hidden sm:flex size-7 border-none active:scale-none"
        variant="secondary"
        size="icon-sm"
      >
        <svg [uiIcon]="Share"></svg>
      </button>
      <ui-dropdown-menu-content *uiPortal class="w-fit" [alignOffset]="-6">
        <button
          uiDropdownMenuItem
          type="button"
          sound="copy"
          (click)="clipboard.copy(url())"
        >
          <svg [uiIcon]="Link"></svg>
          Copy link
        </button>
        <a
          uiDropdownMenuItem
          sound="click"
          [href]="'https://x.com/intent/tweet?url=' + urlEncoded()"
          target="_blank"
          rel="noopener"
        >
          <svg brandIcon="x"></svg>
          Share on X
        </a>
        <a
          uiDropdownMenuItem
          sound="click"
          [href]="
            'https://www.linkedin.com/sharing/share-offsite?url=' + urlEncoded()
          "
          target="_blank"
          rel="noopener"
        >
          <svg brandIcon="linkedIn"></svg>
          Share on LinkedIn
        </a>
        @if (canShare) {
          <button
            uiDropdownMenuItem
            type="button"
            sound="click"
            (click)="share()"
          >
            <svg [uiIcon]="Ellipsis"></svg>
            Other app
          </button>
        }
      </ui-dropdown-menu-content>
    </ng-container>
  `,
})
export class DocsShareMenu {
  readonly title = input.required<string>();
  /** The page's absolute URL. */
  readonly url = input.required<string>();

  protected readonly Ellipsis = Ellipsis;
  protected readonly Link = Link;
  protected readonly Share = Share;
  protected readonly clipboard = inject(Clipboard);
  protected readonly urlEncoded = computed(() =>
    encodeURIComponent(this.url())
  );
  /** The menu content renders only in the browser. */
  protected readonly canShare =
    typeof navigator !== "undefined" && "share" in navigator;

  protected share() {
    void navigator.share({ title: this.title(), url: this.url() });
  }
}
