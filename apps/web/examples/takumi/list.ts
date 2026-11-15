import { Component } from "@angular/core";

import { PdfList } from "@/registry/bases/takumi/components/list/list";
import type { ListItem } from "@/registry/bases/takumi/components/list/list.types";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfList],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-list variant="bullet" [items]="items" />
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
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
