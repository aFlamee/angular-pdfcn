import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Renderer2,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";

import { BRAND_ICONS } from "@/lib/brand-icons";
import type { BrandIconName, SvgNode } from "@/lib/brand-icons";
import { cn } from "@/lib/utils";

/** Sets each attribute in the record on the host. */
@Directive({ selector: "[svgAttrs]" })
export class SvgAttrs {
  readonly svgAttrs = input.required<Record<string, string>>();

  constructor() {
    const renderer = inject(Renderer2);
    const element = inject(ElementRef).nativeElement as Element;
    effect(() => {
      for (const [name, value] of Object.entries(this.svgAttrs())) {
        renderer.setAttribute(element, name, value);
      }
    });
  }
}

/** A brand or file-type icon: `<svg brandIcon="github"></svg>`. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.fill]": "attrs()['fill']",
    "[attr.stroke-linecap]": "attrs()['stroke-linecap']",
    "[attr.stroke-linejoin]": "attrs()['stroke-linejoin']",
    "[attr.stroke-width]": "attrs()['stroke-width']",
    "[attr.stroke]": "attrs()['stroke']",
    "[attr.viewBox]": "attrs()['viewBox']",
    "[class]": "classes()",
    "aria-hidden": "true",
    xmlns: "http://www.w3.org/2000/svg",
  },
  imports: [NgTemplateOutlet, SvgAttrs],
  selector: "svg[brandIcon]",
  template: `
    <ng-template #list let-nodes>
      @for (node of nodes; track $index) {
        @switch (node[0]) {
          @case ("path") {
            <svg:path [svgAttrs]="node[1]" />
          }
          @case ("rect") {
            <svg:rect [svgAttrs]="node[1]" />
          }
          @case ("stop") {
            <svg:stop [svgAttrs]="node[1]" />
          }
          @case ("defs") {
            <svg:defs>
              <ng-container
                *ngTemplateOutlet="list; context: { $implicit: node[2] }"
              />
            </svg:defs>
          }
          @case ("linearGradient") {
            <svg:linearGradient [svgAttrs]="node[1]">
              <ng-container
                *ngTemplateOutlet="list; context: { $implicit: node[2] }"
              />
            </svg:linearGradient>
          }
        }
      }
    </ng-template>
    <ng-container *ngTemplateOutlet="list; context: { $implicit: nodes() }" />
  `,
})
export class BrandIcon {
  readonly brandIcon = input.required<BrandIconName>();
  readonly class = input("");

  protected readonly attrs = computed<Record<string, string | undefined>>(
    () => BRAND_ICONS[this.brandIcon()].attrs
  );
  protected readonly nodes = computed<SvgNode[]>(
    () => BRAND_ICONS[this.brandIcon()].nodes
  );
  protected readonly classes = computed(() =>
    cn(this.attrs()["class"], this.class())
  );
}
