import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { ChevronDown } from "lucide";

import { SITE } from "@/constants/site";
import type { BrandIconName } from "@/lib/brand-icons";
import { BrandIcon } from "@/src/app/components/brand-icon";
import { CopyButton } from "@/src/app/components/copy-button";
import { UiButton } from "@/src/app/components/ui/button";
import {
  UiDropdownMenu,
  UiDropdownMenuContent,
  UiDropdownMenuItem,
  UiDropdownMenuTrigger,
} from "@/src/app/components/ui/dropdown-menu";
import { UiIcon } from "@/src/app/components/ui/icon";
import { UiPortal } from "@/src/app/components/ui/overlay";
import {
  UiPopover,
  UiPopoverAnchor,
  UiPopoverContent,
  UiPopoverTrigger,
} from "@/src/app/components/ui/popover";
import { UiSeparator } from "@/src/app/components/ui/separator";

const getPromptUrl = (baseURL: string, url: string, param = "q") =>
  `${baseURL}?${param}=${encodeURIComponent(
    `I'm looking at this ${SITE.NAME} documentation: ${url}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.
`
  )}`;

const MENU_ITEMS: {
  icon: BrandIconName;
  label: string;
  href: (url: string) => string;
  class?: string;
}[] = [
  {
    href: (url) => `${url}.md`,
    icon: "markdownDoc",
    label: "View as Markdown",
  },
  {
    href: (url) => getPromptUrl("https://cursor.com/link/prompt", url, "text"),
    icon: "cursor",
    label: "Open in Cursor",
  },
  {
    href: (url) => getPromptUrl("https://chatgpt.com", url),
    icon: "chatGpt",
    label: "Open in ChatGPT",
  },
  {
    href: (url) => getPromptUrl("https://claude.ai/new", url),
    icon: "claude",
    label: "Open in Claude",
  },
  {
    href: (url) => getPromptUrl("https://perplexity.ai", url),
    icon: "perplexity",
    label: "Open in Perplexity",
  },
  {
    href: (url) => getPromptUrl("https://gemini.google.com/app", url),
    icon: "gemini",
    label: "Open in Gemini",
  },
  {
    href: (url) => getPromptUrl("https://grok.com", url),
    icon: "grok",
    label: "Open in Grok",
  },
  {
    class: "m-0 p-0",
    href: (url) => getPromptUrl("https://scira.ai/", url),
    icon: "scira",
    label: "Open in Scira AI",
  },
];

const TRIGGER_CLS = "peer -ml-0.5 size-8 md:size-7 md:text-[0.8rem]";

/** Copies the page's markdown. The menu opens the page in AI tools: a dropdown from sm up, a popover below. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BrandIcon,
    CopyButton,
    UiButton,
    UiDropdownMenu,
    UiDropdownMenuContent,
    UiDropdownMenuItem,
    UiDropdownMenuTrigger,
    UiIcon,
    UiPopover,
    UiPopoverAnchor,
    UiPopoverContent,
    UiPopoverTrigger,
    UiPortal,
    UiSeparator,
  ],
  selector: "docs-copy-page",
  template: `
    <div
      uiPopover
      sounds
      uiPopoverAnchor
      class="group/buttons relative flex rounded-lg bg-secondary *:data-[slot=button]:focus-visible:relative *:data-[slot=button]:focus-visible:z-10"
    >
      <app-copy-button
        [value]="copyValue"
        [labelled]="true"
        [showTooltip]="false"
        variant="secondary"
        class="md:h-7 md:text-[0.8rem]"
        >Copy Page</app-copy-button
      >
      <ng-container uiDropdownMenu sounds>
        <button
          uiButton
          uiDropdownMenuTrigger
          type="button"
          variant="secondary"
          size="sm"
          [class]="TRIGGER_CLS + ' hidden sm:flex'"
        >
          <svg [uiIcon]="ChevronDown" class="rotate-180 sm:rotate-0"></svg>
        </button>
        <ui-dropdown-menu-content
          *uiPortal
          align="end"
          class="animate-none! rounded-lg shadow-none"
        >
          @for (item of items(); track item.label) {
            <a
              uiDropdownMenuItem
              sound="click"
              [class]="item.class ?? ''"
              [href]="item.href"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg [brandIcon]="item.icon"></svg>
              {{ item.label }}
            </a>
          }
        </ui-dropdown-menu-content>
      </ng-container>
      <ui-separator
        orientation="vertical"
        class="absolute top-1 right-8 z-0 h-6! bg-foreground/5! peer-focus-visible:opacity-0 sm:right-7 sm:h-5!"
      />
      <button
        uiButton
        uiPopoverTrigger
        type="button"
        variant="secondary"
        size="sm"
        [class]="TRIGGER_CLS + ' flex sm:hidden'"
      >
        <svg [uiIcon]="ChevronDown" class="rotate-180 sm:rotate-0"></svg>
      </button>
      <ui-popover-content
        *uiPortal
        class="w-52 origin-center! rounded-lg bg-background/70 p-1 shadow-none backdrop-blur-sm dark:bg-background/60"
        align="start"
      >
        @for (item of items(); track item.label) {
          <a
            uiButton
            variant="ghost"
            size="lg"
            sound="click"
            class="w-full justify-start text-base font-normal *:[svg]:text-muted-foreground"
            [href]="item.href"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg [brandIcon]="item.icon"></svg>
            {{ item.label }}
          </a>
        }
      </ui-popover-content>
    </div>
  `,
})
export class DocsCopyPage {
  readonly markdownUrl = input.required<string>();
  readonly url = input.required<string>();

  protected readonly ChevronDown = ChevronDown;
  protected readonly TRIGGER_CLS = TRIGGER_CLS;
  protected readonly items = computed(() =>
    MENU_ITEMS.map((item) => ({ ...item, href: item.href(this.url()) }))
  );
  protected readonly copyValue = async () => {
    const response = await fetch(this.markdownUrl());
    return response.text();
  };
}
