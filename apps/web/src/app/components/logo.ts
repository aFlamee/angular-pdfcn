import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

import { cn } from "@/lib/utils";

const MARK_COLOR = "#ea580c";

/** The mark as an SVG string, with the letters cut out of a rounded square. */
export const getLogoMarkSVG = (color: string) =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Logo"><mask id="m"><rect width="64" height="64" fill="#fff"/><text x="32" y="32" dy="0.35em" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="600" fill="#000">AP</text></mask><rect width="64" height="64" rx="14" fill="${color}" mask="url(#m)"/></svg>`;

/** The angular-pdfcn mark. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
    viewBox: "0 0 64 64",
    xmlns: "http://www.w3.org/2000/svg",
  },
  selector: "svg[appLogoMark]",
  template: `
    <svg:rect width="64" height="64" rx="14" [attr.fill]="color" />
    <svg:text
      x="32"
      y="32"
      dy="0.35em"
      text-anchor="middle"
      font-family="ui-sans-serif, system-ui, sans-serif"
      font-size="26"
      font-weight="600"
      fill="#ffffff"
    >
      AP
    </svg:text>
  `,
})
export class LogoMark {
  readonly class = input("");
  protected readonly color = MARK_COLOR;
  protected readonly classes = computed(() => cn("size-4", this.class()));
}
