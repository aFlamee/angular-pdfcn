import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { Plus } from "lucide";

import { LINK } from "@/constants/links";
import type { tiers } from "@/lib/sponsors";
import { SponsorLogo } from "@/src/app/components/sponsor/sponsor-logo";
import { UiIcon } from "@/src/app/components/ui/icon";

const PLATE_SHADOW =
  "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.12)";
const SCREW_SHADOW =
  "inset 0 1px 2px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(255,255,255,0.2), 0 1px 1px rgba(255,255,255,0.15)";
const SCREW_POSITIONS = [
  "left-2.5 top-1/2 -translate-y-1/2",
  "right-2.5 top-1/2 -translate-y-1/2",
];

/** A metal name plate, the tier's sponsors, and a dashed slot for each open place. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex flex-col gap-3 py-6 first-of-type:pt-0" },
  imports: [SponsorLogo, UiIcon],
  selector: "app-sponsor-tier",
  template: `
    @let t = tier();
    <div
      class="relative flex items-center justify-center rounded-md px-8 py-2.5"
      [style.background]="t.colors.bg"
      [style.box-shadow]="PLATE_SHADOW"
    >
      @for (pos of SCREW_POSITIONS; track pos) {
        <span
          [class]="'absolute size-2 rounded-full ' + pos"
          [style.background]="
            'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), transparent 50%), ' +
            t.colors.bg
          "
          style="border: 1px solid rgba(0, 0, 0, 0.15)"
          [style.box-shadow]="SCREW_SHADOW"
        ></span>
      }
      <h3
        class="text-xs font-extrabold uppercase tracking-[0.2em]"
        [style.color]="t.colors.text"
      >
        {{ t.name }}
      </h3>
    </div>

    <div
      class="grid gap-2 max-sm:grid-cols-[repeat(1,1fr)]! max-lg:grid-cols-[repeat(2,1fr)]!"
      [style.grid-template-columns]="columns()"
    >
      @for (sponsor of t.sponsors; track sponsor.name) {
        <a
          [href]="sponsor.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center justify-center rounded-md border p-6 transition-all hover:scale-[1.02]"
          [style.background-color]="t.colors.slotBg"
          [style.border-color]="t.colors.slotBorder"
        >
          <app-sponsor-logo [sponsor]="sponsor" />
        </a>
      }
      @for (slot of emptySlots(); track $index) {
        <a
          [href]="LINK.SPONSOR"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center rounded-md border border-dashed p-8 transition-all hover:scale-[1.02]"
          [style.border-color]="t.colors.slotBorder"
        >
          <svg
            [uiIcon]="Plus"
            class="size-5"
            [style.color]="t.colors.border"
            style="opacity: 0.5"
          ></svg>
        </a>
      }
    </div>
  `,
})
export class SponsorTier {
  readonly tier = input.required<(typeof tiers)[number]>();

  protected readonly LINK = LINK;
  protected readonly Plus = Plus;
  protected readonly PLATE_SHADOW = PLATE_SHADOW;
  protected readonly SCREW_SHADOW = SCREW_SHADOW;
  protected readonly SCREW_POSITIONS = SCREW_POSITIONS;

  protected readonly columns = computed(
    () => `repeat(${Math.min(this.tier().slots, 4)}, 1fr)`
  );
  protected readonly emptySlots = computed(() =>
    Array.from({ length: this.tier().slots - this.tier().sponsors.length })
  );
}
