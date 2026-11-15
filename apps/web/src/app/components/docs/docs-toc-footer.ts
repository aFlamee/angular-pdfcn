import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { SquarePen } from "lucide";

import { GITHUB, LINK } from "@/constants/links";
import { DOCS_DIR } from "@/lib/docs";
import { UiIcon } from "@/src/app/components/ui/icon";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex flex-col gap-2" },
  imports: [UiIcon],
  selector: "docs-toc-footer",
  template: `
    @if (docId()) {
      <a
        [href]="editUrl()"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-colors text-[0.8rem] hover:text-foreground text-muted-foreground [&_svg]:size-3 flex gap-1.5 items-center"
      >
        <svg [uiIcon]="SquarePen"></svg>
        Edit this page
      </a>
    }
  `,
})
export class DocsTocFooter {
  readonly docId = input.required<string>();

  protected readonly SquarePen = SquarePen;
  protected readonly editUrl = computed(
    () => `${LINK.GITHUB}/edit/${GITHUB.branch}/${DOCS_DIR}/${this.docId()}`
  );
}
