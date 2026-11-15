import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import type { TemplateRef } from "@angular/core";

import type { DocNode } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { ConfigService } from "@/src/app/services/config";
import type { InstallationType } from "@/src/app/services/config";
import { FeedbackService } from "@/src/app/services/feedback";

// The reference's Tabs classes merged with its MDX overrides.
const LIST_CLASS = cn(
  "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
  "justify-start gap-4 rounded-none bg-transparent px-0"
);
const TRIGGER_CLASS = cn(
  "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-primary dark:data-[state=active]:border-primary hover:text-primary rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
);
const CONTENT_CLASS = cn(
  "flex-1 outline-none",
  "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0 [&>.steps]:mt-6"
);

/** MDX Tabs. Tabs with the `installation` id share the reference's CodeTabs setting. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "relative mt-6 flex w-full flex-col gap-2",
    "data-slot": "tabs",
  },
  imports: [NgTemplateOutlet],
  selector: "docs-tabs",
  template: `
    <div role="tablist" data-slot="tabs-list" [class]="LIST_CLASS">
      @for (item of block().items; track item.value) {
        <button
          type="button"
          role="tab"
          data-slot="tabs-trigger"
          [class]="TRIGGER_CLASS"
          [attr.aria-selected]="item.value === active()"
          [attr.data-state]="item.value === active() ? 'active' : 'inactive'"
          (click)="select(item.value)"
        >
          {{ item.label }}
        </button>
      }
    </div>
    @for (item of block().items; track item.value) {
      @if (item.value === active()) {
        <div
          role="tabpanel"
          data-slot="tabs-content"
          data-state="active"
          [class]="CONTENT_CLASS"
        >
          <ng-container
            *ngTemplateOutlet="content(); context: { $implicit: item.children }"
          />
        </div>
      }
    }
  `,
})
export class DocsTabs {
  readonly block = input.required<Extract<DocNode, { type: "tabs" }>>();
  readonly content = input.required<TemplateRef<{ $implicit: DocNode[] }>>();

  protected readonly LIST_CLASS = LIST_CLASS;
  protected readonly TRIGGER_CLASS = TRIGGER_CLASS;
  protected readonly CONTENT_CLASS = CONTENT_CLASS;
  private readonly config = inject(ConfigService);
  private readonly feedback = inject(FeedbackService);
  private readonly local = signal<string | null>(null);

  protected readonly active = computed(() => {
    const { id, items } = this.block();
    const selected =
      id === "installation"
        ? this.config.config().installationType
        : this.local();
    return items.some((item) => item.value === selected)
      ? selected
      : items[0]?.value;
  });

  protected select(value: string) {
    this.feedback.play("tabSwitch");
    if (this.block().id === "installation") {
      this.config.config.set({ installationType: value as InstallationType });
    } else {
      this.local.set(value);
    }
  }
}
