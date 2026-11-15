/**
 * A port of cmdk: the input filters items, arrow keys, Home and End move the selection,
 * Enter or a click emits `select` with the item's value.
 *
 * <ui-command [filter]="filter" [(value)]="highlighted">
 *   <ui-command-input placeholder="Search theme..." />
 *   <ui-command-list>
 *     <ui-command-empty>No theme found.</ui-command-empty>
 *     <ui-command-group heading="Themes">
 *       <ui-command-item value="modern" [keywords]="['slate']" (select)="pick($event)">Modern</ui-command-item>
 *       <ui-command-item [disabled]="true">Soon</ui-command-item>
 *     </ui-command-group>
 *   </ui-command-list>
 * </ui-command>
 *
 * An item without `value` uses its text. `value` on `ui-command` is the highlighted item's value.
 * The default filter keeps items whose value or keywords contain the search, case-insensitively.
 */
import { _IdGenerator } from "@angular/cdk/a11y";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import { Search } from "lucide";

import { cn } from "@/lib/utils";
import { UiIcon } from "@/src/app/components/ui/icon";

/** cmdk's filter: a score above 0 keeps the item. */
export type CommandFilter = (
  value: string,
  search: string,
  keywords: readonly string[]
) => number;

/** Ranks like cmdk: the whole value, then a prefix, a word start, any substring, a keyword. Earlier matches win ties. */
const defaultFilter: CommandFilter = (value, search, keywords) => {
  const text = value.toLowerCase();
  const query = search.trim().toLowerCase();
  const index = text.indexOf(query);
  const earlier = index === -1 ? 0 : (1 - index / text.length) / 20;
  if (text === query) {
    return 1;
  }
  if (index === 0) {
    return 0.9;
  }
  if (text.split(/[\s/-]+/).some((word) => word.startsWith(query))) {
    return 0.7 + earlier;
  }
  if (index > 0) {
    return 0.5 + earlier;
  }
  return keywords.join(" ").toLowerCase().includes(query) ? 0.3 : 0;
};

/** Best matches first while searching, as CSS `order` so the DOM stays put. */
const orderOf = (score: number, searching: boolean) =>
  searching ? Math.round((1 - score) * 1000) : null;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(keydown)": "onKeydown($event)",
    "[class]": "classes()",
    "cmdk-root": "",
    "data-slot": "command",
    tabindex: "-1",
  },
  selector: "ui-command",
  template: "<ng-content />",
})
export class UiCommand {
  readonly filter = input<CommandFilter>(defaultFilter);
  /** The highlighted item's value. */
  readonly value = model("");
  readonly class = input("");

  readonly search = signal("");
  readonly listId = inject(_IdGenerator).getId("ui-command-list-");

  // oxlint-disable-next-line no-use-before-define -- Items and their root reference each other.
  readonly items = contentChildren(UiCommandItem, { descendants: true });
  readonly matches = computed(() =>
    this.items()
      .filter((i) => i.visible())
      .toSorted((a, b) => b.score() - a.score())
  );
  readonly active = computed<UiCommandItem | undefined>(() => {
    const enabled = this.matches().filter((i) => !i.disabled());
    const value = this.value();
    return enabled.find((i) => i.key() === value) ?? enabled[0];
  });

  protected readonly classes = computed(() =>
    cn(
      "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
      this.class()
    )
  );

  constructor() {
    effect(() => {
      const key = this.active()?.key();
      if (key !== undefined && key !== untracked(this.value)) {
        this.value.set(key);
      }
    });
    afterRenderEffect(() => {
      const item = this.active()?.el;
      if (!item) {
        return;
      }
      if (item.parentElement?.firstElementChild === item) {
        item
          .closest("[cmdk-group]")
          ?.querySelector("[cmdk-group-heading]")
          ?.scrollIntoView({ block: "nearest" });
      }
      item.scrollIntoView({ block: "nearest" });
    });
  }

  setSearch(search: string) {
    this.search.set(search);
    // The first match takes the selection, like cmdk.
    this.value.set("");
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.isComposing) {
      return;
    }
    const enabled = this.matches().filter((i) => !i.disabled());
    const active = this.active();
    const index = active ? enabled.indexOf(active) : -1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(index + 1, enabled.length - 1),
      ArrowUp: Math.max(index - 1, 0),
      End: enabled.length - 1,
      Home: 0,
    };
    const next = moves[event.key];
    if (next !== undefined) {
      event.preventDefault();
      const item = enabled[next];
      if (item) {
        this.value.set(item.key());
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      this.active()?.trigger();
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [UiIcon],
  selector: "ui-command-input",
  template: `
    <div
      data-slot="command-input-wrapper"
      class="flex h-9 items-center gap-2 border-b px-3"
    >
      <svg [uiIcon]="Search" class="size-4 shrink-0 opacity-50"></svg>
      <input
        cmdk-input
        data-slot="command-input"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        role="combobox"
        type="text"
        aria-autocomplete="list"
        aria-expanded="true"
        [attr.aria-controls]="command.listId"
        [attr.aria-activedescendant]="command.active()?.id"
        [class]="classes()"
        [placeholder]="placeholder()"
        [value]="command.search()"
        (input)="command.setSearch($any($event.target).value)"
      />
    </div>
  `,
})
export class UiCommandInput {
  readonly placeholder = input("");
  readonly class = input("");

