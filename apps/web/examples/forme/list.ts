import { Component } from "@angular/core";

import { PdfList } from "@/registry/bases/forme/components/list/list";
import type { ListItem } from "@/registry/bases/forme/components/list/list.types";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfList],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-list variant="bullet" [items]="items" />
      </forme-page>
    </forme-document>
  `,
})
export default class ListDemo {
  protected readonly items: ListItem[] = [
    {
      description: "Match all components to the design specification.",
      text: "Design system alignment",
    },
    {
      description: "Build PDF-native components for both renderer bases.",
      text: "Component implementation",
    },
    {
      description: "Cover all variants and edge cases.",
      text: "Write unit tests",
    },
  ];
}
