import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { DocsSidebar } from "@/src/app/components/docs/docs-sidebar";
import { tree } from "@/src/app/lib/docs-source";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "container-wrapper flex flex-1 flex-col px-2" },
  imports: [DocsSidebar, RouterOutlet],
  template: `
    <div
      data-slot="sidebar-wrapper"
      style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem"
      class="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex w-full 3xl:fixed:container 3xl:fixed:px-3 min-h-min flex-1 items-start px-0 [--sidebar-width:220px] [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--sidebar-width:240px] lg:[--top-spacing:calc(var(--spacing)*4)]"
    >
      <docs-sidebar [tree]="tree" />
      <div class="h-full w-full"><router-outlet /></div>
    </div>
  `,
})
export default class DocsLayout {
  protected readonly tree = tree;
}