  protected readonly command = inject(UiCommand);
  protected readonly Search = Search;
  protected readonly classes = computed(() =>
    cn(
      "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
      this.class()
    )
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
    "[id]": "command.listId",
    "aria-label": "Suggestions",
    "cmdk-list": "",
    "data-slot": "command-list",
    role: "listbox",
    tabindex: "-1",
  },
  selector: "ui-command-list",
  template: "<ng-content />",
})
export class UiCommandList {
  readonly class = input("");

  protected readonly command = inject(UiCommand);
  protected readonly classes = computed(() =>
    cn(
      "flex flex-col max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
      this.class()
    )
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.hidden]": "command.matches().length ? '' : null",
    "[class]": "classes()",
    "cmdk-empty": "",
    "data-slot": "command-empty",
    role: "presentation",
  },
  selector: "ui-command-empty",
  template: "<ng-content />",
})
export class UiCommandEmpty {
  readonly class = input("");

  protected readonly command = inject(UiCommand);
  protected readonly classes = computed(() =>
    cn("block py-6 text-center text-sm", this.class())
  );
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(click)": "trigger()",
    "(pointermove)": "highlight()",
    "[attr.aria-disabled]": "disabled()",
    "[attr.aria-selected]": "selected()",
    "[attr.data-disabled]": "disabled()",
    "[attr.data-selected]": "selected()",
    "[attr.data-value]": "key()",
    "[attr.hidden]": "visible() ? null : ''",
    "[class]": "classes()",
    "[id]": "id",
    "[style.order]": "order()",
    "cmdk-item": "",
    "data-slot": "command-item",
    role: "option",
  },
  selector: "ui-command-item",
  template: "<ng-content />",
})
export class UiCommandItem {
  readonly value = input<string>();
  readonly keywords = input<readonly string[]>([]);
  readonly disabled = input(false);
  readonly class = input("");
  readonly select = output<string>();

  readonly id = inject(_IdGenerator).getId("ui-command-item-");
  readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly command = inject(UiCommand);

  readonly score = computed(() => {
    const search = this.command.search();
    return search
      ? this.command.filter()(this.key(), search, this.keywords())
      : 1;
  });
  readonly visible = computed(() => this.score() > 0);
  protected readonly order = computed(() =>
    orderOf(this.score(), Boolean(this.command.search()))
  );
  protected readonly selected = computed(() => this.command.active() === this);
  protected readonly classes = computed(() =>
    cn(
      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      this.class()
    )
  );

  /** `value`, or the text when there is none, like cmdk. */
  key() {
    return this.value() ?? this.el.textContent?.trim() ?? "";
  }

  trigger() {
    if (!this.disabled()) {
      this.select.emit(this.key());
    }
  }

  protected highlight() {
    if (!(this.disabled() || this.selected())) {
      this.command.value.set(this.key());
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.hidden]": "visible() ? null : ''",
    "[class]": "classes()",
    "[style.order]": "order()",
    "cmdk-group": "",
    "data-slot": "command-group",
    role: "presentation",
  },
  selector: "ui-command-group",
  template: `
    @if (heading()) {
      <div cmdk-group-heading aria-hidden="true" [id]="headingId">
        {{ heading() }}
      </div>
    }
    <div
      cmdk-group-items
      class="flex flex-col"
      role="group"
      [attr.aria-labelledby]="heading() ? headingId : null"
    >
      <ng-content />
    </div>
  `,
})
export class UiCommandGroup {
  readonly heading = input<string>();
  readonly class = input("");

  protected readonly headingId =
    inject(_IdGenerator).getId("ui-command-group-");
  protected readonly classes = computed(() =>
    cn(
      "block text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
      this.class()
    )
  );

  private readonly items = contentChildren(UiCommandItem, {
    descendants: true,
  });
  protected readonly visible = computed(() =>
    this.items().some((i) => i.visible())
  );
  private readonly command = inject(UiCommand);
  protected readonly order = computed(() =>
    orderOf(
      Math.max(0, ...this.items().map((i) => i.score())),
      Boolean(this.command.search())
    )
  );
}
