import { Clipboard } from "@angular/cdk/clipboard";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Download, SquareDashed, Type } from "lucide";

import {
  LogoMark,
  getLogoMarkSVG,
  getLogoTypeSVG,
} from "@/src/app/components/logo";
import {
  UiContextMenu,
  UiContextMenuContent,
  UiContextMenuItem,
  UiContextMenuSeparator,
  UiContextMenuTrigger,
} from "@/src/app/components/ui/context-menu";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiPortal } from "@/src/app/components/ui/overlay";
import { ThemeService } from "@/src/app/services/theme";

/** Right-clicking the projected logo offers the shadcn-labs brand assets. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [
    LogoMark,
    UiContextMenu,
    UiContextMenuContent,
    UiContextMenuItem,
    UiContextMenuSeparator,
    UiContextMenuTrigger,
    UiIcon,
    UiPortal,
  ],
  selector: "app-brand-context-menu",
  template: `
    <ng-container uiContextMenu>
      <span uiContextMenuTrigger class="contents"><ng-content /></span>
      <ui-context-menu-content *uiPortal>
        <button uiContextMenuItem type="button" (click)="copy(getLogoMarkSVG)">
          <svg appLogoMark></svg>
          Copy Logomark as SVG
        </button>
        <button uiContextMenuItem type="button" (click)="copy(getLogoTypeSVG)">
          <svg [uiIcon]="Type"></svg>
          Copy Logotype as SVG
        </button>
        <ui-context-menu-separator />
        <a
          uiContextMenuItem
          href="https://shadcn-labs.com/brand"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg [uiIcon]="SquareDashed"></svg>
          Brand Guidelines
        </a>
        <a
          uiContextMenuItem
          href="https://shadcn-labs.com/shadcn-labs-brand.zip"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg [uiIcon]="Download"></svg>
          Download Brand Assets
        </a>
      </ui-context-menu-content>
    </ng-container>
  `,
})
export class BrandContextMenu {
  protected readonly Download = Download;
  protected readonly SquareDashed = SquareDashed;
  protected readonly Type = Type;
  protected readonly getLogoMarkSVG = getLogoMarkSVG;
  protected readonly getLogoTypeSVG = getLogoTypeSVG;
  private readonly clipboard = inject(Clipboard);
  private readonly theme = inject(ThemeService);

  protected copy(svg: (color: string) => string) {
    this.clipboard.copy(
      svg(this.theme.resolvedTheme() === "light" ? "#000" : "#fff")
    );
  }
}
