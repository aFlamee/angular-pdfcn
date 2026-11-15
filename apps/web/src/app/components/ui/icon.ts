import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { IconNode } from "lucide";

/** A lucide icon: `<svg [uiIcon]="Copy"></svg>`. Lucide only draws these elements. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "aria-hidden": "true",
    fill: "none",
    height: "24",
    stroke: "currentColor",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    width: "24",
    xmlns: "http://www.w3.org/2000/svg",
  },
  selector: "svg[uiIcon]",
  template: `
    @for (node of uiIcon(); track $index) {
      @let a = node[1];
      @switch (node[0]) {
        @case ("path") {
          <svg:path [attr.d]="a['d']" />
        }
        @case ("circle") {
          <svg:circle
            [attr.cx]="a['cx']"
            [attr.cy]="a['cy']"
            [attr.r]="a['r']"
            [attr.fill]="a['fill']"
          />
        }
        @case ("ellipse") {
          <svg:ellipse
            [attr.cx]="a['cx']"
            [attr.cy]="a['cy']"
            [attr.rx]="a['rx']"
            [attr.ry]="a['ry']"
          />
        }
        @case ("line") {
          <svg:line
            [attr.x1]="a['x1']"
            [attr.x2]="a['x2']"
            [attr.y1]="a['y1']"
            [attr.y2]="a['y2']"
          />
        }
        @case ("polygon") {
          <svg:polygon [attr.points]="a['points']" />
        }
        @case ("polyline") {
          <svg:polyline [attr.points]="a['points']" />
        }
        @case ("rect") {
          <svg:rect
            [attr.x]="a['x']"
            [attr.y]="a['y']"
            [attr.width]="a['width']"
            [attr.height]="a['height']"
            [attr.rx]="a['rx']"
            [attr.ry]="a['ry']"
          />
        }
      }
    }
  `,
})
export class UiIcon {
  readonly uiIcon = input.required<IconNode>();
}
