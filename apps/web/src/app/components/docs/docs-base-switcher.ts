import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { ROUTES } from "@/constants/routes";
import { BASES, BASE_NAMES, getBase } from "@/lib/bases";
import type { BaseName } from "@/lib/content/types";
import { BrandIcon } from "@/src/app/components/brand-icon";

// Slug depth at which a page carries the switcher: `theming/<base>` is itself a
// doc, while `components/<base>` and `blocks/<base>` only list that base's items.
const SWITCHER_SLUG_DEPTH: Record<string, number | undefined> = {
  blocks: 3,
  components: 3,
  theming: 2,
};

export const getDocsBaseSwitcherProps = (slugs: string[]) => {
  const [section = "", base = "", ...rest] = slugs;
  const depth = SWITCHER_SLUG_DEPTH[section];
  if (
    !depth ||
    rest.length + 2 < depth ||
    !BASE_NAMES.includes(base as BaseName)
  ) {
    return null;
  }
  return { base: base as BaseName, section, slug: rest.join("/") || undefined };
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex w-full items-center gap-6" },
  imports: [BrandIcon, RouterLink],
  selector: "docs-base-switcher",
  template: `
    @for (item of BASES; track item.name) {
      <a
        [routerLink]="hrefFor(item.name)"
        [attr.data-active]="base() === item.name"
        class="relative inline-flex items-center justify-center gap-1 pt-1 pb-0.5 text-base font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:bottom-[-4px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity hover:text-foreground data-[active=true]:text-foreground data-[active=true]:after:opacity-100"
      >
        {{ item.title }}
      </a>
    }
    @if (active(); as activeBase) {
      <div
        class="ml-auto shrink-0 text-muted-foreground opacity-80 [&_svg]:h-5 [&_svg]:w-fit"
      >
        <svg
          [brandIcon]="activeBase.logo"
          [attr.aria-label]="activeBase.title + ' logo'"
        ></svg>
      </div>
    }
  `,
})
export class DocsBaseSwitcher {
  readonly base = input.required<BaseName>();
  readonly section = input.required<string>();
  readonly slug = input<string>();

  protected readonly BASES = BASES;
  protected readonly active = computed(() => getBase(this.base()));

  protected hrefFor(base: BaseName) {
    const slug = this.slug();
    return `${ROUTES.DOCS}/${this.section()}/${base}${slug ? `/${slug}` : ""}`;
  }
}
