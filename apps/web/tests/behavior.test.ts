// Behavior the original demos never exercise, so the parity suite can't see it.
import { Component } from "@angular/core";
import { describe, expect, it } from "vitest";

import { PdfDataTable } from "@/registry/bases/forme/components/data-table/data-table";
import { PdfPageHeader } from "@/registry/bases/forme/components/page-header/page-header";
import { TABLE } from "@/registry/bases/forme/components/table/table";
import { PdfText } from "@/registry/bases/forme/components/text/text";
import { PdfcnThemeProvider } from "@/registry/bases/forme/components/theme-provider";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";
import { renderFormeDocument } from "@/registry/bases/forme/lib/render";
import { modernTheme } from "@/registry/themes/modern";

const texts = (node: unknown): string[] => {
  if (!node || typeof node !== "object") {
    return [];
  }
  const { kind, children = [] } = node as {
    kind?: { type: string; content?: string };
    children?: unknown[];
  };
  const own = kind?.type === "Text" ? [kind.content ?? ""] : [];
  return [...own, ...children.flatMap(texts)];
};

describe("forme components", () => {
  it("keeps data-table cell text free of template whitespace", () => {
    @Component({
      imports: [FormeDocument, FormePage, PdfDataTable],
      template: `<forme-document
        ><forme-page
          ><pdf-data-table [columns]="columns" [data]="rows" /></forme-page
      ></forme-document>`,
    })
    class Demo {
      protected readonly columns = [{ header: "Name", key: "name" as const }];
      protected readonly rows = [{ name: "Ada" }];
    }
    const document = renderFormeDocument(Demo);
    expect(document.children.flatMap(texts)).toStrictEqual(["Name", "Ada"]);
  });

  it("keeps a row's own stripe inside a table", () => {
    @Component({
      imports: [FormeDocument, FormePage, TABLE],
      template: `<forme-document
        ><forme-page
          ><pdf-table
            ><pdf-table-body
              ><pdf-table-row stripe
                ><pdf-table-cell>A</pdf-table-cell></pdf-table-row
              ></pdf-table-body
            ></pdf-table
          ></forme-page
        ></forme-document
      >`,
    })
    class Demo {}
    const json = JSON.stringify(renderFormeDocument(Demo));
    // The stripe is the theme's muted background on the row.
    expect(json).toContain('"backgroundColor"');
  });

  it("resolves a passed-in template's theme where it renders", () => {
    const imports = [
      FormeDocument,
      FormePage,
      PdfcnThemeProvider,
      PdfPageHeader,
      PdfText,
    ];
    @Component({
      imports,
      template: `<forme-document
        ><forme-page
          ><pdf-theme-provider [theme]="theme"
            ><ng-template #logo><pdf-text>Logo</pdf-text></ng-template
            ><pdf-page-header
              title="T"
              variant="logo-left"
              [logo]="logo" /></pdf-theme-provider></forme-page
      ></forme-document>`,
    })
    class Inside {
      protected readonly theme = modernTheme;
    }
    @Component({
      imports,
      template: `<forme-document
        ><forme-page
          ><ng-template #logo><pdf-text>Logo</pdf-text></ng-template
          ><pdf-theme-provider [theme]="theme"
            ><pdf-page-header
              title="T"
              variant="logo-left"
              [logo]="logo" /></pdf-theme-provider></forme-page
      ></forme-document>`,
    })
    class Outside {
      protected readonly theme = modernTheme;
    }
    expect(renderFormeDocument(Outside)).toStrictEqual(
      renderFormeDocument(Inside)
    );
  });
});
